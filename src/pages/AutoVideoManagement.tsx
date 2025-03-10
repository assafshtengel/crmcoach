
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Calendar, 
  Search, 
  CheckCircle, 
  XCircle, 
  ClockIcon, 
  Info,
  Eye,
  RefreshCw,
  UserPlus
} from "lucide-react";
import { format, isAfter, parseISO } from "date-fns";

interface VideoAssignment {
  id: string;
  player_id: string;
  video_id: string;
  scheduled_for: string;
  sent: boolean;
  assigned_at: string;
  videos?: {
    id: string;
    title: string;
    days_after_registration: number;
    url?: string;
    description?: string;
  };
  players?: {
    id: string;
    full_name: string;
    email: string;
    created_at: string;
  };
}

export default function AutoVideoManagement() {
  const [allAssignments, setAllAssignments] = useState<VideoAssignment[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<VideoAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [processResult, setProcessResult] = useState<any>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<VideoAssignment | null>(null);
  const [playerCountInfo, setPlayerCountInfo] = useState({ total: 0, withVideos: 0 });
  const [showAddPlayerDialog, setShowAddPlayerDialog] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerEmail, setNewPlayerEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchAssignments();
    getPlayerStats();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      console.log("Fetching auto video assignments...");

      const { data, error } = await supabase
        .from("auto_video_assignments")
        .select(`
          *,
          videos:video_id (id, title, days_after_registration, url, description),
          players:player_id (id, full_name, email, created_at)
        `)
        .order("scheduled_for", { ascending: false });

      if (error) {
        console.error("Error fetching assignments:", error);
        throw error;
      }

      console.log("Assignments data:", data);
      
      const nullPlayerNames = data?.filter(a => !a.players?.full_name);
      if (nullPlayerNames && nullPlayerNames.length > 0) {
        console.warn("Found assignments with null player names:", nullPlayerNames);
      }

      setAllAssignments(data || []);
      applyFilters(data || [], searchQuery, activeTab);
    } catch (error) {
      console.error("Error in fetchAssignments:", error);
      toast({
        title: "שגיאה בטעינת הנתונים",
        description: "לא ניתן לטעון את הנתונים מהשרת",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshAssignments = async () => {
    setRefreshing(true);
    await fetchAssignments();
    await getPlayerStats();
    setRefreshing(false);
    toast({
      title: "הנתונים רועננו",
      description: "רשימת הסרטונים האוטומטיים עודכנה",
    });
  };

  const getPlayerStats = async () => {
    try {
      const { count: totalCount, error: totalError } = await supabase
        .from("players")
        .select("*", { count: "exact", head: true });

      const { data: playersWithVideos, error: videoError } = await supabase
        .from("auto_video_assignments")
        .select("player_id", { count: "exact" })
        .not("player_id", "is", null);

      const uniquePlayerIds = new Set(playersWithVideos?.map(a => a.player_id));

      if (totalError || videoError) {
        console.error("Error fetching player stats:", totalError || videoError);
        return;
      }

      setPlayerCountInfo({
        total: totalCount || 0,
        withVideos: uniquePlayerIds.size
      });

    } catch (error) {
      console.error("Error in getPlayerStats:", error);
    }
  };

  const handleProcess = async () => {
    try {
      setProcessResult(null);
      
      const { data, error } = await supabase.functions.invoke('process-auto-videos', {
        method: 'POST',
        body: {}
      });
      
      if (error) {
        console.error("Error processing assignments:", error);
        throw error;
      }
      
      console.log("Process result:", data);
      setProcessResult(data);
      
      await fetchAssignments();
      
      toast({
        title: "הסרטונים עובדו בהצלחה",
        description: `${data.sent_in_last_24h || 0} סרטונים נשלחו ב-24 השעות האחרונות`,
      });
    } catch (error) {
      console.error("Error in handleProcess:", error);
      toast({
        title: "שגיאה בעיבוד הסרטונים",
        description: "לא ניתן לעבד את הסרטונים האוטומטיים",
        variant: "destructive",
      });
    }
  };

  const addTestPlayer = async () => {
    if (!newPlayerName || !newPlayerEmail) {
      toast({
        title: "נתונים חסרים",
        description: "יש להזין שם ואימייל",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const coachId = userData.user?.id;

      if (!coachId) {
        throw new Error("לא נמצא מזהה מאמן");
      }

      const { data: newPlayer, error } = await supabase
        .from('players')
        .insert([
          { 
            full_name: newPlayerName,
            email: newPlayerEmail,
            coach_id: coachId,
            phone: "000-0000000"
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "שחקן נוסף בהצלחה",
        description: "השחקן נוסף והסרטונים האוטומטיים יתוזמנו",
      });

      setNewPlayerName("");
      setNewPlayerEmail("");
      setShowAddPlayerDialog(false);

      setTimeout(async () => {
        await refreshAssignments();
        checkNewPlayerAssignments(newPlayer?.[0]?.id);
      }, 2000);

    } catch (error: any) {
      console.error("Error adding test player:", error);
      toast({
        title: "שגיאה בהוספת שחקן",
        description: error.message || "לא ניתן להוסיף את השחקן",
        variant: "destructive",
      });
    }
  };

  const checkNewPlayerAssignments = async (playerId: string) => {
    if (!playerId) return;
    
    try {
      const { data, error } = await supabase
        .from("auto_video_assignments")
        .select(`
          *,
          videos:video_id (title, days_after_registration),
          players:player_id (full_name, email)
        `)
        .eq('player_id', playerId);
        
      if (error) {
        console.error(`Error checking assignments for player ${playerId}:`, error);
        return;
      }
      
      console.log(`Auto assignments for new player (${playerId}):`, data);
      
      if (data && data.length > 0) {
        toast({
          title: "סרטונים אוטומטיים",
          description: `תוזמנו ${data.length} סרטונים אוטומטית לשחקן החדש`,
        });
      } else {
        toast({
          title: "אין סרטונים אוטומטיים",
          description: "לא נמצאו סרטונים אוטומטיים לשחקן החדש",
          variant: "destructive",
        });
        
        await handleProcess();
      }
    } catch (error) {
      console.error("Error checking new player assignments:", error);
    }
  };

  const applyFilters = (assignments: VideoAssignment[], query: string, tab: string) => {
    let filtered = [...assignments];
    
    if (query) {
      const searchLower = query.toLowerCase();
      filtered = filtered.filter(assignment => {
        const playerName = assignment.players?.full_name?.toLowerCase() || "";
        const playerEmail = assignment.players?.email?.toLowerCase() || "";
        const videoTitle = assignment.videos?.title?.toLowerCase() || "";
        
        return playerName.includes(searchLower) || 
               playerEmail.includes(searchLower) || 
               videoTitle.includes(searchLower);
      });
    }
    
    if (tab === "pending") {
      filtered = filtered.filter(assignment => !assignment.sent);
    } else if (tab === "sent") {
      filtered = filtered.filter(assignment => assignment.sent);
    } else if (tab === "upcoming") {
      const now = new Date();
      filtered = filtered.filter(assignment => 
        !assignment.sent && 
        assignment.scheduled_for && 
        isAfter(parseISO(assignment.scheduled_for), now)
      );
    }
    
    setFilteredAssignments(filtered);
  };

  useEffect(() => {
    applyFilters(allAssignments, searchQuery, activeTab);
  }, [searchQuery, activeTab, allAssignments]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const viewAssignmentDetails = (assignment: VideoAssignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsDialog(true);
  };

  const checkAutoVideoScheduling = async () => {
    try {
      console.log("Checking auto video scheduling functionality...");
      
      const { data: autoVideos, error: videosError } = await supabase
        .from('videos')
        .select('id, title, is_auto_scheduled, days_after_registration')
        .eq('is_auto_scheduled', true);
        
      if (videosError) {
        console.error("Error checking auto-scheduled videos:", videosError);
      } else {
        console.log("Videos configured for auto-scheduling:", autoVideos);
        
        if (!autoVideos || autoVideos.length === 0) {
          console.warn("No videos are configured for auto-scheduling!");
        }
      }

      const { data: latestPlayers, error: playersError } = await supabase
        .from('players')
        .select('id, created_at, full_name')
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (playersError) {
        console.error("Error fetching latest players:", playersError);
      } else {
        console.log("Latest registered players:", latestPlayers);
        
        for (const player of (latestPlayers || [])) {
          const { data: playerAssignments, error: assignmentsError } = await supabase
            .from('auto_video_assignments')
            .select(`
              *,
              videos:video_id (title, days_after_registration)
            `)
            .filter('player_id', 'eq', player.id);
            
          if (assignmentsError) {
            console.error(`Error checking assignments for player ${player.id}:`, assignmentsError);
          } else {
            console.log(`Auto video assignments for player ${player.full_name} (${player.id}):`, playerAssignments);
          }
        }
      }

      const { error: dbFunctionError } = await supabase
        .rpc('process_auto_video_assignments');
      
      if (dbFunctionError) {
        console.error("Error calling auto video scheduling function:", dbFunctionError);
      } else {
        console.log("Auto video scheduling function was called successfully");
      }
    } catch (error) {
      console.error("Error in checkAutoVideoScheduling:", error);
    }
  };

  useEffect(() => {
    checkAutoVideoScheduling();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return "לא צוין";
    try {
      return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center mb-2">
                <Calendar className="mr-2 rtl:ml-2 rtl:mr-0 h-6 w-6" />
                ניהול סרטונים אוטומטיים
              </CardTitle>
              <CardDescription>
                צפה בהקצאות הסרטונים האוטומטיות שנקבעו לשחקנים
              </CardDescription>
            </div>
            <div className="flex space-x-2 rtl:space-x-reverse">
              <Button 
                onClick={() => setShowAddPlayerDialog(true)}
                variant="outline"
                className="flex items-center"
              >
                <UserPlus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                הוסף שחקן נסיון
              </Button>
              <Button 
                onClick={refreshAssignments}
                variant="outline"
                disabled={refreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 ${refreshing ? 'animate-spin' : ''}`} />
                רענן נתונים
              </Button>
              <Button onClick={handleProcess}>
                עבד סרטונים
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{allAssignments.length}</div>
                    <p className="text-sm text-gray-500 mt-1">סה"כ הקצאות סרטונים</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {allAssignments.filter(a => a.sent).length}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">סרטונים שנשלחו</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold">
                      {playerCountInfo.withVideos}/{playerCountInfo.total}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">שחקנים עם סרטונים</p>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
              <div className="relative max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  className="pl-3 pr-10 rtl:pr-3 rtl:pl-10"
                  placeholder="חיפוש לפי שם שחקן או כותרת סרטון..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                />
              </div>
              <Tabs 
                value={activeTab} 
                onValueChange={handleTabChange}
                className="w-full md:w-auto"
              >
                <TabsList className="grid grid-cols-4 w-full md:w-auto">
                  <TabsTrigger value="all">הכל</TabsTrigger>
                  <TabsTrigger value="pending">ממתינים</TabsTrigger>
                  <TabsTrigger value="sent">נשלחו</TabsTrigger>
                  <TabsTrigger value="upcoming">קרובים</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-4">טוען הקצאות סרטונים...</p>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="text-center py-12 border rounded-lg">
                <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">לא נמצאו הקצאות סרטונים</p>
                {searchQuery && (
                  <p className="text-sm text-gray-400 mt-2">נסה לשנות את מונחי החיפוש</p>
                )}
              </div>
            ) : (
              <div className="overflow-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        שם השחקן
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        כותרת הסרטון
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        תאריך יעד
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        סטטוס
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        פעולות
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAssignments.map((assignment) => (
                      <tr key={assignment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {assignment.players?.full_name || "שחקן לא ידוע"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {assignment.videos?.title || "סרטון לא ידוע"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {formatDate(assignment.scheduled_for)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {assignment.sent ? (
                            <Badge className="bg-green-100 text-green-800 flex items-center w-fit">
                              <CheckCircle className="h-3.5 w-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                              נשלח
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="flex items-center w-fit">
                              <ClockIcon className="h-3.5 w-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                              ממתין
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => viewAssignmentDetails(assignment)}
                          >
                            <Eye className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                            פרטים
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {processResult && (
              <Card className="mt-4 bg-blue-50 border-blue-200">
                <CardContent className="pt-4">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue-500 mr-2 rtl:ml-2 rtl:mr-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-blue-700">תוצאות עיבוד סרטונים</h3>
                      <p className="text-sm text-blue-600 mt-1">
                        {processResult.sent_in_last_24h} סרטונים נשלחו ב-24 השעות האחרונות
                      </p>
                      {processResult.fixed_null_dates > 0 && (
                        <p className="text-sm text-blue-600 mt-1">
                          {processResult.fixed_null_dates} הקצאות תוקנו
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>פרטי הקצאת סרטון</DialogTitle>
            <DialogDescription>
              פרטים מלאים על הקצאת הסרטון האוטומטית
            </DialogDescription>
          </DialogHeader>
          {selectedAssignment && (
            <div className="space-y-4 py-4">
              <div className="space-y-1">
                <h4 className="text-sm font-medium">שם השחקן</h4>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {selectedAssignment.players?.full_name || "לא ידוע"}
                </p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">אימייל</h4>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {selectedAssignment.players?.email || "לא ידוע"}
                </p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">תאריך הרשמה</h4>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {selectedAssignment.players?.created_at 
                    ? formatDate(selectedAssignment.players.created_at) 
                    : "לא ידוע"}
                </p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">כותרת הסרטון</h4>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {selectedAssignment.videos?.title || "לא ידוע"}
                </p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">ימים לאחר הרשמה</h4>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {selectedAssignment.videos?.days_after_registration || "לא ידוע"}
                </p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">תאריך יעד לשליחה</h4>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {formatDate(selectedAssignment.scheduled_for)}
                </p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">תאריך הקצאה</h4>
                <p className="text-sm bg-gray-50 p-2 rounded">
                  {formatDate(selectedAssignment.assigned_at)}
                </p>
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-medium">סטטוס</h4>
                <div className="bg-gray-50 p-2 rounded">
                  {selectedAssignment.sent ? (
                    <Badge className="bg-green-100 text-green-800">נשלח</Badge>
                  ) : (
                    <Badge variant="outline">ממתין לשליחה</Badge>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>סגור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAddPlayerDialog} onOpenChange={setShowAddPlayerDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>הוסף שחקן ניסיון</DialogTitle>
            <DialogDescription>
              הוסף שחקן חדש לבדיקת מערכת שליחת הסרטונים האוטומטיים
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="playerName" className="text-sm font-medium">שם מלא</label>
              <Input
                id="playerName"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="הזן שם מלא"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="playerEmail" className="text-sm font-medium">אימייל</label>
              <Input
                id="playerEmail"
                type="email"
                value={newPlayerEmail}
                onChange={(e) => setNewPlayerEmail(e.target.value)}
                placeholder="הזן כתובת אימייל"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-700">
                שחקן זה יתווסף למערכת וסרטונים אוטומטיים יתוזמנו עבורו בהתאם להגדרות.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPlayerDialog(false)}>ביטול</Button>
            <Button onClick={addTestPlayer}>הוסף שחקן</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
