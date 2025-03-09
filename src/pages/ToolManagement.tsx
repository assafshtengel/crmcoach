
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolsList } from "@/components/tools/ToolsList";
import VideoManagement from "@/components/admin/VideoManagement";
import { VideoIcon } from "lucide-react";
import { useLocation } from "react-router-dom";

export default function ToolManagement() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("mental-tools");
  
  useEffect(() => {
    // Check if we're coming from the dashboard video card
    const params = new URLSearchParams(location.search);
    if (params.get("tab") === "videos") {
      setActiveTab("videos");
    }
  }, [location]);

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold">ניהול כלים</h1>
          <p className="text-muted-foreground">
            נהל את כלי האימון המנטליים וסרטוני הוידאו במערכת
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="mental-tools">כלים מנטליים</TabsTrigger>
            <TabsTrigger value="videos">סרטוני וידאו</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mental-tools" className="space-y-4">
            <ToolsList />
          </TabsContent>
          
          <TabsContent value="videos" className="space-y-4">
            <VideoManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
