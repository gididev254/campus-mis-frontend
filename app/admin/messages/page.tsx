'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Loader2, Search, Flag, MessageSquare, Users, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api/admin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import MessageViewer from '@/components/admin/MessageViewer';
import { ClientErrorBoundary } from '@/components/ClientErrorBoundary';
import { toast } from '@/components/ui/Toaster';

function AdminMessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [flaggingMessage, setFlaggingMessage] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, any> = {
        page,
        limit: 20,
      };

      if (searchQuery) {
        params.search = searchQuery;
      }

      const response = await adminAPI.getAllMessages(params);
      setMessages(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Handle message flagging
  const handleFlagMessage = useCallback(async (messageId: string, reason: string) => {
    try {
      setFlaggingMessage(messageId);
      await adminAPI.flagMessage(messageId, { reason });
      toast.success('Message flagged successfully');
    } catch (error) {
      console.error('Failed to flag message:', error);
      toast.error('Failed to flag message');
    } finally {
      setFlaggingMessage(null);
    }
  }, []);

  // Message statistics
  const messageStats = useMemo(() => {
    const stats = {
      total: total,
      unread: 0,
      today: 0,
    };

    const today = new Date().toDateString();
    messages.forEach((message) => {
      if (!message.isRead) stats.unread++;
      if (new Date(message.createdAt).toDateString() === today) stats.today++;
    });

    return stats;
  }, [messages, total]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Message Moderation</h1>
        <p className="text-muted-foreground">View user communications for dispute resolution</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messageStats.total}</div>
            <p className="text-xs text-muted-foreground">All platform messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Today's Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messageStats.today}</div>
            <p className="text-xs text-muted-foreground">Messages sent today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{messageStats.unread}</div>
            <p className="text-xs text-muted-foreground">Awaiting recipient read</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by message content..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Search messages by content. Note: This searches message text only.
          </p>
        </CardContent>
      </Card>

      {/* Messages List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : messages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No messages found</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageViewer
                key={message._id}
                message={message}
                onFlag={(reason) => handleFlagMessage(message._id, reason)}
                isFlagging={flaggingMessage === message._id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminMessages() {
  return (
    <ClientErrorBoundary>
      <AdminMessagesPage />
    </ClientErrorBoundary>
  );
}
