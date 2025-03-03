import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold text-primary">מערכת האימון המנטלי</h1>
          <p className="mt-2 text-gray-600">ברוכים הבאים למערכת האימון המנטלי</p>
        </div>
        
        <div className="flex flex-col space-y-4 pt-6">
          <Button asChild className="w-full">
            <Link to="/auth">כניסת מאמן</Link>
          </Button>
          
          <Button asChild variant="outline" className="w-full">
            <Link to="/player-auth">כניסת שחקן</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
