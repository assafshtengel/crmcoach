
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface Participant {
  id: string;
  name: string;
  isCoach: boolean;
  hasUnread: boolean;
}

interface ConversationsListProps {
  currentUserId: string;
  isCoach: boolean;
  onSelectConversation: (participantId: string, participantName: string, participantIsCoach: boolean) => void;
}

export function ConversationsList({ 
  currentUserId, 
  isCoach, 
  onSelectConversation 
}: ConversationsListProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchParticipants = async () => {
      try {
        setLoading(true);
        
        if (isCoach) {
          // Coach: fetch all players assigned to this coach
          const { data: players, error } = await supabase
            .from('players')
            .select('id, full_name')
            .eq('coach_id', currentUserId);
            
          if (error) throw error;
          
          // Check for unread messages for each player
          const participantsWithUnread = await Promise.all(
            players.map(async (player) => {
              const { data: unreadMessages, error: unreadError } = await supabase
                .from('chat_messages')
                .select('id')
                .eq('sender_id', player.id)
                .eq('receiver_id', currentUserId)
                .eq('is_read', false);
                
              if (unreadError) throw unreadError;
              
              return {
                id: player.id,
                name: player.full_name,
                isCoach: false,
                hasUnread: unreadMessages && unreadMessages.length > 0
              };
            })
          );
          
          setParticipants(participantsWithUnread);
        } else {
          // Player: fetch coach
          const { data: player, error: playerError } = await supabase
            .from('players')
            .select('coach_id')
            .eq('id', currentUserId)
            .single();
            
          if (playerError) throw playerError;
          
          if (player?.coach_id) {
            const { data: coach, error: coachError } = await supabase
              .from('coaches')
              .select('id, full_name')
              .eq('id', player.coach_id)
              .single();
              
            if (coachError) throw coachError;
            
            // Check for unread messages from coach
            const { data: unreadMessages, error: unreadError } = await supabase
              .from('chat_messages')
              .select('id')
              .eq('sender_id', coach.id)
              .eq('receiver_id', currentUserId)
              .eq('is_read', false);
              
            if (unreadError) throw unreadError;
            
            setParticipants([{
              id: coach.id,
              name: coach.full_name,
              isCoach: true,
              hasUnread: unreadMessages && unreadMessages.length > 0
            }]);
          }
        }
      } catch (error) {
        console.error('Error fetching participants:', error);
        toast.error('שגיאה בטעינת אנשי קשר');
      } finally {
        setLoading(false);
      }
    };
    
    fetchParticipants();
    
    // Subscribe to new messages for real-time updates
    const channel = supabase
      .channel('chat_subscription')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `receiver_id=eq.${currentUserId}`
        }, 
        () => {
          fetchParticipants();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, isCoach]);

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="text-lg font-medium">אנשי קשר</h3>
      </div>
      <ScrollArea className="flex-1 p-2">
        {loading ? (
          <div className="p-4 text-center">
            <p>טוען אנשי קשר...</p>
          </div>
        ) : participants.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <p>אין אנשי קשר זמינים</p>
          </div>
        ) : (
          <div className="space-y-2">
            {participants.map((participant) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-3 rounded-md hover:bg-muted cursor-pointer"
                onClick={() => onSelectConversation(participant.id, participant.name, participant.isCoach)}
              >
                <Avatar>
                  <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{participant.name}</p>
                    {participant.hasUnread && (
                      <Badge variant="destructive" className="h-2 w-2 rounded-full p-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {participant.isCoach ? 'מאמן' : 'שחקן'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
}
