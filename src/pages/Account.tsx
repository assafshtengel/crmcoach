
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Account = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Button variant="outline" size="icon" onClick={() => navigate('/')}>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-center">
            פרופיל חשבון
          </h1>
          <div className="w-9"></div> {/* For balance in the flex layout */}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>פרטי חשבון</CardTitle>
          </CardHeader>
          <CardContent>
            <p>דף זה עדיין בפיתוח. כאן יוצגו פרטי החשבון.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
