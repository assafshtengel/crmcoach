import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MentalPrepForm } from "@/components/MentalPrepForm";
import { LogOut, ArrowRight, LayoutDashboard, Film, CheckCircle, Send, ExternalLink, FileCheck, BrainCircuit, BookOpen, FileEdit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AdminMessageForm } from "@/components/admin/AdminMessageForm";
import { BeliefBreakingCard } from "@/components/ui/BeliefBreakingCard";
import { MentalLibrary } from "@/components/mental-library/MentalLibrary";
import { LandingPageDialog } from "@/components/landing-page/LandingPageDialog";

const Index = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [assignedVideos, setAssignedVideos] = useState<any[]>([]);
  const [allVideos, setAllVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [showLandingPageDialog, setShowLandingPageDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
      
      if (user) {
        setUserId(user.id);
        fetchVideos(user.id);
      } else {
        console.log("No authenticated user found");
        setLoading(false);
      }
    };
    getUserEmail();
  }, []);

  const fetchVideos = async (userId: string) => {
    setLoading(true);
    
    try {
      console.log("Fetching videos for player:", userId);
      
      const { data: assignedVideoData, error: assignedError } = await supabase
        .from('player_videos')
        .select(`
          id,
          watched,
          watched_at,
          videos:video_id (
            id,
            title,
            url,
            description,
            category
          )
        `)
        .eq('player_id', userId);
      
      if (assignedError) {
        console.error('Error fetching assigned videos:', assignedError);
        throw assignedError;
      }
      
      console.log("Assigned videos fetched:", assignedVideoData);
      
      const filteredAssignedVideos = assignedVideoData?.filter(video => video.videos) || [];
      setAssignedVideos(filteredAssignedVideos);
      
      const { data: allVideoData, error: allError } = await supabase
        .from('videos')
        .select('*')
        .eq('is_admin_video', true);
      
      if (allError) {
        console.error('Error fetching admin videos:', allError);
        throw allError;
      }
      
      console.log("Admin videos fetched:", allVideoData);
      setAllVideos(allVideoData || []);
      
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "שגיאה בטעינת סרטונים",
        description: "לא ניתן לטעון את רשימת הסרטונים",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVideoClick = (videoUrl: string) => {
    window.open(videoUrl, '_blank');
  };

  const markVideoAsWatched = async (playerVideoId: string) => {
    try {
      const { error } = await supabase
        .from('player_videos')
        .update({
          watched: true,
          watched_at: new Date().toISOString()
        })
        .eq('id', playerVideoId);
      
      if (error) {
        console.error('Error marking video as watched:', error);
        throw error;
      }
      
      setAssignedVideos(prev => 
        prev.map(video => 
          video.id === playerVideoId 
            ? { ...video, watched: true, watched_at: new Date().toISOString() } 
            : video
        )
      );
      
      toast({
        title: "סרטון סומן כנצפה",
        description: "הסטטוס עודכן בהצלחה",
      });
    } catch (error) {
      console.error('Error marking video as watched:', error);
      toast({
        title: "שגיאה בסימון הסרטון",
        description: "לא ניתן לעדכן את סטטוס הצפייה",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const refreshVideos = () => {
    if (userId) {
      fetchVideos(userId);
      toast({
        title: "מרענן את רשימת הסרטונים",
        description: "רשימת הסרטונים מתעדכנת",
      });
    }
  };

  console.log("Landing page dialog state:", showLandingPageDialog);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-white py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        <
