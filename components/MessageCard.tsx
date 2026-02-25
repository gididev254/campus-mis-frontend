'use client';

import Link from 'next/link';
import Avatar from '@/components/Avatar';
import { Circle } from 'lucide-react';
import { memo, useMemo } from 'react';

interface MessageCardProps {
  conversation: {
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
  };
  isOnline: boolean;
}

const MessageCard = memo(function MessageCard({ conversation, isOnline }: MessageCardProps) {
  const formattedDate = useMemo(() => {
    return conversation.lastMessage
      ? new Date(conversation.lastMessage.createdAt).toLocaleDateString()
      : '';
  }, [conversation.lastMessage]);

  const lastMessagePreview = conversation.lastMessage?.content || 'No messages yet';
  const unreadLabel = conversation.unreadCount > 0
    ? ` with ${conversation.unreadCount} unread messages`
    : '';

  return (
    <Link
      href={`/buyer/messages?userId=${conversation.user._id}`}
      className="block rounded-lg border bg-card p-4 hover:bg-accent transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      aria-label={`Chat with ${conversation.user.name}${isOnline ? ', online' : ''}${unreadLabel}. Last message: ${lastMessagePreview}`}
    >
      <article className="flex items-center space-x-4">
        {/* Avatar */}
        <Avatar
          src={conversation.user.avatar}
          alt={conversation.user.name}
          size="lg"
          showOnlineStatus
          isOnline={isOnline}
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold truncate" id={`conversation-${conversation.user._id}-name`}>
                {conversation.user.name}
              </h3>
              {isOnline && (
                <span className="text-xs text-green-500 flex items-center" aria-label="Online now">
                  <Circle className="h-2 w-2 fill-current mr-1" aria-hidden="true" />
                  <span>Online</span>
                </span>
              )}
            </div>
            <time
              className="text-xs text-muted-foreground"
              dateTime={conversation.lastMessage?.createdAt}
              aria-label={`Last message on ${formattedDate}`}
            >
              {formattedDate}
            </time>
          </div>
          <p
            className="text-sm text-muted-foreground truncate"
            aria-labelledby={`conversation-${conversation.user._id}-name`}
          >
            {lastMessagePreview}
          </p>
        </div>

        {/* Unread Badge */}
        {conversation.unreadCount > 0 && (
          <div className="flex-shrink-0">
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium"
              aria-label={`${conversation.unreadCount} unread messages`}
            >
              {conversation.unreadCount}
            </span>
          </div>
        )}
      </article>
    </Link>
  );
});

export default MessageCard;
