
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { MessageSquare, Users, MessageCircle, Clock } from "lucide-react";
import { GroupMessageForm } from "@/components/messaging/GroupMessageForm";

interface Player {
  id: string;
  full_name: string;
  unread_count?: number;
  last_message_date?: string;
}

interface GroupMessage {
  id: string;
  content: string;
  created_at: string;
  recipients_count: number;
  read_count: number;
}

export default function Messages() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user?.id) return;

        // Fetch players associated with the coach
        const { data: playersData, error: playersError } = await supabase
          .from("players")
          .select("id, full_name")
          .eq("coach_id", userData.user.id)
          .order("full_name");

        if (playersError) throw playersError;

        // For each player, check unread messages count
        if (playersData) {
          const playersWithMessages = await Promise.all(
            playersData.map(async (player) => {
              const { count, error } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true })
                .eq("sender_id", player.id)
                .eq("recipient_id", userData.user.id)
                .eq("is_read", false);

              // Get last message date
              const { data: lastMessage, error: lastMessageError } = await supabase
                .from("messages")
                .select("created_at")
                .or(`sender_id.eq.${player.id},recipient_id.eq.${player.id}`)
                .or(`sender_id.eq.${userData.user.id},recipient_id.eq.${userData.user.id}`)
                .order("created_at", { ascending: false })
                .limit(1);

              return {
                ...player,
                unread_count: count || 0,
                last_message_date: lastMessage && lastMessage.length > 0 
                  ? lastMessage[0].created_at 
                  : null
              };
            })
          );

          // Sort players - first by unread messages, then by last message date
          playersWithMessages.sort((a, b) => {
            if (a.unread_count !== b.unread_count) {
              return (b.unread_count || 0) - (a.unread_count || 0);
            }
            if (a.last_message_date && b.last_message_date) {
              return new Date(b.last_message_date).getTime() - new Date(a.last_message_date).getTime();
            }
            return 0;
          });

          setPlayers(playersWithMessages);
        }
      } catch (error) {
        console.error("Error fetching players:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת שחקנים",
          description: "לא ניתן לטעון את רשימת השחקנים"
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchGroupMessages = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user?.id) return;

        // Fetch group messages sent by the coach
        const { data: messagesData, error: messagesError } = await supabase
          .from("group_messages")
          .select("*")
          .eq("coach_id", userData.user.id)
          .order("created_at", { ascending: false });

        if (messagesError) throw messagesError;

        // For each group message, get recipient counts
        if (messagesData) {
          const messagesWithStats = await Promise.all(
            messagesData.map(async (message) => {
              // Get total recipient count
              const { count: totalCount, error: totalError } = await supabase
                .from("message_recipients")
                .select("*", { count: "exact", head: true })
                .eq("message_id", message.id);

              // Get read count
              const { count: readCount, error: readError } = await supabase
                .from("message_recipients")
                .select("*", { count: "exact", head: true })
                .eq("message_id", message.id)
                .eq("is_read", true);

              return {
                ...message,
                recipients_count: totalCount || 0,
                read_count: readCount || 0
              };
            })
          );

          setGroupMessages(messagesWithStats);
        }
      } catch (error) {
        console.error("Error fetching group messages:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת הודעות קבוצתיות",
          description: "לא ניתן לטעון את רשימת ההודעות הקבוצתיות"
        });
      } finally {
        setLoadingGroups(false);
      }
    };

    fetchPlayers();
    fetchGroupMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('messages-changes')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages' 
      }, () => {
        fetchPlayers();  // Refresh players list with updated message counts
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages'
      }, () => {
        fetchPlayers();  // Refresh when messages are marked as read
      })
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'group_messages'
      }, () => {
        fetchGroupMessages();  // Refresh group messages
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
  }, []);

  const handleChatWithPlayer = (playerId: string) => {
    navigate(`/chat/${playerId}`);
  };

  const handleViewGroupMessage = (messageId: string) => {
    navigate(`/group-message/${messageId}`);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
          <MessageCircle className="h-8 w-8" />
          מערכת הודעות
        </h1>

        <Tabs defaultValue="direct" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="direct" className="flex-1">
              <MessageSquare className="h-4 w-4 ml-2" />
              הודעות ישירות
            </TabsTrigger>
            <TabsTrigger value="group" className="flex-1">
              <Users className="h-4 w-4 ml-2" />
              הודעות קבוצתיות
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare size={20} />
                  רשימת שחקנים
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-8">
                    <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
                  </div>
                ) : players.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    לא נמצאו שחקנים. הוסף שחקנים כדי להתחיל בשיחה.
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {players.map((player) => (
                      <div 
                        key={player.id}
                        className={`border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50 cursor-pointer transition-colors ${
                          player.unread_count ? "bg-blue-50 border-blue-200" : ""
                        }`}
                        onClick={() => handleChatWithPlayer(player.id)}
                      >
                        <div>
                          <h3 className="font-medium">{player.full_name}</h3>
                          {player.last_message_date && (
                            <p className="text-sm text-muted-foreground flex items-center mt-1">
                              <Clock size={14} className="ml-1" />
                              התכתבות אחרונה: {formatDistanceToNow(new Date(player.last_message_date), {
                                addSuffix: true,
                                locale: he
                              })}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center">
                          {player.unread_count ? (
                            <div className="bg-primary text-primary-foreground rounded-full h-6 min-w-[1.5rem] flex items-center justify-center text-xs font-medium mr-2">
                              {player.unread_count}
                            </div>
                          ) : null}
                          <Button size="sm">שיחה</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="group">
            <div className="grid gap-6 md:grid-cols-2">
              <GroupMessageForm />

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} />
                    הודעות קבוצתיות שנשלחו
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingGroups ? (
                    <div className="flex justify-center p-8">
                      <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
                    </div>
                  ) : groupMessages.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground">
                      לא נשלחו הודעות קבוצתיות עדיין.
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {groupMessages.map((message) => (
                        <div 
                          key={message.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                          onClick={() => handleViewGroupMessage(message.id)}
                        >
                          <div className="flex justify-between mb-1">
                            <span className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(message.created_at), {
                                addSuffix: true,
                                locale: he
                              })}
                            </span>
                            <span className="text-sm font-medium">
                              {message.read_count}/{message.recipients_count} נקראו
                            </span>
                          </div>
                          <p className="line-clamp-2">{message.content}</p>
                          <div className="mt-2 flex justify-end">
                            <Button size="sm" variant="outline">
                              פרטים
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
