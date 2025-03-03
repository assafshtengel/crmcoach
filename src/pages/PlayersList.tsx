import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Calendar, Eye, Trash2, Search, Plus, ArrowRight, LayoutDashboard, Copy, User, Key, Link as LinkIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/lib/supabase";
import { generatePassword as generateRandomPassword } from "@/utils/passwordGenerator";

interface Player {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  city: string | null;
  club: string | null;
  sport_field: string | null;
  contact_status: string | null;
  created_at: string;
  password?: string;
  has_account?: boolean;
}

const PlayersList = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [credentialsVisible, setCredentialsVisible] = useState<{ [key: string]: boolean }>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("players")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      const playersWithAuthStatus = await Promise.all(
        (data || []).map(async (player) => {
          const { data: authData } = await supabase.auth.admin.listUsers({
            filter: {
              email: player.email
            }
          });
          
          return {
            ...player,
            has_account: authData && authData.users && authData.users.length > 0,
            password: player.password || generateRandomPassword()
          };
        })
      );

      setPlayers(playersWithAuthStatus);
    } catch (error) {
      console.error("Error fetching players:", error);
      toast({
        title: "שגיאה בטעינת רשימת השחקנים",
        description: "אירעה שגיאה בעת טעינת רשימת השחקנים. נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const filteredPlayers = players.filter((player) => {
    const query = searchQuery.toLowerCase();
    return (
      player.full_name?.toLowerCase().includes(query) ||
      player.email?.toLowerCase().includes(query) ||
      player.phone?.toLowerCase().includes(query) ||
      player.city?.toLowerCase().includes(query) ||
      player.club?.toLowerCase().includes(query) ||
      player.sport_field?.toLowerCase().includes(query)
    );
  });

  const handleDeletePlayer = async () => {
    if (!selectedPlayer) return;

    try {
      const { error } = await supabase
        .from("players")
        .delete()
        .eq("id", selectedPlayer.id);

      if (error) {
        throw error;
      }

      toast({
        title: "השחקן נמחק בהצלחה",
        description: `השחקן ${selectedPlayer.full_name} נמחק מהמערכת`,
      });

      fetchPlayers();
    } catch (error) {
      console.error("Error deleting player:", error);
      toast({
        title: "שגיאה במחיקת השחקן",
        description: "אירעה שגיאה בעת מחיקת השחקן. נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    } finally {
      setShowDeleteDialog(false);
      setSelectedPlayer(null);
    }
  };

  const createPlayerAccount = async (player: Player) => {
    try {
      if (player.has_account) {
        toast({
          title: "כבר קיים חשבון",
          description: `לשחקן ${player.full_name} כבר יש חשבון במערכת`,
        });
        return;
      }

      const password = player.password || generateRandomPassword();
      
      const { data, error } = await supabase.auth.admin.createUser({
        email: player.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: player.full_name,
          role: 'player'
        },
      });

      if (error) {
        throw error;
      }

      const { error: updateError } = await supabase
        .from("players")
        .update({ password: password })
        .eq("id", player.id);

      if (updateError) {
        throw updateError;
      }

      setPlayers(players.map(p => 
        p.id === player.id 
          ? { ...p, password: password, has_account: true } 
          : p
      ));

      toast({
        title: "חשבון שחקן נוצר בהצלחה",
        description: `נוצר חשבון עבור ${player.full_name}`,
      });
    } catch (error: any) {
      console.error("Error creating player account:", error);
      toast({
        title: "שגיאה ביצירת חשבון שחקן",
        description: error.message || "אירעה שגיאה בעת יצירת חשבון השחקן",
        variant: "destructive",
      });
    }
  };

  const toggleCredentialsVisibility = (playerId: string) => {
    setCredentialsVisible(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }));
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "הועתק בהצלחה",
      description: `ה${type} הועתק ללוח`,
    });
  };

  const getPlayerProfileUrl = (playerId: string) => {
    return `${window.location.origin}/dashboard/player-profile/${playerId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate(-1)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>חזור א��ורה</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate("/")}
                >
                  <LayoutDashboard className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>חזור לדף הבית</TooltipContent>
            </Tooltip>
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
            ניהול שחקנים
          </h1>
          <Button onClick={() => navigate("/new-player")} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            הוסף שחקן חדש
          </Button>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="חפש שחקן לפי שם, כתובת מייל, מספר טלפון, עיר או קבוצה..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">שם השחקן</TableHead>
                  <TableHead>אימייל</TableHead>
                  <TableHead>מספר טלפון</TableHead>
                  <TableHead>קבוצה</TableHead>
                  <TableHead>תחום ספורט</TableHead>
                  <TableHead>תאריך הוספה</TableHead>
                  <TableHead className="text-center">סטטוס חשבון</TableHead>
                  <TableHead className="text-center">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPlayers.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      לא נמצאו שחקנים התואמים את החיפוש
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPlayers.map((player) => (
                    <TableRow key={player.id}>
                      <TableCell className="font-medium">
                        {player.full_name}
                      </TableCell>
                      <TableCell>{player.email}</TableCell>
                      <TableCell>
                        {player.phone || <span className="text-gray-400">לא צוין</span>}
                      </TableCell>
                      <TableCell>
                        {player.club || <span className="text-gray-400">לא צוין</span>}
                      </TableCell>
                      <TableCell>
                        {player.sport_field || <span className="text-gray-400">לא צוין</span>}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-gray-500" />
                          <span>
                            {new Date(player.created_at).toLocaleDateString('he-IL')}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {player.has_account ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            פעיל
                          </Badge>
                        ) : (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs" 
                            onClick={() => createPlayerAccount(player)}
                          >
                            יצירת חשבון
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center items-center gap-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => toggleCredentialsVisibility(player.id)}
                                >
                                  <Key className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>פרטי התחברות</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => navigate(`/player-profile/${player.id}`)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>צפה בפרופיל</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <User className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>דף אישי ופרטי התחברות</DialogTitle>
                                <DialogDescription>
                                  פרטי ההתחברות של השחקן {player.full_name} לדף האישי שלו
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">כתובת הדף האישי:</label>
                                  <div className="flex items-center gap-2">
                                    <Input 
                                      value={getPlayerProfileUrl(player.id)} 
                                      readOnly 
                                      className="font-mono text-sm"
                                    />
                                    <Button 
                                      size="icon" 
                                      variant="outline"
                                      onClick={() => copyToClipboard(getPlayerProfileUrl(player.id), "קישור")}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">שם משתמש (אימייל):</label>
                                  <div className="flex items-center gap-2">
                                    <Input value={player.email} readOnly />
                                    <Button 
                                      size="icon" 
                                      variant="outline"
                                      onClick={() => copyToClipboard(player.email, "אימייל")}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <label className="text-sm font-medium">סיסמה:</label>
                                  <div className="flex items-center gap-2">
                                    <Input 
                                      type={credentialsVisible[player.id] ? "text" : "password"} 
                                      value={player.password || "********"} 
                                      readOnly 
                                    />
                                    <Button 
                                      size="icon" 
                                      variant="outline"
                                      onClick={() => toggleCredentialsVisibility(player.id)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button 
                                      size="icon" 
                                      variant="outline"
                                      onClick={() => copyToClipboard(player.password || "", "סיסמה")}
                                      disabled={!player.password}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-md p-3">
                                  <p className="text-sm text-amber-800">
                                    שים לב: יש להעביר את הפרטים הללו לשחקן באופן מאובטח. 
                                    {!player.has_account && " עליך ליצור חשבון עבור השחקן לפני שיוכל להתחבר."}
                                  </p>
                                </div>
                              </div>
                              
                              <DialogFooter>
                                {!player.has_account && (
                                  <Button 
                                    onClick={() => createPlayerAccount(player)}
                                    className="ml-auto"
                                  >
                                    צור חשבון
                                  </Button>
                                )}
                                <Button 
                                  variant="outline" 
                                  onClick={() => navigate(`/dashboard/player-profile/${player.id}`)}
                                  className="flex items-center gap-2"
                                >
                                  <LinkIcon className="h-4 w-4" />
                                  צפה בדף השחקן
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                          
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => setSelectedPlayer(player)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>מחיקת שחקן</AlertDialogTitle>
                                <AlertDialogDescription>
                                  האם אתה בטוח שברצונך למחוק את השחקן {player.full_name}?
                                  פעולה זו אינה ניתנת לביטול.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>ביטול</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeletePlayer} className="bg-red-500 hover:bg-red-600">
                                  מחק שחקן
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayersList;
