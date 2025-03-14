
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Send, Users } from "lucide-react";

interface Player {
  id: string;
  full_name: string;
}

export const GroupMessageForm = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingPlayers, setLoadingPlayers] = useState(true);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData?.user?.id) return;

        const { data, error } = await supabase
          .from("players")
          .select("id, full_name")
          .eq("coach_id", userData.user.id)
          .order("full_name");

        if (error) throw error;
        setPlayers(data || []);
      } catch (error) {
        console.error("Error fetching players:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת שחקנים",
          description: "לא ניתן לטעון את רשימת השחקנים"
        });
      } finally {
        setLoadingPlayers(false);
      }
    };

    fetchPlayers();
  }, []);

  const handleSelectAll = () => {
    if (selectedPlayers.length === players.length) {
      setSelectedPlayers([]);
    } else {
      setSelectedPlayers(players.map(player => player.id));
    }
  };

  const handleTogglePlayer = (playerId: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const handleSendMessage = async () => {
    if (message.trim() === "" || selectedPlayers.length === 0 || loading) return;
    
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user?.id) throw new Error("User not authenticated");

      // Create a group message
      const { data: groupMessageData, error: groupMessageError } = await supabase
        .from("group_messages")
        .insert({
          coach_id: userData.user.id,
          content: message
        })
        .select()
        .single();

      if (groupMessageError) throw groupMessageError;

      // Add recipients
      const recipientsToInsert = selectedPlayers.map(playerId => ({
        message_id: groupMessageData.id,
        player_id: playerId,
        is_read: false
      }));

      const { error: recipientsError } = await supabase
        .from("message_recipients")
        .insert(recipientsToInsert);

      if (recipientsError) throw recipientsError;

      toast({
        title: "הודעה נשלחה בהצלחה",
        description: `הודעה נשלחה ל-${selectedPlayers.length} שחקנים`
      });

      setMessage("");
    } catch (error) {
      console.error("Error sending group message:", error);
      toast({
        variant: "destructive",
        title: "שגיאה בשליחת ההודעה",
        description: "לא ניתן לשלוח את ההודעה הקבוצתית"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users size={20} />
          הודעה קבוצתית
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center mb-2">
              <h3 className="text-sm font-medium">בחר שחקנים</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleSelectAll}
                className="mr-2 text-xs"
                disabled={loadingPlayers}
              >
                {selectedPlayers.length === players.length ? "הסר הכל" : "בחר הכל"}
              </Button>
            </div>
            
            {loadingPlayers ? (
              <div className="flex justify-center p-4">
                <div className="animate-spin h-6 w-6 border-2 border-primary rounded-full border-t-transparent"></div>
              </div>
            ) : (
              <div className="max-h-40 overflow-y-auto border rounded-md p-2 space-y-2">
                {players.length === 0 ? (
                  <p className="text-center text-muted-foreground">לא נמצאו שחקנים</p>
                ) : (
                  players.map(player => (
                    <div key={player.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox 
                        id={`player-${player.id}`}
                        checked={selectedPlayers.includes(player.id)}
                        onCheckedChange={() => handleTogglePlayer(player.id)}
                      />
                      <label 
                        htmlFor={`player-${player.id}`}
                        className="text-sm mr-2 cursor-pointer"
                      >
                        {player.full_name}
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="group-message" className="text-sm font-medium block mb-2">
              תוכן ההודעה
            </label>
            <Textarea
              id="group-message"
              placeholder="הקלד את תוכן ההודעה הקבוצתית..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[120px]"
              dir="rtl"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full flex items-center gap-2" 
          onClick={handleSendMessage}
          disabled={message.trim() === "" || selectedPlayers.length === 0 || loading}
        >
          <Send size={16} />
          שלח הודעה קבוצתית
          {selectedPlayers.length > 0 && ` (${selectedPlayers.length} נמענים)`}
        </Button>
      </CardFooter>
    </Card>
  );
};
