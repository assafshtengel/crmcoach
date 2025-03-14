
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { MessageSquare, Users, MessageCircle, Clock } from "lucide-react";
import { ChatBox } from "@/components/messaging/ChatBox";

interface Coach {
  id: string;
  full_name: string;
  unread_count?: number;
  last_message_date?: string;
}

interface GroupMessage {
  id: string;
  content: string;
  created_at: string;
  coach_id: string;
  coach_name: string;
  recipient_id: string;
  is_read: boolean;
}

export default function PlayerMessages() {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getPlayerSession = () => {
      const playerSessionStr = localStorage.getItem('playerSession');
      if (!playerSessionStr) {
        navigate('/player-auth');
        return null;
      }
      return JSON.parse(playerSessionStr);
    };

    const fetchPlayerData = async () => {
      const playerSession = getPlayerSession();
      if (!playerSession) return;

      try {
        // Fetch player's coach
        const { data: playerData, error: playerError } = await supabase
          .from("players")
          .select("coach_id, coaches:coach_id(id, full_name)")
          .eq("id", playerSession.id)
          .single();

        if (playerError) throw playerError;
        
        const coachData = playerData.coaches as { id: string; full_name: string } | null;
        
        if (coachData) {
          // Get unread message count
          const { count, error: countError } = await supabase
            .from("messages")
            .select("*", { count: "exact", head: true })
            .eq("sender_id", coachData.id)
            .eq("recipient_id", playerSession.id)
            .eq("is_read", false);

          if (countError) throw countError;

          // Get last message date
          const { data: lastMessage, error: lastMessageError } = await supabase
            .from("messages")
            .select("created_at")
            .or(`sender_id.eq.${coachData.id},recipient_id.eq.${coachData.id}`)
            .or(`sender_id.eq.${playerSession.id},recipient_id.eq.${playerSession.id}`)
            .order("created_at", { ascending: false })
            .limit(1);

          if (lastMessageError) throw lastMessageError;

          setCoach({
            ...coachData,
            unread_count: count || 0,
            last_message_date: lastMessage && lastMessage.length > 0 
              ? lastMessage[0].created_at 
              : undefined
          });
        }
      } catch (error) {
        console.error("Error fetching coach data:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת נתוני מאמן",
          description: "לא ניתן לטעון את פרטי המאמן"
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchGroupMessages = async () => {
      const playerSession = getPlayerSession();
      if (!playerSession) return;

      try {
        // Fetch group messages for this player
        const { data, error } = await supabase
          .from("message_recipients")
          .select(`
            id,
            is_read,
            group_messages:message_id (
              id,
              content,
              created_at,
              coach_id,
              coaches:coach_id (full_name)
            )
          `)
          .eq("player_id", playerSession.id)
          .order("id", { ascending: false });

        if (error) throw error;

        // Format messages
        const formattedMessages = data
          .filter(item => item.group_messages) // Filter out any null messages
          .map(item => ({
            id: item.group_messages.id,
            content: item.group_messages.content,
            created_at: item.group_messages.created_at,
            coach_id: item.group_messages.coach_id,
            coach_name: item.group_messages.coaches?.full_name || "המאמן שלך",
            recipient_id: item.id,
            is_read: item.is_read
          }));

        // Sort by read status and date
        formattedMessages.sort((a, b) => {
          if (a.is_read !== b.is_read) {
            return a.is_read ? 1 : -1; // Unread first
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        setGroupMessages(formattedMessages);
      } catch (error) {
        console.error("Error fetching group messages:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת הודעות קבוצתיות",
          description: "לא ניתן לטעון את ההודעות הקבוצתיות"
        });
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchPlayerData();
    fetchGroupMessages();

    // Set up real-time subscription for new and updated messages
    const channel = supabase
      .channel('player-messages-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, () => {
        fetchPlayerData();  // Refresh coach data with updated message counts
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages'
      }, () => {
        fetchPlayerData();  // Refresh when messages are marked as read
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'message_recipients'
      }, () => {
        fetchGroupMessages();  // Refresh group messages when new ones arrive
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'message_recipients'
      }, () => {
        fetchGroupMessages();  // Refresh when group messages are marked as read
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [navigate]);

  const handleMarkGroupMessageAsRead = async (recipientId: string) => {
    try {
      const { error } = await supabase
        .from("message_recipients")
        .update({ is_read: true })
        .eq("id", recipientId);

      if (error) throw error;

      // Update the UI optimistically
      setGroupMessages(prev => 
        prev.map(msg => 
          msg.recipient_id === recipientId 
            ? { ...msg, is_read: true } 
            : msg
        )
      );
    } catch (error) {
      console.error("Error marking message as read:", error);
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: "לא ניתן לסמן את ההודעה כנקראה"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" onClick={() => navigate("/player")}>
            חזרה לדף הבית
          </Button>
          <h1 className="text-3xl font-bold text-center flex items-center gap-2">
            <MessageCircle className="h-7 w-7" />
            הודעות
          </h1>
          <div className="w-[100px]"></div> {/* Spacer for alignment */}
        </div>

        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="direct" className="flex-1">
              <MessageSquare className="h-4 w-4 ml-2" />
              הודעות מהמאמן
            </TabsTrigger>
            <TabsTrigger value="group" className="flex-1">
              <Users className="h-4 w-4 ml-2" />
              הודעות קבוצתיות
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct">
            {loading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
              </div>
            ) : !coach ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">אין לך מאמן מוגדר במערכת.</p>
                </CardContent>
              </Card>
            ) : (
              <ChatBox 
                recipientId={coach.id} 
                recipientName={coach.full_name} 
                isCoach={false}
              />
            )}
          </TabsContent>

          <TabsContent value="group">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  הודעות קבוצתיות
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingGroups ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
                  </div>
                ) : groupMessages.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    אין הודעות קבוצתיות.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {groupMessages.map((message) => (
                      <div 
                        key={message.id}
                        className={`border rounded-lg p-4 ${
                          !message.is_read ? "bg-blue-50 border-blue-200" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium">מאת: {message.coach_name}</h3>
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                              <Clock size={14} className="ml-1" />
                              {formatDistanceToNow(new Date(message.created_at), {
                                addSuffix: true,
                                locale: he
                              })}
                            </p>
                          </div>
                          {!message.is_read && (
                            <div className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                              חדש
                            </div>
                          )}
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md my-3 whitespace-pre-wrap">
                          {message.content}
                        </div>
                        {!message.is_read && (
                          <div className="flex justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleMarkGroupMessageAsRead(message.recipient_id)}
                            >
                              סמן כנקרא
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
