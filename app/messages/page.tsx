'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, MessageCircle } from 'lucide-react';
import { messagesAPI } from '@/lib/api/messages';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import Button from '@/components/ui/Button';
import { MessageListSkeleton } from '@/components/ui/skeleton';
import MessageCard from '@/components/MessageCard';
import { toast } from '@/components/ui/Toaster';

interface Conversation {
  user: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { socket, isConnected, onlineUsers } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

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
        const existingIndex = prevConversations.findIndex((c) => c.user._id === otherUserId);

        if (existingIndex !== -1) {
          // Update existing conversation
          const updated = [...prevConversations];
          updated[existingIndex] = {
            ...updated[existingIndex],
            lastMessage: {
              content: message.content,
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
              const isOnline = onlineUsers.has(conversation.user._id);
              return <MessageCard key={conversation.user._id} conversation={conversation} isOnline={isOnline} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
