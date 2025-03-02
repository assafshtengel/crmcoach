import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Settings, Users, FileText, Eye } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import NewPlayerForm from '@/components/player/NewPlayerForm';
import { supabase } from '@/lib/supabase';
import { Link } from 'react-router-dom';

interface Player {
  id: string;
  full_name: string;
}

const DashboardCoach = () => {
  const [open, setOpen] = React.useState(false)
  const [players, setPlayers] = useState<Player[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast()

  useEffect(() => {
    const fetchPlayers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No user found, or not logged in.");
        return;
      }

      const { data, error } = await supabase
        .from('players')
        .select('id, full_name')
        .eq('coach_id', user.id);

      if (error) {
        console.error("Error fetching players:", error);
        toast({
          title: "Error",
          description: "Failed to fetch players.",
          variant: "destructive",
        });
        return;
      }

      setPlayers(data || []);
    };

    fetchPlayers();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F2FCE2] to-[#E5DEFF] py-6">
      <div className="container mx-auto max-w-4xl p-4">

        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">לוח בקרה</h1>
          <Button onClick={() => navigate('/admin')} variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            ניהול כלים
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          <Card className="bg-white/90 hover:bg-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">הוספת שחקן חדש</CardTitle>
              <CardDescription>הוסף שחקן חדש למערכת</CardDescription>
            </CardHeader>
            <CardContent>
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-center">
                    <Plus className="mr-2 h-4 w-4" />
                    הוסף שחקן
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>הוספת שחקן חדש</DialogTitle>
                    <DialogDescription>
                      הכנס את פרטי השחקן החדש
                    </DialogDescription>
                  </DialogHeader>
                  <NewPlayerForm setOpen={setOpen} />
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          <Card className="bg-white/90 hover:bg-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">ניהול שחקנים</CardTitle>
              <CardDescription>עדכון פרטי שחקנים קיימים</CardDescription>
            </CardHeader>
            <CardContent>
              {players.length > 0 ? (
                <ul className="list-none space-y-2">
                  {players.map(player => (
                    <li key={player.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{player.full_name}</span>
                      </div>
                      <Button variant="link" onClick={() => navigate(`/player/${player.id}`)}>
                        בחר שחקן
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">אין שחקנים כרגע.</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/90 hover:bg-white transition-all duration-300 hover:shadow-lg hover:shadow-purple-100">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">סיכומי מפגשים</CardTitle>
              <CardDescription>צפייה וניהול של סיכומי מפגשים</CardDescription>
            </CardHeader>
            <CardContent>
              {players.map(player => (
                <div key={player.id} className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>{player.full_name}</span>
                    </div>
                    <Button 
                      variant="link" 
                      className="flex items-center" 
                      onClick={() => navigate(`/session-summaries?player=${player.id}`)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      צפה בסיכום
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                onClick={() => navigate('/session-summaries')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileText className="h-5 w-5" />
                צפה בכל הסיכומים
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default DashboardCoach;
