import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EducationalTab } from "@/components/dashboard/EducationalTab";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardCoach = () => {
  return (
    <Layout>
      <div className="container py-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start mb-4">
            <TabsTrigger value="overview">סקירה כללית</TabsTrigger>
            <TabsTrigger value="educational">הכרטיסייה החינוכית</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>סקירה כללית</CardTitle>
                <CardDescription>סקירה כללית של המערכת</CardDescription>
              </CardHeader>
              <CardContent>
                <p>תוכן הסקירה הכללית</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="educational">
            <EducationalTab />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardCoach;
