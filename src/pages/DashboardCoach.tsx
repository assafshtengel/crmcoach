import React from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ClipboardList } from 'lucide-react';

const DashboardCoach = () => {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">לוח בקרה</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Other cards would go here */}
        
        {/* Questionnaires Card - Under Construction */}
        <Card className="bg-white/90 hover:bg-white transition-all duration-300 shadow-lg border-l-4 border-l-[#FF5722]">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-medium">שאלונים</CardTitle>
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
              <ClipboardList className="h-5 w-5 text-[#FF5722]" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 mb-3">
              צפה בשאלונים שמולאו על ידי השחקנים
              <span className="block mt-1 text-amber-600 font-medium">* בבנייה כעת *</span>
            </p>
            <Button variant="default" className="w-full bg-[#FF5722] hover:bg-[#E64A19] cursor-not-allowed" disabled>
              <ClipboardList className="h-4 w-4 mr-2" />
              צפה בשאלונים
            </Button>
          </CardContent>
        </Card>
        
        {/* Other cards would go here */}
      </div>
    </div>
  );
};

export default DashboardCoach;
