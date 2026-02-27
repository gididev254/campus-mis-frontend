'use client';

import { memo, useState, useCallback } from 'react';
import { Flag, User, MessageSquare, Calendar, Package, Send, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Textarea } from '@/components/ui/Textarea';
import { formatDate } from '@/lib/utils';

interface MessageViewerProps {
  message: any;
  onFlag: (reason: string) => void;
  isFlagging?: boolean;
}

const MessageViewer = memo(function MessageViewer({
  message,
  onFlag,
  isFlagging = false,
}: MessageViewerProps) {
  const [showFlagDialog, setShowFlagDialog] = useState(false);
  const [flagReason, setFlagReason] = useState('');

  const handleFlagSubmit = useCallback(() => {
    if (flagReason.trim()) {
      onFlag(flagReason);
      setShowFlagDialog(false);
      setFlagReason('');
    }
  }, [flagReason, onFlag]);

  return (
    <Card className={isFlagging ? 'opacity-50' : ''}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <Badge variant={message.isRead ? 'outline' : 'default'}>
                {message.isRead ? 'Read' : 'Unread'}
              </Badge>
              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(message.createdAt)}</span>
              </div>
            </div>

            {/* Sender and Receiver */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>
                  <span className="font-medium">{message.sender?.name}</span>
                  <span className="text-muted-foreground"> → </span>
                  <span className="font-medium">{message.receiver?.name}</span>
                </span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFlagDialog(!showFlagDialog)}
            className="flex items-center space-x-1"
          >
            <Flag className="h-4 w-4" />
            <span className="hidden sm:inline">
              {showFlagDialog ? 'Cancel' : 'Flag'}
            </span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Product context (if any) */}
        {message.product && (
          <div className="mb-3 p-3 bg-muted rounded-lg">
            <div className="flex items-center space-x-2 text-sm">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Regarding:</span>
              <span className="font-medium">{message.product.title}</span>
            </div>
          </div>
        )}

        {/* Message content */}
        <div className="mb-3 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-start space-x-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground mt-1" />
            <p className="text-sm flex-1">{message.content}</p>
          </div>
        </div>

        {/* Flag dialog */}
        {showFlagDialog && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
            <div className="flex items-start space-x-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Flag this message
                </h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                  This will mark the message for review due to policy violation or inappropriate content.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <Textarea
                placeholder="Reason for flagging this message..."
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                rows={3}
                className="text-sm"
              />
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  onClick={handleFlagSubmit}
                  disabled={isFlagging || !flagReason.trim()}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {isFlagging ? 'Flagging...' : 'Submit Flag'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setShowFlagDialog(false);
                    setFlagReason('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Message metadata */}
        <div className="mt-3 text-xs text-muted-foreground">
          Message ID: {message._id}
        </div>
      </CardContent>
    </Card>
  );
});

export default MessageViewer;
