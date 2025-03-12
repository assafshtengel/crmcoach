
import React, { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ConversationsList } from '@/components/chat/ConversationsList';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function ChatPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isCoach, setIsCoach] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedParticipant, setSelectedParticipant] = useState<{
    id: string;
    name: string;
    isCoach: boolean;
  } | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          toast.error('יש להתחבר כדי לראות את הצ\'אט');
          return;
        }
        
        setCurrentUserId(user.id);
        
        // Check if the user is a coach
        const { data: coach } = await supabase
          .from('coaches')
          .select('id')
          .eq('id', user.id)
          .single();
          
        setIsCoach(!!coach);
      } catch (error) {
        console.error('Error checking authentication:', error);
        toast.error('שגיאה בבדיקת הרשאות');
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const handleSelectConversation = (participantId: string, participantName: string, participantIsCoach: boolean) => {
    setSelectedParticipant({
      id: participantId,
      name: participantName,
      isCoach: participantIsCoach
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-10">
          <div className="flex justify-center items-center h-[70vh]">
            <p>טוען...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!currentUserId) {
    return (
      <Layout>
        <div className="container py-10">
          <div className="flex justify-center items-center h-[70vh]">
            <p>יש להתחבר כדי לראות את הצ'אט</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">צ'אט</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[70vh]">
          <div className="md:col-span-1 h-full">
            <ConversationsList 
              currentUserId={currentUserId}
              isCoach={isCoach}
              onSelectConversation={handleSelectConversation}
            />
          </div>
          
          <div className="md:col-span-2 h-full">
            {selectedParticipant ? (
              <ChatInterface 
                currentUserId={currentUserId}
                participantId={selectedParticipant.id}
                participantName={selectedParticipant.name}
                isCoach={selectedParticipant.isCoach}
              />
            ) : (
              <div className="flex items-center justify-center h-full bg-muted/30 rounded-lg">
                <p className="text-muted-foreground">בחר שיחה מהרשימה כדי להתחיל</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
