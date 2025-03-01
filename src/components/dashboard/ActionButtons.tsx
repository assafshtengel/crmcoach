
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { UserPlus, CalendarPlus, Users, FileText, BarChart2, Wrench } from 'lucide-react';

const ActionButtons: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <Button 
        className="h-auto py-6 bg-[#2C3E50] hover:bg-[#2C3E50]/90"
        onClick={() => navigate('/new-player')}
      >
        <div className="flex flex-col items-center gap-2">
          <UserPlus className="h-6 w-6" />
          <span>הוספת שחקן חדש</span>
        </div>
      </Button>

      <Button 
        className="h-auto py-6 bg-[#27AE60] hover:bg-[#27AE60]/90"
        onClick={() => navigate('/new-session')}
      >
        <div className="flex flex-col items-center gap-2">
          <CalendarPlus className="h-6 w-6" />
          <span>קביעת מפגש חדש</span>
        </div>
      </Button>

      <Button 
        className="h-auto py-6 bg-[#3498DB] hover:bg-[#3498DB]/90"
        onClick={() => navigate('/players-list')}
      >
        <div className="flex flex-col items-center gap-2">
          <Users className="h-6 w-6" />
          <span>רשימת שחקנים</span>
        </div>
      </Button>

      <Button 
        className="h-auto py-6 bg-[#F1C40F] hover:bg-[#F1C40F]/90"
        onClick={() => navigate('/session-summaries')}
      >
        <div className="flex flex-col items-center gap-2">
          <FileText className="h-6 w-6" />
          <span>סיכומי מפגשים</span>
        </div>
      </Button>

      <Button 
        className="h-auto py-6 bg-[#9B59B6] hover:bg-[#9B59B6]/90"
        onClick={() => navigate('/analytics')}
      >
        <div className="flex flex-col items-center gap-2">
          <BarChart2 className="h-6 w-6" />
          <span>דוחות וסטטיסטיקות</span>
        </div>
      </Button>

      <Button 
        className="h-auto py-6 bg-[#9B59B6] hover:bg-[#9B59B6]/90"
        onClick={() => navigate('/mental-tools')}
      >
        <div className="flex flex-col items-center gap-2">
          <Wrench className="h-5 w-5" />
          <span>כלים מנטליים</span>
        </div>
      </Button>
    </div>
  );
};

export default ActionButtons;
