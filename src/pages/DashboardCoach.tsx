
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const DashboardCoach = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <header className="w-full bg-[#1A1F2C] text-white py-6 mb-8 shadow-md">
        <div className="max-w-7xl mx-auto px-8">
          <h1 className="text-3xl font-bold">ברוכים הבאים, מאמן</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-12">
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

        <div className="text-center py-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dashboard Coach - Coming Soon
          </h1>
          <p className="text-xl text-gray-600">
            דף הבית החדש למאמן המנטלי נמצא בפיתוח...
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCoach;
