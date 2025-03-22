
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, User, Video, GraduationCap, ListChecks, Settings, MessageSquare, BarChart4, Calendar, BadgeCheck, ShieldAlert, HelpCircle, BookOpenCheck, Lightbulb, Presentation, Users, CheckCircle2, ArchiveRestore, FileVideo2, ListTree, LayoutDashboard } from "lucide-react";
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  path: string;
}

const DashboardCoach = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [coachProfile, setCoachProfile] = useState<{ full_name: string | null; profile_image: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoachProfile = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: coachData, error } = await supabase
            .from('coaches')
            .select('full_name, profile_image')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching coach profile:", error);
            toast({
              title: "Error",
              description: "Failed to load coach profile.",
              variant: "destructive",
            });
          } else {
            setCoachProfile({
              full_name: coachData?.full_name || null,
              profile_image: coachData?.profile_image || null,
            });
          }
        }
      } catch (error) {
        console.error("Unexpected error fetching coach profile:", error);
        toast({
          title: "Error",
          description: "Failed to load coach profile.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoachProfile();
  }, [toast]);

  const dashboardCards: DashboardCard[] = [
    {
      id: "players",
      title: "שחקנים",
      description: "ניהול רשימת שחקנים, הוספה, עריכה ומחיקה",
      icon: Users,
      path: "/players-list",
    },
    {
      id: "sessions",
      title: "אימונים",
      description: "ניהול רשימת אימונים, הוספה, עריכה ומחיקה",
      icon: ListTree,
      path: "/sessions-list",
    },
    {
      id: "newSession",
      title: "אימון חדש",
      description: "יצירת אימון חדש במערכת",
      icon: Presentation,
      path: "/new-session",
    },
    {
      id: "registrationLinks",
      title: "קישורי רישום",
      description: "יצירת וניהול קישורי רישום לשחקנים",
      icon: CheckCircle2,
      path: "/registration-links",
    },
    {
      id: "questionnaires",
      title: "שאלונים",
      description: "צפייה בשאלונים ומענים של שחקנים",
      icon: FileText,
      path: "/questionnaires",
    },
    {
      id: "allMeetingSummaries",
      title: "סיכומי פגישות",
      description: "צפייה בכל סיכומי הפגישות",
      icon: FileText,
      path: "/all-meeting-summaries",
    },
    {
      id: "mentalTools",
      title: "כלים מנטליים",
      description: "גישה למגוון כלים מנטליים",
      icon: Lightbulb,
      path: "/mental-tools",
    },
    {
      id: "toolManagement",
      title: "ניהול כלים",
      description: "ניהול כלים מנטליים",
      icon: Settings,
      path: "/tool-management",
    },
    {
      id: "autoVideoManagement",
      title: "ניהול וידאו אוטומטי",
      description: "ניהול סרטוני וידאו אוטומטי",
      icon: FileVideo2,
      path: "/auto-video-management",
    },
    {
      id: "reports",
      title: "דוחות",
      description: "צפייה בדוחות שונים",
      icon: BarChart4,
      path: "/reports",
    },
    {
      id: "profile",
      title: "פרופיל",
      description: "עדכון פרטים אישיים",
      icon: User,
      path: "/profile-coach",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              דשבורד מאמן
            </h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button onClick={() => navigate('/signup-coach')}>
              אזור מנהל
            </Button>
          </div>
        </div>
        <main className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dashboardCards.map((card) => (
              <Card key={card.id} className="bg-white shadow-md rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                  {React.createElement(card.icon, { className: "h-4 w-4 text-gray-600" })}
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-500 text-xs">
                    {card.description}
                  </CardDescription>
                </CardContent>
                <Button variant="link" className="justify-start p-4" onClick={() => navigate(card.path)}>
                  {card.title}
                </Button>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardCoach;
