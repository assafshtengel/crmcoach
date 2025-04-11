
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
  userFullName: string | null;
  userRole: 'player' | 'coach' | null;
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
  const [userFullName, setUserFullName] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<'player' | 'coach' | null>(null);
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
        
        // Extract full_name from user metadata if available
        const fullName = newSession?.user?.user_metadata?.full_name || null;
        setUserFullName(fullName);

        // Defer profile check to avoid Supabase auth deadlocks
        if (newSession?.user) {
          setTimeout(() => {
            checkUserRole(newSession.user.id);
          }, 0);
        } else {
          setIsPlayer(false);
          setIsCoach(false);
          setUserRole(null);
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
            toast({
              title: "שגיאת התחברות",
              description: "שגיאה בהתחברות. נסה שנית.",
              variant: "destructive",
            });
          }
          setIsAuthenticated(false);
        } else {
          setSession(data.session);
          setUser(data.session?.user ?? null);
          setIsAuthenticated(!!data.session?.user);
          
          // Extract full_name from user metadata if available
          const fullName = data.session?.user?.user_metadata?.full_name || null;
          setUserFullName(fullName);
          
          if (data.session?.user) {
            await checkUserRole(data.session.user.id);
          }
        }
      } catch (error) {
        console.error('Unexpected auth error:', error);
        toast({
          title: "שגיאת התחברות",
          description: "שגיאה בהתחברות. נסה שנית.",
          variant: "destructive",
        });
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
        setUserRole('player');
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
        setUserRole('coach');
        return;
      }
      
      // If no role found in database
      setIsPlayer(false);
      setIsCoach(false);
      setUserRole(null);
      
      // Check for role in user metadata as fallback
      const role = user?.user_metadata?.role as string | undefined;
      if (role === 'player') {
        setIsPlayer(true);
        setUserRole('player');
      } else if (role === 'coach') {
        setIsCoach(true);
        setUserRole('coach');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsPlayer(false);
      setIsCoach(false);
      setUserRole(null);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth');
      toast({
        title: "התנתקות בוצעה",
        description: "התנתקת בהצלחה מהמערכת",
      });
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
        userFullName,
        userRole,
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

// Utility function to get the user's role from metadata
export function getUserRole(user: User | null): 'player' | 'coach' | null {
  if (!user) return null;
  
  const role = user.user_metadata?.role as string | undefined;
  if (role === 'player') return 'player';
  if (role === 'coach') return 'coach';
  return null;
}
