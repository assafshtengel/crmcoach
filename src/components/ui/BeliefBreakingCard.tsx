
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const BeliefBreakingCard = () => {
  return (
    <Card className="bg-white shadow-md hover:shadow-lg transition-shadow h-full">
      <CardHeader className="bg-primary/10 py-4 border-b">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <ExternalLink className="h-5 w-5" />
          טופס לשחרור האמונות המגבילות
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 flex flex-col h-[calc(100%-4rem)]">
        <p className="text-muted-foreground mb-4">
          לחצו על הכפתור מטה כדי לעבור אל טופס שיטת ביירון קייטי לשחרור האמונות המגבילות.
        </p>
        <div className="mt-auto">
          <Button 
            className="w-full"
            onClick={() => window.open('https://belief-breaker.lovable.app/', '_blank')}
          >
            פתח טופס <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
