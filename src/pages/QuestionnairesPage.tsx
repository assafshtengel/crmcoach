
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const QuestionnairesPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('templates');
  // This would normally come from an API call
  const hasCustomTemplates = false; 

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">שאלונים</h1>
            <p className="text-gray-600">ניהול שאלונים למאמנים ושחקנים</p>
          </div>
          <Button 
            variant="outline" 
            className="flex items-center" 
            onClick={() => navigate('/dashboard-coach')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            חזרה לדשבורד
          </Button>
        </div>

        <Tabs defaultValue="templates" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="templates">תבניות שאלונים</TabsTrigger>
            <TabsTrigger value="saved">שאלונים שמורים</TabsTrigger>
          </TabsList>

          <TabsContent value="templates" className="mt-0">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">תבניות שאלונים מותאמות אישית</h2>
                {!hasCustomTemplates ? (
                  <Card className="bg-gray-50 border-dashed">
                    <CardContent className="text-center p-8">
                      <p className="text-gray-500">
                        אין לך עדיין תבניות שאלונים מותאמות אישית. צור גרסה מותאמת מאחת מתבניות המערכת למטה.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Custom templates would be mapped here */}
                  </div>
                )}
              </div>

              <Separator className="my-6" />

              <div>
                <h2 className="text-xl font-semibold mb-4">תבניות שאלונים מובנות</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* System templates would be mapped here */}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="mt-0">
            <div>
              <h2 className="text-xl font-semibold mb-4">שאלונים שמורים</h2>
              <Card className="bg-gray-50 border-dashed">
                <CardContent className="text-center p-8">
                  <p className="text-gray-500">
                    אין לך עדיין שאלונים שמורים.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QuestionnairesPage;
