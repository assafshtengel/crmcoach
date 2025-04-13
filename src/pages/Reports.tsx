import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { BarChart, LineChart, PieChart, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ResponsiveContainer, LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Search, FileText, MapPin, User, Filter } from "lucide-react";

interface Report {
  id: string;
  created_at: string;
  full_name: string;
  match_date: string;
  opposing_team: string;
  game_type: string;
  selected_states: string[];
  selected_goals: Array<{ goal: string; metric: string }>;
  answers: Record<string, string>;
  current_pressure?: string;
  optimal_pressure?: string;
  player_name?: string;
}

const Reports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [playerFilter, setPlayerFilter] = useState<string>("all");
  const [players, setPlayers] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all-reports");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        navigate('/auth');
        return;
      }

      // Get the current coach's ID from the session
      const coachId = session.session.user.id;

      // Fetch only reports that belong to the current coach
      const { data, error } = await supabase
        .from('mental_prep_forms')
        .select('*')
        .eq('coach_id', coachId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedData: Report[] = (data || []).map(item => ({
        id: item.id,
        created_at: item.created_at,
        full_name: item.full_name,
        match_date: item.match_date,
        opposing_team: item.opposing_team,
        game_type: item.game_type,
        selected_states: item.selected_states as string[],
        selected_goals: item.selected_goals as Array<{ goal: string; metric: string }>,
        answers: item.answers as Record<string, string>,
        current_pressure: item.current_pressure || undefined,
        optimal_pressure: item.optimal_pressure || undefined,
        player_name: item.player_name || undefined
      }));

      setReports(formattedData);

      // Extract unique player names for the filter
      const uniquePlayers = Array.from(
        new Set(formattedData.map(report => report.player_name).filter(Boolean))
      ) as string[];
      
      setPlayers(uniquePlayers);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת הדוחות",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReportClick = (report: Report) => {
    setSelectedReport(report);
    setShowDialog(true);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      (report.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      report.opposing_team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.player_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      false);
    
    const matchesPlayer = playerFilter === "all" || report.player_name === playerFilter;
    
    return matchesSearch && matchesPlayer;
  });

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-4">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-10 w-10" />
          <Skeleton className="h-8 w-48" />
        </div>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate('/dashboard')}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">דוחות</h1>
      </div>

      <Tabs defaultValue="all-reports" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="all-reports">דוחות כלליים</TabsTrigger>
          <TabsTrigger value="game-prep">הכנה למשחק</TabsTrigger>
        </TabsList>

        <TabsContent value="all-reports">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer bg-white/90"
              onClick={() => navigate('/player-statistics')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <BarChart className="h-5 w-5 text-primary" />
                  סטטיסטיקות שחקנים ומפגשים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">צפה בנתונים סטטיסטיים מפורטים על שחקנים חדשים ומפגשים</p>
                <Button variant="outline" className="w-full">לצפייה</Button>
              </CardContent>
            </Card>
            
            <Card 
              className="hover:shadow-lg transition-shadow cursor-pointer bg-white/90"
              onClick={() => navigate('/analytics')}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  דוחות כלליים
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">צפה בדוחות כלליים ונתונים נוספים</p>
                <Button variant="outline" className="w-full">לצפייה</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="game-prep">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="חיפוש לפי שם שחקן או קבוצה" 
                  className="pl-10 text-right pr-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="w-full md:w-auto">
                <Select value={playerFilter} onValueChange={setPlayerFilter}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="סנן לפי שחקן" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">כל השחקנים</SelectItem>
                    {players.map((player) => (
                      <SelectItem key={player} value={player}>{player}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full md:w-auto flex items-center gap-2"
                onClick={() => navigate('/game-prep')}
              >
                <FileText className="h-4 w-4" />
                צור דוח הכנה חדש
              </Button>
            </div>

            {filteredReports.length > 0 ? (
              <div className="grid gap-4">
                {filteredReports.map((report) => (
                  <Card
                    key={report.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleReportClick(report)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">{report.opposing_team}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{format(new Date(report.match_date), 'dd/MM/yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <span>{report.player_name || report.full_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{report.game_type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span>{new Date(report.created_at).toLocaleDateString('he-IL')}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center p-8">
                <CardContent className="space-y-4">
                  <FileText className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="text-gray-600">לא נמצאו דוחות טרום משחק</p>
                  <Button onClick={() => navigate('/game-prep')}>צור דוח חדש</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold mb-4">
              דוח טרום משחק - {selectedReport?.opposing_team}
            </DialogTitle>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              <section>
                <h3 className="text-lg font-semibold mb-2">פרטי המשחק</h3>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">שם מלא</TableCell>
                      <TableCell>{selectedReport.player_name || selectedReport.full_name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">תאריך משחק</TableCell>
                      <TableCell>{format(new Date(selectedReport.match_date), 'dd/MM/yyyy')}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">קבוצה יריבה</TableCell>
                      <TableCell>{selectedReport.opposing_team}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">סוג משחק</TableCell>
                      <TableCell>{selectedReport.game_type}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">מצבים מנטליים נבחרים</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.selected_states.map((state, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {state}
                    </span>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold mb-2">יעדים</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>יעד</TableHead>
                      <TableHead>מדד הצלחה</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedReport.selected_goals.map((goal, index) => (
                      <TableRow key={index}>
                        <TableCell>{goal.goal}</TableCell>
                        <TableCell>{goal.metric}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </section>

              {selectedReport.current_pressure && (
                <section>
                  <h3 className="text-lg font-semibold mb-2">לחץ</h3>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">לחץ נוכחי</TableCell>
                        <TableCell>{selectedReport.current_pressure}</TableCell>
                      </TableRow>
                      {selectedReport.optimal_pressure && (
                        <TableRow>
                          <TableCell className="font-medium">לחץ אופטימלי</TableCell>
                          <TableCell>{selectedReport.optimal_pressure}</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </section>
              )}

              <section>
                <h3 className="text-lg font-semibold mb-2">תשובות לשאלות</h3>
                <div className="space-y-4">
                  {Object.entries(selectedReport.answers).map(([question, answer], index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium mb-2">{question}</p>
                      <p className="text-gray-700">{answer}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Reports;
