
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface Conversation {
  id: string;
  participantId: string;
  participantName: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
  isCoach: boolean;
}

interface ConversationsListProps {
  currentUserId: string;
  isCoach: boolean;
  onSelectConversation: (participantId: string, participantName: string, isCoach: boolean) => void;
}

export function ConversationsList({ 
  currentUserId, 
  isCoach, 
  onSelectConversation 
}: ConversationsListProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState<{id: string, full_name: string, isCoach: boolean}[]>([]);

  useEffect(() => {
    // First, fetch all possible participants (coaches or players)
    const fetchParticipants = async () => {
      try {
        let data;
        if (isCoach) {
          // Coach sees their players
          const { data: playersData, error: playersError } = await supabase
            .from('players')
            .select('id, full_name')
            .eq('coach_id', currentUserId);
            
          if (playersError) throw playersError;
          data = (playersData || []).map(p => ({ ...p, isCoach: false }));
        } else {
          // Player sees their coach
          const { data: playerData, error: playerError } = await supabase
            .from('players')
            .select('coach_id')
            .eq('id', currentUserId)
            .single();
            
          if (playerError) throw playerError;
          
          if (playerData?.coach_id) {
            const { data: coachData, error: coachError } = await supabase
              .from('coaches')
              .select('id, full_name')
              .eq('id', playerData.coach_id)
              .single();
              
            if (coachError) throw coachError;
            data = coachData ? [{ ...coachData, isCoach: true }] : [];
          } else {
            data = [];
          }
        }
        
        setParticipants(data || []);
      } catch (error) {
        console.error('Error fetching participants:', error);
        toast.error('שגיאה בטעינת המשתתפים');
      }
    };

    fetchParticipants();
  }, [currentUserId, isCoach]);

  // Fetch latest messages when participants change
  useEffect(() => {
    const fetchLatestMessages = async () => {
      if (!participants.length) return;
      
      try {
        setLoading(true);
        
        // Get last message for each participant
        const participantIds = participants.map(p => p.id);
        
        const { data: messagesData, error: messagesError } = await supabase
          .from('chat_messages')
          .select('*')
          .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
          .or(`sender_id.in.(${participantIds.join(',')}),receiver_id.in.(${participantIds.join(',')})`)
          .order('created_at', { ascending: false });
          
        if (messagesError) throw messagesError;
        
        // Process messages into conversations
        const convMap = new Map<string, Conversation>();
        
        // Initialize with all participants (even if no messages yet)
        participants.forEach(participant => {
          convMap.set(participant.id, {
            id: `${currentUserId}-${participant.id}`,
            participantId: participant.id,
            participantName: participant.full_name,
            lastMessage: '',
            timestamp: '',
            unread: false,
            isCoach: participant.isCoach
          });
        });
        
        // Update with message data if available
        if (messagesData && messagesData.length > 0) {
          messagesData.forEach(message => {
            const otherPartyId = message.sender_id === currentUserId ? message.receiver_id : message.sender_id;
            
            // Skip if not a direct participant
            if (!participantIds.includes(otherPartyId)) return;
            
            const participant = participants.find(p => p.id === otherPartyId);
            if (!participant) return;
            
            // Only update if this is a more recent message
            const existing = convMap.get(otherPartyId);
            if (!existing || !existing.timestamp || new Date(message.created_at) > new Date(existing.timestamp)) {
              convMap.set(otherPartyId, {
                id: `${currentUserId}-${otherPartyId}`,
                participantId: otherPartyId,
                participantName: participant.full_name,
                lastMessage: message.content,
                timestamp: message.created_at,
                unread: message.receiver_id === currentUserId && !message.is_read,
                isCoach: participant.isCoach
              });
            }
          });
        }
        
        // Convert map to array and sort by timestamp (newest first)
        const conversationsArray = Array.from(convMap.values())
          .sort((a, b) => {
            if (!a.timestamp) return 1;
            if (!b.timestamp) return -1;
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          });
          
        setConversations(conversationsArray);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast.error('שגיאה בטעינת השיחות');
      } finally {
        setLoading(false);
      }
    };

    fetchLatestMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel('chat_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'chat_messages',
          filter: `receiver_id=eq.${currentUserId}`
        }, 
        () => {
          // Refresh conversations on new message
          fetchLatestMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [participants, currentUserId]);

  const filteredConversations = conversations.filter(conv => 
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="flex flex-col h-full">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="חיפוש..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          {loading ? (
            <div className="flex justify-center p-4">
              <p>טוען שיחות...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex justify-center p-4 text-muted-foreground">
              <p>לא נמצאו שיחות</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => onSelectConversation(
                  conversation.participantId, 
                  conversation.participantName,
                  conversation.isCoach
                )}
              >
                <Avatar>
                  <AvatarFallback>{conversation.participantName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="font-medium truncate">{conversation.participantName}</h4>
                    {conversation.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {new Date(conversation.timestamp).toLocaleDateString('he-IL')}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <p className={`text-sm truncate ${conversation.unread ? 'font-medium' : 'text-muted-foreground'}`}>
                      {conversation.lastMessage}
                    </p>
                  )}
                </div>
                {conversation.unread && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}
