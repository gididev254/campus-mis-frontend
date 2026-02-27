'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Loader2, MessageCircle } from 'lucide-react';
import { messagesAPI } from '@/lib/api/messages';
import { productsAPI } from '@/lib/api/products';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import Button from '@/components/ui/Button';
import { MessageListSkeleton } from '@/components/ui/skeleton';
import MessageCard from '@/components/MessageCard';
import { toast } from '@/components/ui/Toaster';
import type { Conversation, Message, Product } from '@/types';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { socket, isConnected, onlineUsers } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creatingConversation, setCreatingConversation] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      const res = await messagesAPI.getConversations();
      setConversations(res.data.conversations || []);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      toast.error('Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchConversations();
  }, [isAuthenticated, router, fetchConversations]);

  // Handle creating a new conversation from query params (e.g., ?userId=...&productId=...)
  useEffect(() => {
    const createNewConversation = async () => {
      const targetUserId = searchParams.get('userId');
      const productId = searchParams.get('productId');

      if (!targetUserId || !productId || creatingConversation) return;

      // Don't create conversation with yourself
      if (targetUserId === user?._id) {
        toast.error('Cannot send message to yourself');
        router.replace('/messages', { scroll: false });
        return;
      }

      setCreatingConversation(true);

      try {
        // Check if product exists and get details
        const productRes = await productsAPI.getProduct(productId);
        const product = productRes.data.product;

        if (!product) {
          toast.error('Product not found');
          router.replace('/messages', { scroll: false });
          return;
        }

        // Create initial message about the product
        const initialMessage = `Hi, I'm interested in your product "${product.title}".`;
        await messagesAPI.sendMessage(targetUserId, initialMessage, productId);

        toast.success('Conversation started!');
        await fetchConversations();

        // Clear query params
        router.replace('/messages', { scroll: false });
      } catch (error: any) {
        console.error('Failed to create conversation:', error);
        toast.error(error.response?.data?.message || 'Failed to start conversation');
        router.replace('/messages', { scroll: false });
      } finally {
        setCreatingConversation(false);
      }
    };

    if (isAuthenticated && user) {
      createNewConversation();
    }
  }, [searchParams, isAuthenticated, user, fetchConversations, router, creatingConversation]);

  // Listen for new messages and conversation updates
  useEffect(() => {
    if (!socket || !isConnected) return;

    // Listen for new messages to update conversation list
    socket.on('notification:message', ({ message, unreadCount }: { message: Message; unreadCount: number }) => {
      // Update the conversation list
      setConversations((prevConversations) => {
        const senderId = message.sender._id;
        const receiverId = message.receiver._id;
        const currentUserId = JSON.parse(localStorage.getItem('user') || '{}')._id;
        const otherUserId = senderId === currentUserId ? receiverId : senderId;

        // Check if conversation already exists
        const existingIndex = prevConversations.findIndex((c) => c.user.id === otherUserId);

        if (existingIndex !== -1) {
          // Update existing conversation
          const updated = [...prevConversations];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: {
              sender: message.sender._id,
              receiver: message.receiver._id,
              product: message.product,
              content: message.content,
              isRead: message.isRead,
              createdAt: message.createdAt,
            },
            unreadCount: senderId === currentUserId ? 0 : unreadCount,
          };
          // Move to top
          return [updated[existingIndex], ...updated.filter((_, i) => i !== existingIndex)];
        } else {
          // This shouldn't happen as conversations are created on first message
          fetchConversations();
          return prevConversations;
        }
      });
    });

    return () => {
      socket.off('notification:message');
    };
  }, [socket, isConnected, fetchConversations]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
              <div className="h-8 bg-muted rounded w-48 animate-pulse" />
            </div>
          </div>

          {/* Conversations skeleton */}
          <MessageListSkeleton count={8} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Messages</h1>
          </div>
          {/* Connection status */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span>{isConnected ? 'Connected' : 'Reconnecting...'}</span>
            {creatingConversation && (
              <span className="ml-4 flex items-center text-primary">
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Creating conversation...
              </span>
            )}
          </div>
        </div>

        {/* Conversations List */}
        {conversations.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No messages yet</h2>
            <p className="text-muted-foreground mb-6">
              Start a conversation with a seller or buyer
            </p>
            <Link
              href="/products"
              className="inline-flex items-center space-x-2"
            >
              <Button>Browse Products</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => {
              const isOnline = onlineUsers.has(conversation.user.id);
              return <MessageCard key={conversation.user.id} conversation={conversation} isOnline={isOnline} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
