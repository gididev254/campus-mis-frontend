'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { Loader2, MessageCircle, Send, ArrowLeft, AlertCircle, Check, CheckCheck, Circle } from 'lucide-react';
import { messagesAPI } from '@/lib/api/messages';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import type { Message, User } from '@/types';
import { ClientErrorBoundary } from '@/components/ClientErrorBoundary';

export default function BuyerMessagesPage() {
  return (
    <ClientErrorBoundary>
      <BuyerMessagesPageContent />
    </ClientErrorBoundary>
  );
}

function BuyerMessagesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { socket, isConnected, onlineUsers, isReconnecting, emitWithQueue, queuedMessageCount } = useSocket();

  const targetUserId = searchParams.get('userId');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [messageQueued, setMessageQueued] = useState(false);

  // Fetch initial messages
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (targetUserId) {
      fetchMessages();
    }
  }, [isAuthenticated, targetUserId, router]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join conversation room
  useEffect(() => {
    if (socket && isConnected && targetUserId && user?._id) {
      const roomName = [user._id, targetUserId].sort().join(':');

      // Join the conversation room
      socket.emit('join:conversation', { userId: targetUserId });

      // Listen for new messages
      socket.on('message:new', (message: Message) => {
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some((m) => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      });

      // Listen for typing indicators
      socket.on('typing:start', ({ userId }: { userId: string }) => {
        if (userId === targetUserId) {
          setOtherUserTyping(true);
        }
      });

      socket.on('typing:stop', ({ userId }: { userId: string }) => {
        if (userId === targetUserId) {
          setOtherUserTyping(false);
        }
      });

      // Listen for read receipts
      socket.on('message:read', ({ messageId }: { messageId: string }) => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, isRead: true, readAt: new Date().toISOString() } : msg
          )
        );
      });

      // Cleanup
      return () => {
        socket.emit('leave:conversation', { userId: targetUserId });
        socket.off('message:new');
        socket.off('typing:start');
        socket.off('typing:stop');
        socket.off('message:read');
      };
    }
  }, [socket, isConnected, targetUserId, user?._id]);

  const fetchMessages = async () => {
    try {
      const res = await messagesAPI.getConversation(targetUserId as string);
      setMessages(res.data.data || []);
      if (res.data.data.length > 0) {
        const msg = res.data.data[0];
        setOtherUser(msg.sender._id === targetUserId ? msg.sender : msg.receiver);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
        toast.error('Failed to load messages.');
      setError('Failed to load messages. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = () => {
    if (!socket || !isConnected || !targetUserId) return;

    // Use emitWithQueue for typing indicators
    emitWithQueue('typing:start', { userId: targetUserId });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing stop after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isConnected) {
        emitWithQueue('typing:stop', { userId: targetUserId });
      }
    }, 2000);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (socket && isConnected) {
      socket.emit('typing:stop', { userId: targetUserId });
    }

    setSending(true);
    setError('');

    // Optimistic update
    const tempMessage: Message = {
      _id: `temp-${Date.now()}`,
      sender: { _id: user?._id || '', name: user?.name || '', email: user?.email || '', role: user?.role || 'buyer', phone: user?.phone || '', avatar: user?.avatar },
      receiver: { _id: targetUserId || '', name: otherUser?.name || '', email: otherUser?.email || '', role: otherUser?.role || 'seller', phone: otherUser?.phone || '', avatar: otherUser?.avatar },
      content: newMessage,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    setMessages((prev) => [...prev, tempMessage]);
    const messageContent = newMessage;
    setNewMessage('');

    try {
      await messagesAPI.sendMessage({
        receiver: targetUserId as string,
        content: messageContent,
      });
      // Message will be added via socket event
    } catch (err: unknown) {
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m._id !== tempMessage._id));
      const message = err instanceof Error && 'response' in err
        ? (err as Error & { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to send message'
        : 'Failed to send message';
      setError(message);
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const isUserOnline = otherUser && onlineUsers.has(otherUser._id);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="p-2"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-3">
              {otherUser && (
                <Avatar
                  src={otherUser.avatar}
                  alt={otherUser.name}
                  size="md"
                  showOnlineStatus
                  isOnline={isUserOnline}
                />
              )}
              <div>
                <h1 className="text-2xl font-bold flex items-center space-x-2">
                  <span>{otherUser?.name || 'Messages'}</span>
                  {isUserOnline && (
                    <span className="text-sm font-normal text-green-500 flex items-center">
                      <Circle className="h-2 w-2 fill-current mr-1" />
                      Online
                    </span>
                  )}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {otherUserTyping ? (
                    <span className="text-primary animate-pulse">Typing...</span>
                  ) : isReconnecting ? (
                    <span className="text-yellow-500 animate-pulse">Reconnecting...</span>
                  ) : (
                    isUserOnline ? 'Active now' : 'Offline'
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Connection status */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : isReconnecting ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
            <span>
              {isConnected ? 'Connected' : isReconnecting ? `Reconnecting...` : 'Disconnected'}
              {queuedMessageCount > 0 && ` (${queuedMessageCount} queued)`}
            </span>
          </div>
        </div>

        {/* Messages */}
        <div className="rounded-lg border bg-card p-6">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-4 mb-6 max-h-[60vh] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.sender._id === user?._id;
                const isTemp = message._id.startsWith('temp-');
                return (
                  <div
                    key={message._id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                      <div
                        className={`rounded-lg p-4 ${
                          isOwn
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        } ${isTemp ? 'opacity-60' : ''}`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                        {message.product && (
                          <Link
                            href={`/products/${message.product._id}`}
                            className="text-xs underline opacity-80 hover:opacity-100 inline-block mt-2"
                          >
                            View Product
                          </Link>
                        )}
                      </div>
                      <div className="flex items-center justify-end space-x-1 mt-1 px-2">
                        <p className="text-xs text-muted-foreground">
                          {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        {isOwn && (
                          <span className="text-xs">
                            {message.isRead ? (
                              <CheckCheck className="h-3 w-3 text-blue-500 inline" />
                            ) : (
                              <Check className="h-3 w-3 text-muted-foreground inline" />
                            )}
                          </span>
                        )}
                        {isTemp && (
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="flex space-x-3">
            <Input
              type="text"
              value={newMessage}
              onChange={(e) => {
                setNewMessage(e.target.value);
                handleTyping();
              }}
              placeholder={
                isReconnecting
                  ? 'Reconnecting to server...'
                  : queuedMessageCount > 0
                  ? `Sending ${queuedMessageCount} queued message${queuedMessageCount > 1 ? 's' : ''}...`
                  : 'Type a message...'
              }
              className="flex-1"
              disabled={sending || isReconnecting}
            />
            <Button
              type="submit"
              disabled={sending || !newMessage.trim() || isReconnecting}
              isLoading={sending}
              className="px-4"
              title={
                isReconnecting
                  ? 'Waiting for connection...'
                  : queuedMessageCount > 0
                  ? `${queuedMessageCount} message${queuedMessageCount > 1 ? 's' : ''} in queue`
                  : 'Send message'
              }
            >
              <Send className="h-5 w-5" />
              {queuedMessageCount > 0 && (
                <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-0.5 rounded-full">
                  {queuedMessageCount}
                </span>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
