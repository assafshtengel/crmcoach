
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "@/hooks/use-toast";
import { Users, ArrowRight, Check, Clock } from "lucide-react";

interface GroupMessage {
  id: string;
  content: string;
  created_at: string;
}

interface Recipient {
  id: string;
  player_id: string;
  player_name: string;
  is_read: boolean;
  read_at?: string;
}

export default function GroupMessageDetail() {
  const { messageId } = useParams<{ messageId: string }>();
  const [message, setMessage] = useState<GroupMessage | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast: showToast } = useToast();

  useEffect(() => {
    const fetchMessageDetails = async () => {
      if (!messageId) return;
      
      try {
        // Fetch the group message
        const { data: messageData, error: messageError } = await supabase
          .from("group_messages")
          .select("*")
          .eq("id", messageId)
          .single();

        if (messageError) throw messageError;
        setMessage(messageData);

        // Fetch recipients with player names
        const { data: recipientsData, error: recipientsError } = await supabase
          .from("message_recipients")
          .select(`
            id,
            player_id,
            is_read,
            updated_at,
            players:player_id (full_name)
          `)
          .eq("message_id", messageId);

        if (recipientsError) throw recipientsError;
        
        const formattedRecipients = recipientsData.map(recipient => ({
          id: recipient.id,
          player_id: recipient.player_id,
          player_name: recipient.players?.full_name || "Unknown Player",
          is_read: recipient.is_read,
          read_at: recipient.is_read ? recipient.updated_at : undefined
        }));

        // Sort by read status and then by name
        formattedRecipients.sort((a, b) => {
          if (a.is_read !== b.is_read) {
            return a.is_read ? 1 : -1; // Unread first
          }
          return a.player_name.localeCompare(b.player_name);
        });

        setRecipients(formattedRecipients);
      } catch (error) {
        console.error("Error fetching message details:", error);
        showToast({
          variant: "destructive",
          title: "שגיאה בטעינת פרטי הודעה",
          description: "לא ניתן לטעון את פרטי ההודעה"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMessageDetails();

    // Set up real-time subscription for message recipient status changes
    const channel = supabase
      .channel('message-recipients-changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'message_recipients',
        filter: `message_id=eq.${messageId}`
      }, () => {
        fetchMessageDetails();  // Refresh recipients list with updated read status
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [messageId, showToast]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  if (!message) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-xl font-semibold">הודעה לא נמצאה</h2>
            <p className="mt-2 text-muted-foreground">ההודעה המבוקשת אינה קיימת או שאין לך גישה אליה</p>
            <Button variant="outline" onClick={() => navigate("/messages")} className="mt-4">
              חזרה לרשימת ההודעות
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  const readCount = recipients.filter(r => r.is_read).length;
  const totalCount = recipients.length;

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Button variant="outline" onClick={() => navigate("/messages")}>
              <ArrowRight className="h-4 w-4 ml-2" />
              חזרה לרשימת ההודעות
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6" />
              פרטי הודעה קבוצתית
            </h1>
            <div className="w-[120px]"></div> {/* Spacer for alignment */}
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users size={20} />
                    תוכן ההודעה
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(message.created_at), {
                      addSuffix: true,
                      locale: he
                    })}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 p-4 rounded-md whitespace-pre-wrap">
                  {message.content}
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    נשלח ל-{totalCount} שחקנים
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Check size={16} className="text-green-500" />
                    <span>
                      {readCount}/{totalCount} נקראו
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  רשימת נמענים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                  {recipients.map((recipient) => (
                    <div 
                      key={recipient.id}
                      className="border rounded-md p-3 flex justify-between items-center"
                    >
                      <div>
                        <div className="font-medium">{recipient.player_name}</div>
                        {recipient.is_read && recipient.read_at && (
                          <div className="text-xs text-muted-foreground flex items-center mt-1">
                            <Clock size={12} className="ml-1" />
                            נקרא: {formatDistanceToNow(new Date(recipient.read_at), {
                              addSuffix: true,
                              locale: he
                            })}
                          </div>
                        )}
                      </div>
                      <Badge 
                        variant={recipient.is_read ? "outline" : "default"}
                        className={recipient.is_read ? "bg-green-100" : ""}
                      >
                        {recipient.is_read ? "נקרא" : "לא נקרא"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
