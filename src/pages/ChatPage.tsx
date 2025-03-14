
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Layout } from "@/components/layout/Layout";
import { ChatBox } from "@/components/messaging/ChatBox";
import { useToast } from "@/hooks/use-toast";

export default function ChatPage() {
  const { playerId } = useParams<{ playerId: string }>();
  const [playerName, setPlayerName] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPlayerName = async () => {
      if (!playerId) return;
      
      try {
        const { data, error } = await supabase
          .from("players")
          .select("full_name")
          .eq("id", playerId)
          .single();

        if (error) throw error;
        setPlayerName(data.full_name);
      } catch (error) {
        console.error("Error fetching player name:", error);
        toast({
          variant: "destructive",
          title: "שגיאה בטעינת פרטי שחקן",
          description: "לא ניתן לטעון את פרטי השחקן"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerName();
  }, [playerId, toast]);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex justify-center">
          <div className="animate-spin h-8 w-8 border-2 border-primary rounded-full border-t-transparent"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="max-w-3xl mx-auto">
          <ChatBox recipientId={playerId || ""} recipientName={playerName} isCoach={true} />
        </div>
      </div>
    </Layout>
  );
}
