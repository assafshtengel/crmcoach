
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPlayer: boolean;
  isCoach: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPlayer, setIsPlayer] = useState(false);
  const [isCoach, setIsCoach] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // First set up the auth state listener to avoid missing any auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsAuthenticated(!!newSession?.user);

        // Defer profile check to avoid Supabase auth deadlocks
        if (newSession?.user) {
          setTimeout(() => {
            checkUserRole(newSession.user.id);
          }, 0);
        } else {
          setIsPlayer(false);
          setIsCoach(false);
        }
      }
    );

    // Then check for existing session
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          if (error.message.includes('AuthSessionMissingError')) {
            console.error('Auth session missing:', error.message);
            toast({
              title: "שגיאת התחברות",
              description: "נראה שאתה לא מחובר. אנא התחבר שוב.",
              variant: "destructive",
            });
          } else {
            console.error('Auth error:', error.message);
          }
          setIsAuthenticated(false);
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setIsAuthenticated(!!data.session?.user);
          
          if (data.session?.user) {
            await checkUserRole(data.session.user.id);
          }
        }
      } catch (error) {
        console.error('Unexpected auth error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  const checkUserRole = async (userId: string) => {
    try {
      // Check if user is a player
      const { data: playerData, error: playerError } = await supabase
        .from('players')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (playerData) {
        setIsPlayer(true);
        setIsCoach(false);
        return;
      }
      
      // Check if user is a coach
      const { data: coachData, error: coachError } = await supabase
        .from('coaches')
        .select('id')
        .eq('id', userId)
        .maybeSingle();
        
      if (coachData) {
        setIsCoach(true);
        setIsPlayer(false);
        return;
      }
      
      setIsPlayer(false);
      setIsCoach(false);
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsPlayer(false);
      setIsCoach(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת ניסיון להתנתק. אנא נסה שוב.",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAuthenticated,
        isPlayer,
        isCoach,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
