
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home, Pencil, Copy, CheckCircle, Eye, Link, Key, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface Player {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  birthdate: string;
  city: string;
  club: string;
  year_group: string;
  injuries: string;
  parent_name: string;
  parent_phone: string;
  parent_email: string;
  notes: string;
  sport_field: string;
  profile_image: string;
  created_at: string;
  password: string | null;
}

const PlayerProfile = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isGeneratingPassword, setIsGeneratingPassword] = useState(false);

  useEffect(() => {
    const fetchPlayer = async () => {
      try {
        setLoading(true);
        
        if (!playerId) {
          throw new Error("No player ID provided");
        }

        const { data, error } = await supabase
          .from('players')
          .select('*')
          .eq('id', playerId)
          .single();

        if (error) throw error;
        if (!data) throw new Error("Player not found");

        setPlayer(data);
      } catch (err: any) {
        console.error("Error fetching player:", err);
        setError(err.message);
        toast.error("שגיאה בטעינת פרטי השחקן");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayer();
  }, [playerId]);

  const handleEditPlayer = () => {
    navigate(`/edit-player/${playerId}`);
  };

  const copyPlayerLink = () => {
    const baseUrl = window.location.origin;
    const profileUrl = `${baseUrl}/dashboard/player-profile/${playerId}`;
    
    navigator.clipboard.writeText(profileUrl)
      .then(() => {
        setCopiedLink(true);
        toast.success("הקישור הועתק בהצלחה");
        setTimeout(() => setCopiedLink(false), 3000);
      })
      .catch(() => {
        toast.error("שגיאה בהעתקת הקישור");
      });
  };

  const copyPlayerId = () => {
    if (!playerId) return;
    
    navigator.clipboard.writeText(playerId)
      .then(() => {
        setCopiedId(true);
        toast.success("מזהה השחקן הועתק בהצלחה");
        setTimeout(() => setCopiedId(false), 3000);
      })
      .catch(() => {
        toast.error("שגיאה בהעתקת מזהה השחקן");
      });
  };

  const viewAsPlayer = () => {
    toast('צפייה בתצוגת שחקן תהיה זמינה בקרוב', {
      description: 'פיתוח תכונה זו בתהליך'
    });
  };

  // Generate a random password of specified length
  const generatePassword = (length: number = 8) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  const handlePasswordReset = async () => {
    if (!player) return;
    
    setIsGeneratingPassword(true);
    try {
      // Generate a new random password
      const password = generatePassword(10);
      setNewPassword(password);
      
      // Update the player's password in the database
      const { error } = await supabase
        .from('players')
        .update({ password: password })
        .eq('id', player.id);
        
      if (error) throw error;
      
      // Update local player state
      setPlayer({...player, password});
      
      // Open the dialog to show the new password
      setPasswordDialogOpen(true);
      toast.success("סיסמה חדשה נוצרה בהצלחה");
    } catch (err: any) {
      console.error("Error resetting password:", err);
      toast.error("שגיאה ביצירת סיסמה חדשה");
    } finally {
      setIsGeneratingPassword(false);
    }
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setNewPassword("");
  };

  const copyPassword = () => {
    if (!newPassword) return;
    
    navigator.clipboard.writeText(newPassword)
      .then(() => {
        toast.success("הסיסמה הועתקה בהצלחה");
      })
      .catch(() => {
        toast.error("שגיאה בהעתקת הסיסמה");
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-medium">שגיאה בטעינת פרטי השחקן</p>
          <p>{error || "לא נמצאו פרטים"}</p>
          <Button 
            onClick={() => navigate('/players-list')}
            className="mt-4"
            variant="outline"
          >
            חזרה לרשימת השחקנים
          </Button>
        </div>
      </div>
    );
  }

  const profileImageUrl = player.profile_image || 'https://via.placeholder.com/150';
  const baseUrl = window.location.origin;
  const profileUrl = `${baseUrl}/dashboard/player-profile/${playerId}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <header className="w-full bg-[#1A1F2C] text-white py-6 mb-8 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">פרופיל שחקן</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 pb-12">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            aria-label="חזרה לדף הקודם"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/players-list')}
            aria-label="חזרה לרשימת השחקנים"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Header Card */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
                <div className="w-24 h-24 relative shrink-0 rounded-full overflow-hidden">
                  <img 
                    src={profileImageUrl} 
                    alt={player.full_name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://via.placeholder.com/150?text=' + encodeURIComponent(player.full_name);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold">{player.full_name}</h2>
                  <p className="text-gray-500">{player.sport_field || "לא צוין ענף ספורטיבי"}</p>
                  <p className="text-gray-700 mt-1">
                    {player.club && player.year_group ? (
                      <span>
                        {player.club} • {player.year_group}
                      </span>
                    ) : player.club ? (
                      <span>{player.club}</span>
                    ) : player.year_group ? (
                      <span>{player.year_group}</span>
                    ) : (
                      <span>לא צוין מועדון/קבוצת גיל</span>
                    )}
                  </p>
                </div>
                <Button onClick={handleEditPlayer} className="shrink-0">
                  <Pencil className="h-4 w-4 mr-2" />
                  ערוך פרטי שחקן
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Access Details Card - New Card for Player Access */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Link className="h-5 w-5" />
                פרטי גישה
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">מזהה שחקן</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={playerId || ""} 
                      readOnly 
                      dir="ltr"
                      className="font-mono text-sm bg-gray-50"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={copyPlayerId} 
                            size="icon" 
                            variant="outline"
                            className="h-9 w-9"
                          >
                            {copiedId ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>העתק מזהה</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">כתובת אימייל</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={player.email} 
                      readOnly 
                      dir="ltr"
                      className="text-sm bg-gray-50"
                    />
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">קישור לפרופיל השחקן</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={profileUrl} 
                      readOnly 
                      dir="ltr"
                      className="font-mono text-sm bg-gray-50"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={copyPlayerLink} 
                            size="icon" 
                            variant="outline"
                            className="h-9 w-9"
                          >
                            {copiedLink ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>העתק קישור</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    ניתן לשתף את הקישור עם השחקן לצפייה בפרופיל שלו
                  </p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">סיסמת גישה</label>
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <div className="flex-1 bg-gray-50 p-3 rounded-md border border-gray-200">
                      {player.password ? (
                        <span className="font-medium text-green-600">✓ קיימת סיסמה</span>
                      ) : (
                        <span className="font-medium text-amber-600">✗ לא הוגדרה סיסמה</span>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={handlePasswordReset}
                      disabled={isGeneratingPassword}
                      className="gap-2 md:w-auto w-full"
                    >
                      <Key className="h-4 w-4" />
                      {player.password ? "איפוס סיסמה" : "יצירת סיסמה"}
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    השחקן יוכל להשתמש באימייל ובסיסמה כדי לגשת לפרופיל שלו
                  </p>
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <Button 
                    variant="outline" 
                    onClick={viewAsPlayer}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    צפה כשחקן
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">פרטים אישיים</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <dl className="grid grid-cols-1 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-700">שם מלא</dt>
                  <dd>{player.full_name}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-700">כתובת אימייל</dt>
                  <dd dir="ltr" className="font-mono text-sm">{player.email}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-700">מספר טלפון</dt>
                  <dd dir="ltr" className="font-mono text-sm">{player.phone || "-"}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-700">תאריך לידה</dt>
                  <dd>{player.birthdate || "-"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          {/* Club Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">פרטי מועדון</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <dl className="grid grid-cols-1 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-700">עיר</dt>
                  <dd>{player.city || "-"}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-700">מועדון</dt>
                  <dd>{player.club || "-"}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-700">שכבת גיל</dt>
                  <dd>{player.year_group || "-"}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-700">ענף ספורט</dt>
                  <dd>{player.sport_field || "-"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          {/* Parent Info Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">פרטי הורים</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <dl className="grid grid-cols-1 gap-y-4">
                <div>
                  <dt className="text-sm font-medium text-gray-700">שם הורה</dt>
                  <dd>{player.parent_name || "-"}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-700">טלפון הורה</dt>
                  <dd dir="ltr" className="font-mono text-sm">{player.parent_phone || "-"}</dd>
                </div>
                
                <div>
                  <dt className="text-sm font-medium text-gray-700">אימייל הורה</dt>
                  <dd dir="ltr" className="font-mono text-sm">{player.parent_email || "-"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          
          {/* Additional Info Card */}
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">מידע נוסף</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">פציעות</h3>
                  <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md min-h-24">
                    {player.injuries || "לא צוינו פציעות"}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">הערות</h3>
                  <p className="whitespace-pre-wrap bg-gray-50 p-3 rounded-md min-h-24">
                    {player.notes || "אין הערות"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Password Reset Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={handleClosePasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>סיסמה חדשה נוצרה</DialogTitle>
            <DialogDescription>
              זוהי הסיסמה החדשה של {player.full_name}. יש לשתף אותה עם השחקן ולהנחות אותו להתחבר עם האימייל והסיסמה.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2 mt-2">
            <div className="grid flex-1 gap-2">
              <label className="text-sm font-medium text-gray-700">הסיסמה החדשה</label>
              <div className="flex items-center gap-2">
                <Input
                  value={newPassword}
                  readOnly
                  dir="ltr"
                  className="font-mono text-base bg-gray-50"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={copyPassword}
                  className="h-9 w-9"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-center">
            <Button variant="default" onClick={handleClosePasswordDialog}>סגור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerProfile;
