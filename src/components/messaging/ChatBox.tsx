
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { MessageList, Message } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { MessageSquare, ArrowRight } from "lucide-react";

interface ChatBoxProps {
  recipientId: string;
  recipientName: string;
  isCoach?: boolean;
}

export const ChatBox = ({ 
  recipientId, 
  recipientName,
  isCoach = false 
}: ChatBoxProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user?.id) return;

        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .or(`sender_id.eq.${userData.user.id},recipient_id.eq.${userData.user.id}`)
          .or(`sender_id.eq.${recipientId},recipient_id.eq.${recipientId}`)
          .order("created_at");

        if (error) throw error;

        // Mark messages as read if current user is the recipient
        const unreadMessages = data?.filter(
          msg => msg.recipient_id === userData.user.id && !msg.is_read
        ) || [];

        if (unreadMessages.length > 0) {
          for (const msg of unreadMessages) {
            await supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", msg.id);
          }
        }

        setMessages(data?.map(msg => ({
          ...msg,
          is_self: msg.sender_id === userData.user.id
        })) || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת הודעות",
          description: "לא ניתן לטעון את היסטוריית ההודעות"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('messages-channel')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, (payload) => {
        // Only add message if it's part of this conversation
        const newMessage = payload.new as Message;
        if ((newMessage.sender_id === recipientId && newMessage.recipient_id === supabase.auth.getUser()?.data?.user?.id) ||
            (newMessage.recipient_id === recipientId && newMessage.sender_id === supabase.auth.getUser()?.data?.user?.id)) {
          
          // Mark as read if recipient is the current user
          if (newMessage.recipient_id === supabase.auth.getUser()?.data?.user?.id) {
            supabase
              .from("messages")
              .update({ is_read: true })
              .eq("id", newMessage.id);
            
            newMessage.is_read = true;
          }
          
          setMessages(prev => [...prev, {
            ...newMessage,
            is_self: newMessage.sender_id === supabase.auth.getUser()?.data?.user?.id
          }]);
        }
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [recipientId]);

  const handleSendMessage = async (content: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) throw new Error("User not authenticated");

      const { error } = await supabase.from("messages").insert({
        sender_id: userData.user.id,
        recipient_id: recipientId,
        content
      });

      if (error) throw error;
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בשליחת ההודעה",
        description: "לא ניתן לשלוח את ההודעה"
      });
      throw error;
    }
  };

  const backToList = () => {
    if (isCoach) {
      navigate("/messages");
    } else {
      navigate("/player/messages");
    }
  };

  return (
    <Card className="shadow-md w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <Button variant="ghost" size="sm" onClick={backToList}>
            <ArrowRight className="h-4 w-4 ml-1" />
            חזרה
          </Button>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare size={20} />
            שיחה עם {recipientName}
          </CardTitle>
          <div className="w-[60px]"></div> {/* Spacer for alignment */}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <>
            <MessageList 
              messages={messages} 
              currentUserId={supabase.auth.getUser()?.data?.user?.id || ""}
            />
            <MessageInput 
              onSendMessage={handleSendMessage}
              placeholder={`שלח הודעה ל${recipientName}...`}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
