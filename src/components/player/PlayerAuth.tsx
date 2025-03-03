import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import PlayerLoginForm from './PlayerLoginForm';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface PlayerAuthGuardProps {
  children: React.ReactNode;
  allowCoach?: boolean;
}

export const PlayerAuthGuard = ({ children, allowCoach = true }: PlayerAuthGuardProps) => {
  const [loading, setLoading] = useState(true);
  const [isCoach, setIsCoach] = useState(false);
  const [isPlayerAuthenticated, setIsPlayerAuthenticated] = useState(false);
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        
        // Check if user is a coach
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('id', session.user.id)
            .single();
            
          if (roleData && roleData.role === 'coach') {
            setIsCoach(true);
            setLoading(false);
            return; // Coach is allowed to access
          }
        }
        
        // Check if player is authenticated
        const playerSession = localStorage.getItem('playerSession');
        if (playerSession) {
          const parsedSession = JSON.parse(playerSession);
          
          // Check if session is for this player
          if (parsedSession.playerId === playerId) {
            // Verify player still exists in DB
            const { data: playerData, error } = await supabase
              .from('players')
              .select('id')
              .eq('id', parsedSession.playerId)
              .single();
              
            if (!error && playerData) {
              setIsPlayerAuthenticated(true);
            } else {
              // Invalid session, clear it
              localStorage.removeItem('playerSession');
            }
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Auth check error:", error);
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [playerId]);
  
  const handleBackToList = () => {
    navigate('/players-list');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  // Allow coach access if specified
  if (allowCoach && isCoach) {
    return <>{children}</>;
  }
  
  // Allow player access if authenticated
  if (isPlayerAuthenticated) {
    return <>{children}</>;
  }
  
  // Otherwise show login form
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="container mx-auto px-4">
        {isCoach && (
          <div className="mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToList}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              חזרה לרשימת השחקנים
            </Button>
          </div>
        )}
        
        <div className="max-w-md mx-auto">
          <PlayerLoginForm playerId={playerId} />
        </div>
      </div>
    </div>
  );
};

export default PlayerAuthGuard;
