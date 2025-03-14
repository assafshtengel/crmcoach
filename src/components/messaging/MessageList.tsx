
import React, { useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export interface Message {
  id: string;
  content: string;
  sender_id: string;
  recipient_id: string;
  is_read: boolean;
  created_at: string;
  sender_name?: string;
  is_self?: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
  height?: string;
}

export const MessageList = ({ messages, currentUserId, height = "h-[400px]" }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <ScrollArea className={`w-full ${height} p-4 rounded-md`}>
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500">
          אין הודעות עדיין
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const isSelf = message.sender_id === currentUserId;
            
            return (
              <div
                key={message.id}
                className={`flex flex-col ${
                  isSelf ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    isSelf
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <span>
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: he,
                    })}
                  </span>
                  {!isSelf && (
                    <Badge
                      variant="outline"
                      className={`mr-2 ${
                        message.is_read ? "bg-green-100" : "bg-yellow-100"
                      }`}
                    >
                      {message.is_read ? "נקרא" : "לא נקרא"}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      )}
    </ScrollArea>
  );
};
