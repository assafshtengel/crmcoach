
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

const DashboardCoach = () => {
  const navigate = useNavigate();

  const handleButtonClick = (buttonNumber: number) => {
    if (buttonNumber === 1) {
      navigate('/new-player');
    } else if (buttonNumber === 2) {
      navigate('/new-session');
    } else if (buttonNumber === 3) {
      navigate('/players-list');
    } else {
      console.log(`Button ${buttonNumber} clicked`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full bg-[#1A1F2C] text-white py-6 mb-8 shadow-md">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-3xl font-bold">ברוך הבא, מאמן</h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate('/dashboard-player')}
              title="עבור לדשבורד שחקן"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card 
            className="bg-white hover:bg-gray-50 transition-colors cursor-pointer transform hover:-translate-y-1 duration-200"
            onClick={() => handleButtonClick(1)}
          >
            <CardHeader>
              <CardTitle className="text-xl text-gray-700">
                כפתור 1: (רישום שחקן חדש)
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-white hover:bg-gray-50 transition-colors cursor-pointer transform hover:-translate-y-1 duration-200"
            onClick={() => handleButtonClick(2)}
          >
            <CardHeader>
              <CardTitle className="text-xl text-gray-700">
                כפתור 2: (קביעת מפגש חדש)
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-white hover:bg-gray-50 transition-colors cursor-pointer transform hover:-translate-y-1 duration-200"
            onClick={() => handleButtonClick(3)}
          >
            <CardHeader>
              <CardTitle className="text-xl text-gray-700">
                כפתור 3: (ריכוז כל השחקנים)
              </CardTitle>
            </CardHeader>
          </Card>

          <Card 
            className="bg-white hover:bg-gray-50 transition-colors cursor-pointer transform hover:-translate-y-1 duration-200"
            onClick={() => handleButtonClick(4)}
          >
            <CardHeader>
              <CardTitle className="text-xl text-gray-700">
                כפתור 4: (כותרת עתידית)
              </CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardCoach;
