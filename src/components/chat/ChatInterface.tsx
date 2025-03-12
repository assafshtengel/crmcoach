
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface ChatInterfaceProps {
  currentUserId: string;
  participantId: string;
  participantName: string;
  isCoach: boolean;
}

export function ChatInterface({ 
  currentUserId, 
  participantId, 
  participantName,
  isCoach 
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .or(`sender_id.eq.${participantId},receiver_id.eq.${participantId}`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Filter messages to only include those between the current user and participant
      const filteredMessages = data.filter(
        msg => (msg.sender_id === currentUserId && msg.receiver_id === participantId) || 
               (msg.sender_id === participantId && msg.receiver_id === currentUserId)
      );
      
      setMessages(filteredMessages);
      
      // Mark received messages as read
      const unreadMessageIds = filteredMessages
        .filter(msg => msg.receiver_id === currentUserId && !msg.is_read)
        .map(msg => msg.id);
        
      if (unreadMessageIds.length > 0) {
        await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .in('id', unreadMessageIds);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('שגיאה בטעינת ההודעות');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('chat_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `sender_id=eq.${participantId},receiver_id=eq.${currentUserId}`
        }, 
        (payload) => {
          // Add new message to the list
          const newMsg = payload.new as Message;
          setMessages(prev => [...prev, newMsg]);
          
          // Mark as read
          supabase
            .from('chat_messages')
            .update({ is_read: true })
            .eq('id', newMsg.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, participantId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: currentUserId,
          receiver_id: participantId,
          content: newMessage.trim()
        });

      if (error) throw error;
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('שגיאה בשליחת ההודעה');
    }
  };

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b bg-muted/50">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback>{participantName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{participantName}</h3>
            <p className="text-sm text-muted-foreground">
              {isCoach ? 'מאמן' : 'שחקן'}
            </p>
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center p-4">
              <p>טוען הודעות...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center p-4 text-muted-foreground">
              <p>אין הודעות עדיין. שלח הודעה להתחיל שיחה.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.sender_id === currentUserId
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {new Date(message.created_at).toLocaleTimeString('he-IL', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      <form onSubmit={sendMessage} className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="הקלד הודעה כאן..."
            className="min-h-[80px] resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
              }
            }}
          />
          <Button type="submit" size="icon" className="h-10 w-10">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
