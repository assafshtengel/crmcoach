
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToolsList } from "@/components/tools/ToolsList";
import VideoManagement from "@/components/admin/VideoManagement";
import { VideoIcon, ArrowRight, Calendar } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export default function ToolManagement() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("mental-tools");
  const { toast } = useToast();
  
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
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold">ניהול כלים</h1>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2" 
              onClick={() => navigate("/dashboard-coach")}
            >
              <ArrowRight className="h-4 w-4" />
              חזרה לדף הבית
            </Button>
          </div>
          <p className="text-muted-foreground">
            נהל את כלי האימון המנטליים וסרטוני הוידאו במערכת
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="mental-tools">כלים מנטליים</TabsTrigger>
            <TabsTrigger value="videos">
              סרטוני וידאו
              <VideoIcon className="ml-1 h-4 w-4" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="mental-tools" className="space-y-4">
            <ToolsList />
          </TabsContent>
          
          <TabsContent value="videos" className="space-y-4">
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">ניהול סרטונים</h2>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => navigate("/auto-video-management")}
              >
                <Calendar className="h-4 w-4" />
                ניהול סרטונים אוטומטיים
              </Button>
            </div>
            <VideoManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
