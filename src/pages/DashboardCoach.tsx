
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Calendar, UserRound, CircleCheck, Clipboard, ChevronDown, PlusCircle, BarChart3, Eye, PenLine, BookOpen, Settings2, UserCircle, CircleUser, MailCheck, SendHorizonal } from "lucide-react";
import { format } from 'date-fns';

const DashboardCoach = () => {
  const { user, userFullName } = useAuth();
  const navigate = useNavigate();
  const [playersCount, setPlayersCount] = useState(0);
  const [upcomingSessionsCount, setUpcomingSessionsCount] = useState(0);
  const [isMessagesExpanded, setIsMessagesExpanded] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user) {
        try {
          // פאנל שחקנים פעילים
          const { count: playersCount, error: playersError } = await supabase
            .from('players')
            .select('id', { count: 'exact' })
            .eq('coach_id', user.id);

          if (!playersError) {
            setPlayersCount(playersCount || 0);
          }

          // פאנל מפגשים קרובים
          const today = new Date();
          const formattedToday = format(today, 'yyyy-MM-dd');
          
          const { count: sessionsCount, error: sessionsError } = await supabase
            .from('sessions')
            .select('id', { count: 'exact' })
            .eq('coach_id', user.id)
            .gte('session_date', formattedToday)
            .eq('has_started', false);

          if (!sessionsError) {
            setUpcomingSessionsCount(sessionsCount || 0);
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        }
      }
    };

    fetchDashboardData();
  }, [user]);

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-8">
      {/* Header section */}
      <div className="bg-[#1A1F2C] text-white px-6 py-4 flex justify-between items-center fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center space-x-3">
          <button className="hover:bg-[#2a2f3c] p-2 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <rect width="18" height="18" x="3" y="3" rx="2" />
            </svg>
          </button>
          <button className="hover:bg-[#2a2f3c] p-2 rounded-md">
            <Settings2 size={18} />
          </button>
          <button className="hover:bg-[#2a2f3c] p-2 rounded-md flex items-center">
            <PenLine size={16} className="mr-1" />
            <span className="text-sm">ליצור רשומה</span>
          </button>
          <button className="hover:bg-[#2a2f3c] p-2 rounded-md flex items-center" onClick={() => navigate('/new-player')}>
            <PlusCircle size={16} className="mr-1" />
            <span className="text-sm">הוסף שחקן</span>
          </button>
          <button className="hover:bg-[#2a2f3c] p-2 rounded-md flex items-center" onClick={() => navigate('/new-session')}>
            <Calendar size={16} className="mr-1" />
            <span className="text-sm">קבע מפגש</span>
          </button>
        </div>
        <div className="flex items-center">
          <Badge className="bg-red-500 p-1 h-6 w-6 flex items-center justify-center rounded-full mr-3">10</Badge>
          <UserCircle size={24} className="mr-2" />
          <div className="text-right">
            <div className="font-semibold">{userFullName || 'ברוך הבא'}</div>
            <div className="text-xs opacity-75">יום חמישי, {new Date().getDate()} באפריל {new Date().getFullYear()}</div>
          </div>
        </div>
      </div>

      {/* Main content - start below the fixed header */}
      <div className="pt-20 max-w-7xl mx-auto px-6">
        <h1 className="text-center text-xl font-medium mb-8">שליחת הודעה למתחילים</h1>

        {/* Notifications panel */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer"
            onClick={() => setIsMessagesExpanded(!isMessagesExpanded)}
          >
            <ChevronDown size={20} className={`transition-transform ${isMessagesExpanded ? 'rotate-180' : ''}`} />
            <div className="flex items-center text-blue-700">
              <MailCheck size={20} className="ml-2" />
              <span className="font-medium">שליחת הודעת לתזכורת האתר</span>
            </div>
          </div>
          
          {isMessagesExpanded && (
            <div className="p-4 border-t">
              {/* Add message form here */}
            </div>
          )}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-lg shadow-sm relative overflow-hidden p-5">
            <div className="border-r-4 border-yellow-400 pr-3 mb-3">
              <h2 className="text-lg font-medium text-right">סרטונים + כלים מנטאליים</h2>
            </div>
            <div className="text-right">
              <p className="text-sm mb-3">שליחת סרטונים למשתמשים + רשימת כלים מנטאליים</p>
              <div className="flex justify-end">
                <BookOpen size={20} className="text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-lg shadow-sm relative overflow-hidden p-5">
            <div className="border-r-4 border-blue-400 pr-3 mb-3">
              <h2 className="text-lg font-medium text-right">מפגשים קרובים</h2>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end mb-1">
                <PlusCircle size={18} className="ml-1 text-blue-500" onClick={() => navigate('/new-session')} />
                <span className="text-sm text-blue-500">הוסף מפגש</span>
              </div>
              <div className="text-4xl font-bold text-center my-3">{upcomingSessionsCount}</div>
              <p className="text-xs text-center text-gray-500">(בשבוע הקרוב)</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-lg shadow-sm relative overflow-hidden p-5">
            <div className="border-r-4 border-green-400 pr-3 mb-3">
              <h2 className="text-lg font-medium text-right">שחקנים פעילים</h2>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-center my-4">{playersCount}</p>
              <div className="flex justify-center">
                <button 
                  className="flex items-center text-sm text-green-600 border border-green-300 rounded-full px-4 py-1.5"
                  onClick={() => navigate('/players-list')}
                >
                  <CircleUser size={16} className="ml-1" />
                  <span>צפה ברשימות השחקנים</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Row 2, Card 1 */}
          <div className="bg-white rounded-lg shadow-sm relative overflow-hidden p-5">
            <div className="border-r-4 border-purple-400 pr-3 mb-3">
              <h2 className="text-lg font-medium text-right">סיכומי מפגשים</h2>
            </div>
            <div className="text-right">
              <p className="text-sm mb-3">צפה בסיכומי כל המפגשים. עם הערות סיכון לפי שחקן</p>
              <div className="text-center mt-4">
                <button 
                  className="bg-purple-100 text-purple-600 font-medium rounded-md py-2 px-4 w-full"
                  onClick={() => navigate('/all-meeting-summaries')}
                >
                  <Eye size={18} className="inline ml-2 mb-1" />
                  צפה בכל הסיכומים
                </button>
              </div>
            </div>
          </div>

          {/* Row 2, Card 2 */}
          <div className="bg-white rounded-lg shadow-sm relative overflow-hidden p-5">
            <div className="border-r-4 border-orange-400 pr-3 mb-3">
              <h2 className="text-lg font-medium text-right">דוחות וסטטיסטיקה</h2>
            </div>
            <div className="text-right">
              <p className="text-sm mb-3">צפה בנתונים סטטיסטיים מפורטים</p>
              <div className="text-center mt-4">
                <button 
                  className="bg-orange-100 text-orange-600 font-medium rounded-md py-2 px-4 w-full"
                  onClick={() => navigate('/analytics')}
                >
                  <BarChart3 size={18} className="inline ml-2 mb-1" />
                  צפה בדוחות
                </button>
              </div>
            </div>
          </div>

          {/* Row 2, Card 3 */}
          <div className="bg-white rounded-lg shadow-sm relative overflow-hidden p-5">
            <div className="border-r-4 border-green-400 pr-3 mb-3">
              <h2 className="text-lg font-medium text-right">הכנה למשחק</h2>
            </div>
            <div className="text-right">
              <p className="text-sm mb-3">מלא טופס הכנה למשחק עבור השחקנים</p>
              <div className="text-center mt-4">
                <button 
                  className="bg-green-100 text-green-600 font-medium rounded-md py-2 px-4 w-full"
                  onClick={() => navigate('/game-prep')}
                >
                  <CircleCheck size={18} className="inline ml-2 mb-1" />
                  מלא טופס הכנה
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Row 3, Card 1 */}
          <div className="bg-white rounded-lg shadow-sm relative overflow-hidden p-5">
            <div className="border-r-4 border-blue-400 pr-3 mb-3">
              <h2 className="text-lg font-medium text-right">מחקרים מנטאליים עדכניים</h2>
            </div>
            <div className="text-right">
              <p className="text-xs mb-3">קבענו גישה למחקרים טריים ועדכני לכם להבין את עולם המנטאליות שלכם!</p>
              <div className="text-center mt-4">
                <button 
                  className="bg-blue-100 text-blue-600 font-medium rounded-md py-2 px-4 w-full"
                  onClick={() => navigate('/mental-library')}
                >
                  <BookOpen size={18} className="inline ml-2 mb-1" />
                  צפה בספרייה
                </button>
              </div>
            </div>
          </div>

          {/* Row 3, Card 2 */}
          <div className="bg-white rounded-lg shadow-sm relative overflow-hidden p-5">
            <div className="border-r-4 border-yellow-400 pr-3 mb-3">
              <h2 className="text-lg font-medium text-right">הערכת שחקן</h2>
            </div>
            <div className="text-right">
              <p className="text-sm mb-3">מלא טופס הערכת שחקן מקיף</p>
              <div className="text-center mt-4">
                <button 
                  className="bg-yellow-100 text-yellow-600 font-medium rounded-md py-2 px-4 w-full"
                  onClick={() => navigate('/player-evaluation')}
                >
                  <Clipboard size={18} className="inline ml-2 mb-1" />
                  הערך שחקן
                </button>
              </div>
            </div>
          </div>

          {/* Row 3, Card 3 */}
          <div className="bg-white rounded-lg shadow-sm relative overflow-hidden p-5">
            <div className="border-r-4 border-purple-400 pr-3 mb-3">
              <h2 className="text-lg font-medium text-right">מפרסת המאמן</h2>
            </div>
            <div className="text-right">
              <p className="text-xs mb-3">הגדר ועקוב אחר מטרות המאמן שלך</p>
              <div className="text-center mt-4">
                <button 
                  className="bg-gray-100 text-gray-600 font-medium rounded-md py-2 px-4 w-full"
                  onClick={() => navigate('/profile-coach')}
                >
                  <UserRound size={18} className="inline ml-2 mb-1" />
                  צפה במפרסת
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 mb-10">
          {/* Row 4, Card 1 */}
          <div className="bg-[#1A1F2C] rounded-lg shadow-sm relative overflow-hidden p-5 text-white">
            <div className="border-r-4 border-purple-400 pr-3 mb-3">
              <h2 className="text-lg font-medium text-right">שאלונים</h2>
            </div>
            <div className="text-right">
              <p className="text-sm mb-3 opacity-80">צפה בשאלונים שמולאו ע"י השחקנים</p>
              <p className="text-xs bg-yellow-500 text-black inline-block px-2 py-1 rounded mb-3">* בגרסה בקרוב *</p>
              <div className="text-center mt-2">
                <button 
                  className="bg-orange-500 text-white font-medium rounded-md py-2 px-4 w-full"
                  onClick={() => navigate('/questionnaires')}
                >
                  <Clipboard size={18} className="inline ml-2 mb-1" />
                  צפה בשאלונים
                </button>
              </div>
            </div>
          </div>

          {/* Row 4, Card 2 */}
          <div className="bg-[#5a2542] rounded-lg shadow-sm relative overflow-hidden p-5 text-white">
            <div className="border-r-0 mb-3">
              <h2 className="text-lg font-medium text-right">בניה - יישומון בקרוב</h2>
            </div>
            <div className="text-right">
              <p className="text-xs mb-3">מילוי דוח אימיון שחקן לאחר משחק</p>
              <p className="text-xs mb-3">השוואות של לפני השבוע</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardCoach;
