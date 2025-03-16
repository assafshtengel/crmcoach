
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { NotificationsBell } from "../dashboard/NotificationsBell";
import { 
  LogOut, Settings, Users, Calendar, Video, 
  BarChart, ClipboardCheck, FileText, BookOpen, MessageCircle,
  Activity, User, Brain 
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

interface LayoutProps {
  children: React.ReactNode;
  userType?: 'coach' | 'player' | null;
}

export function Layout({ children, userType = 'coach' }: LayoutProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [coachName, setCoachName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      // שחקן משתמש באימות נפרד משל המאמן
      if (userType === 'player') {
        const playerSession = localStorage.getItem('playerSession') || sessionStorage.getItem('playerSession');
        if (playerSession) {
          try {
            const playerData = JSON.parse(playerSession);
            setPlayerName(playerData.full_name || "שחקן");
            setIsLoggedIn(true);
          } catch (err) {
            console.error("Error parsing player session:", err);
            navigate('/player-auth');
          }
        } else {
          navigate('/player-auth');
        }
        return;
      }

      // אימות מאמן
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);

      if (!session) {
        navigate('/auth');
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.user_metadata?.full_name) {
          setCoachName(user.user_metadata.full_name);
        } else {
          setCoachName(user?.email?.split('@')[0] || "Coach");
        }
      }
    };

    checkAuth();
  }, [navigate, userType]);

  const handleLogout = async () => {
    if (userType === 'player') {
      localStorage.removeItem('playerSession');
      sessionStorage.removeItem('playerSession');
      navigate('/player-auth');
    } else {
      await supabase.auth.signOut();
      navigate('/auth');
    }
    setIsLoggedIn(false);
  };

  if (!isLoggedIn) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {userType === 'coach' ? (
        // תפריט למאמן
        <nav className="bg-white border-b p-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/dashboard-coach" className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-gray-200">
                <AvatarImage src="" />
                <AvatarFallback className="bg-emerald-500 text-white text-xs">
                  {getInitials(coachName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-md font-semibold">{coachName}</span>
            </Link>
            
            <Link
              to="/dashboard-coach"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <BarChart size={16} />
              לוח בקרה
            </Link>
            
            <Link
              to="/players-list"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <Users size={16} />
              שחקנים
            </Link>
            <Link
              to="/meetings"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <Calendar size={16} />
              פגישות
            </Link>
            <Link
              to="/training-videos"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <Video size={16} />
              סרטוני הדרכה
            </Link>
            <Link
              to="/evaluations"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <ClipboardCheck size={16} />
              הערכות
            </Link>
            <Link
              to="/game-preparation"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <FileText size={16} />
              הכנה למשחק
            </Link>
            <Link
              to="/goals"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <BookOpen size={16} />
              מטרות
            </Link>
            
            <Link
              to="/messages"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <MessageCircle size={16} />
              הודעות
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/settings"
              className="text-gray-600 hover:text-gray-800 transition-colors flex items-center gap-1"
            >
              <Settings size={16} />
              הגדרות
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              התנתק
            </button>
          </div>
        </nav>
      ) : (
        // תפריט לשחקן
        <nav className="bg-blue-50 border-b border-blue-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/player" className="flex items-center gap-2">
              <Avatar className="h-8 w-8 border border-blue-200">
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-500 text-white text-xs">
                  {getInitials(playerName)}
                </AvatarFallback>
              </Avatar>
              <span className="text-md font-semibold">{playerName}</span>
            </Link>
            
            <Link
              to="/player"
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              <User size={16} />
              פרופיל
            </Link>

            <Link
              to="/player/daily-mental-state"
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              <Brain size={16} />
              מצב מנטלי
            </Link>
            
            <Link
              to="/player/game-summary"
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              <Activity size={16} />
              סיכומי משחק
            </Link>
            
            <Link
              to="/player/messages"
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              <MessageCircle size={16} />
              הודעות
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLogout}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              התנתק
            </button>
          </div>
        </nav>
      )}
      
      <main className="container mx-auto py-8 px-6 flex-grow">
        {children}
      </main>
      <footer className="bg-gray-100 border-t py-4 text-center">
        <p className="text-gray-500">© 2024 Huzе. All rights reserved.</p>
      </footer>
    </div>
  );
}
