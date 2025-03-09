import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ChevronRight, Home, Pencil, Copy, CheckCircle, Eye, Link, KeyRound, ListChecks } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  password: string;
}

const PlayerProfile = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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

  const copyPassword = () => {
    if (!player || !player.password) {
      toast.error("לא נמצאה סיסמה לשחקן זה");
      return;
    }
    
    navigator.clipboard.writeText(player.password)
      .then(() => {
        setCopiedPassword(true);
        toast.success("הסיסמה הועתקה בהצלחה");
        setTimeout(() => setCopiedPassword(false), 3000);
      })
      .catch(() => {
        toast.error("שגיאה בהעתקת הסיסמה");
      });
  };

  const resetPassword = async () => {
    if (!player) return;
    
    try {
      const newPassword = Math.random().toString(36).slice(-10);
      
      const { error } = await supabase
        .from('players')
        .update({ password: newPassword })
        .eq('id', player.id);
        
      if (error) throw error;
      
      setPlayer({ ...player, password: newPassword });
      setShowPassword(true);
      
      toast.success("הסיסמה אופסה בהצלחה");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("שגיאה באיפוס הסיסמה");
    }
  };

  const viewAsPlayer = () => {
    if (!player) return;
    
    const playerSession = {
      id: player.id,
      email: player.email,
      password: player.password
    };
    
    localStorage.setItem('playerSession', JSON.stringify(playerSession));
    
    window.open('/game-prep', '_blank');
  };

  const openGamePreparation = () => {
    if (!player) return;
    
    const playerSession = {
      id: player.id,
      email: player.email,
      password: player.password
    };
    
    localStorage.setItem('playerSession', JSON.stringify(playerSession));
    
    window.open('/game-prep', '_blank');
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
  const playerLoginUrl = `${baseUrl}/player-auth`;

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
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">סיסמת גישה</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type={showPassword ? "text" : "password"}
                      value={player.password || "אין סיסמה"} 
                      readOnly 
                      dir="ltr"
                      className="font-mono text-sm bg-gray-50"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={() => setShowPassword(!showPassword)} 
                            size="icon" 
                            variant="outline"
                            className="h-9 w-9"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>{showPassword ? "הסתר סיסמה" : "הצג סיסמה"}</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={copyPassword} 
                            size="icon" 
                            variant="outline"
                            className="h-9 w-9"
                            disabled={!player.password}
                          >
                            {copiedPassword ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>העתק סיסמה</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={resetPassword} 
                            size="icon" 
                            variant="outline"
                            className="h-9 w-9"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>איפוס סיסמה</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  {!player.password && (
                    <p className="text-sm text-amber-600">
                      השחקן אינו יכול להתחבר כרגע. לחץ על סמל המפתח כדי לייצר סיסמה.
                    </p>
                  )}
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">קישור לדף הכניסה לשחקנים</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={playerLoginUrl} 
                      readOnly 
                      dir="ltr"
                      className="font-mono text-sm bg-gray-50"
                    />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            onClick={() => {
                              navigator.clipboard.writeText(playerLoginUrl);
                              toast.success("קישור דף הכניסה הועתק בהצלחה");
                            }} 
                            size="icon" 
                            variant="outline"
                            className="h-9 w-9"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>העתק קישור לדף הכניסה</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    השחקן יכול להתחבר באמצעות כתובת האימייל והסיסמה שלו בדף הכניסה לשחקנים
                  </p>
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
                    קישור ישיר לפרופיל השחקן (דורש התחברות של המאמן או השחקן)
                  </p>
                </div>

                <div className="md:col-span-2 flex flex-wrap gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={viewAsPlayer}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    צפה כשחקן
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={openGamePreparation}
                    className="gap-2"
                  >
                    <ListChecks className="h-4 w-4" />
                    הכנה למשחק
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

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
    </div>
  );
};

export default PlayerProfile;
