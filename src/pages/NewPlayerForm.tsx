import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const positions = [
  { value: "goalkeeper", label: "שוער" },
  { value: "defender", label: "בלם" },
  { value: "fullback", label: "מגן" },
  { value: "midfielder", label: "קשר" },
  { value: "winger", label: "כנף" },
  { value: "striker", label: "חלוץ" },
];

const leagues = [
  { value: "premier", label: "פרמייר ליג" },
  { value: "laliga", label: "לה ליגה" },
  { value: "israel", label: "ליגת העל" },
  { value: "bundesliga", label: "בונדסליגה" },
  { value: "seriea", label: "סריה א" },
  { value: "other", label: "אחר" },
];

const PlayerForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    position: "",
    jerseyNumber: "",
    team: "",
    league: "",
    customLeague: "",
    followers: "",
    contractValue: "",
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [playerEmail, setPlayerEmail] = useState("");
  const [passwordCopied, setPasswordCopied] = useState(false);

  const getPositionLabel = (value: string) => {
    return positions.find(pos => pos.value === value)?.label || "";
  };

  const getLeagueLabel = (value: string) => {
    const league = leagues.find(league => league.value === value);
    if (league?.value === 'other') {
      return formData.customLeague;
    }
    return league?.label || "";
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const generatePassword = (length = 8) => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let password = "";
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    return password;
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setPasswordCopied(true);
    toast({
      title: "הסיסמה הועתקה!",
      description: "הסיסמה הועתקה ללוח. ניתן לשלוח אותה לשחקן."
    });
    
    setTimeout(() => {
      setPasswordCopied(false);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר מחדש",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      let profileImagePath = null;

      if (selectedImage) {
        const fileExt = selectedImage.name.split('.').pop();
        const filePath = `${user.id}-${Math.random()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('player-avatars')
          .upload(filePath, selectedImage);

        if (uploadError) {
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('player-avatars')
          .getPublicUrl(filePath);

        profileImagePath = publicUrl;
      }

      const password = generatePassword(10);
      if (!password || password.trim() === '') {
        throw new Error('שגיאה ביצירת סיסמה לשחקן');
      }
      setGeneratedPassword(password);

      const playerEmail = `${formData.fullName.replace(/\s+/g, '.')
        .toLowerCase()}@example.com`;
      setPlayerEmail(playerEmail);

      const playerData = {
        coach_id: user.id,
        full_name: formData.fullName,
        email: playerEmail,
        phone: "",
        password: password,
        profile_image: profileImagePath,
        sport_field: formData.position
      };

      console.log("Creating new player with data:", {
        ...playerData,
        password: "REDACTED"
      });

      const { data: playerResponse, error: playerError } = await supabase
        .from("players")
        .insert([playerData])
        .select();

      if (playerError) {
        console.error("Error creating player:", playerError);
        throw playerError;
      }

      if (!playerResponse || playerResponse.length === 0) {
        throw new Error("שגיאה ביצירת השחקן - לא התקבל מזהה");
      }

      console.log("Player created with response:", {
        ...playerResponse[0],
        password: "REDACTED"
      });

      const playerId = playerResponse[0].id;
      console.log("Player created successfully with ID:", playerId);

      const detailsData = {
        id: playerId,
        full_name: formData.fullName,
        position: formData.position,
        jersey_number: parseInt(formData.jerseyNumber) || 0,
        team: formData.team,
        league: formData.league === 'other' ? formData.customLeague : getLeagueLabel(formData.league),
        followers: parseInt(formData.followers) || 0,
        contract_value: parseInt(formData.contractValue) || 0,
        profile_image: profileImagePath,
      };

      const { error: detailsError } = await supabase
        .from("player_details")
        .insert([detailsData]);
      
      if (detailsError) {
        console.error("Error creating player details:", detailsError);
        throw detailsError;
      }

      setShowPasswordDialog(true);

    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "שגיאה",
        description: error.message || "אירעה שגיאה בשמירת הפרטים",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClosePasswordDialog = () => {
    setShowPasswordDialog(false);
    toast({
      title: "הפרטים נשמרו בהצלחה",
      description: "השחקן נוצר וסיסמה נוצרה עבורו",
    });
    navigate("/players-list");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="outline"
          size="icon"
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-bold text-center bg-gradient-to-r from-purple-600 to-orange-500 bg-clip-text text-transparent">
                  יצירת שחקן חדש
                </CardTitle>
                <CardDescription className="text-center text-gray-600">
                  מלא את הפרטים ליצירת שחקן חדש במערכת. השחקן יקבל סיסמה אוטומטית.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <Avatar className="w-32 h-32">
                      <AvatarImage src={imagePreview || undefined} alt="תמונת פרופיל" />
                      <AvatarFallback>
                        {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : 'P'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col items-center">
                      <Label htmlFor="profile-image" className="cursor-pointer">
                        <div className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors">
                          {imagePreview ? 'החלף תמונה' : 'העלה תמונת פרופיל'}
                        </div>
                        <Input
                          id="profile-image"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </Label>
                      {imagePreview && (
                        <Button
                          type="button"
                          variant="ghost"
                          className="mt-2 text-sm text-destructive"
                          onClick={() => {
                            setSelectedImage(null);
                            setImagePreview(null);
                          }}
                        >
                          הסר תמונה
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">שם מלא</Label>
                    <Input
                      id="fullName"
                      placeholder="השם שיופיע בחוזה שלך"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="position">עמדה במגרש</Label>
                    <Select
                      value={formData.position}
                      onValueChange={(value) =>
                        setFormData({ ...formData, position: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר את העמדה שלך" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {positions.map((position) => (
                          <SelectItem key={position.value} value={position.value}>
                            {position.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jerseyNumber">מספר חולצה</Label>
                    <Input
                      id="jerseyNumber"
                      type="number"
                      min="1"
                      max="99"
                      placeholder="המספר שילווה את הקריירה שלך"
                      value={formData.jerseyNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, jerseyNumber: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="team">באיזו קבוצה אתה משחק בגיל 24?</Label>
                    <Input
                      id="team"
                      placeholder="שם הקבוצה"
                      value={formData.team}
                      onChange={(e) =>
                        setFormData({ ...formData, team: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="league">באיזו ליגה אתה משחק?</Label>
                    <Select
                      value={formData.league}
                      onValueChange={(value) =>
                        setFormData({ ...formData, league: value })
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="בחר את הליגה" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        {leagues.map((league) => (
                          <SelectItem key={league.value} value={league.value}>
                            {league.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.league === 'other' && (
                    <div className="space-y-2">
                      <Label htmlFor="customLeague">שם הליגה</Label>
                      <Input
                        id="customLeague"
                        placeholder="הזן את שם הליגה"
                        value={formData.customLeague}
                        onChange={(e) =>
                          setFormData({ ...formData, customLeague: e.target.value })
                        }
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="followers">כמה אוהדים יש לך באינסטגרם?</Label>
                    <Input
                      id="followers"
                      type="number"
                      min="0"
                      placeholder="מספר העוקבים"
                      value={formData.followers}
                      onChange={(e) =>
                        setFormData({ ...formData, followers: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractValue">מה החוזה הראשון שלך שווה? (ביורו)</Label>
                    <Input
                      id="contractValue"
                      type="number"
                      min="0"
                      placeholder="שווי החוזה ביורו"
                      value={formData.contractValue}
                      onChange={(e) =>
                        setFormData({ ...formData, contractValue: e.target.value })
                      }
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    size="lg"
                    disabled={uploading}
                  >
                    {uploading ? 'שומר...' : 'צור שחקן חדש'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="hidden md:block">
            <div className="bg-white p-8 rounded-xl shadow-xl border-2 border-gray-100 min-h-[600px] relative">
              <div className="flex justify-center mb-8">
                <div className="w-24 h-24 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">FC</span>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">
                {formData.fullName ? 
                  `החוזה המקצועני הראשון של ${formData.fullName}` :
                  "החוזה המקצועני הראשון"
                }
              </h1>

              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  {formData.fullName && formData.team && formData.league ? 
                    `${formData.fullName} חתם על חוזה מקצועני בקבוצת ${formData.team}, המשחקת ב${
                      formData.league === 'other' ? formData.customLeague : getLeagueLabel(formData.league)
                    }.` :
                    "_________ חתם על חוזה מקצועני בקבוצת _________, המשחקת ב_________."
                  }
                </p>
                <p>
                  {formData.position && formData.jerseyNumber ? 
                    `השחקן ישחק בעמדת ${getPositionLabel(formData.position)}, עם מספר ${formData.jerseyNumber}, ויציג יכולות יוצאות דופן על המגרש.` :
                    "השחקן ישחק בעמדת ______, עם מספר __, ויציג יכולות יוצאות דופן על המגרש."
                  }
                </p>
                <p>
                  {formData.contractValue && formData.followers ? 
                    `השחקן חתם על חוזה בשווי ${formData.contractValue} יורו לעונה, וצבר קהל של ${formData.followers} אוהדים באינסטגרם.` :
                    "השחקן חתם על חוזה בשווי ______ יורו לעונה, וצבר קהל של ______ אוהדים באינסטגרם."
                  }
                </p>
                <p>עם יכולותיו המרשימות וכוחו המנטלי, הוא בדרכו להפוך לאחד הכוכבים הגדולים בעולם!</p>
              </div>

              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                <div className="transform rotate-45 text-6xl font-bold text-gray-300">
                  OFFICIAL
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>השחקן נוצר בהצלחה!</DialogTitle>
            <DialogDescription>
              השתמש בפרטים הבאים כדי לשתף עם השחקן את פרטי הכניסה שלו
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>שם משתמש (אימייל)</Label>
              <div className="flex items-center space-x-2">
                <Input readOnly value={playerEmail} className="flex-1" dir="ltr" />
                <Button variant="outline" onClick={() => {
                  navigator.clipboard.writeText(playerEmail);
                  toast({ title: "האימייל הועתק!" });
                }}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>סיסמה</Label>
              <div className="flex items-center space-x-2">
                <Input readOnly value={generatedPassword} className="flex-1" dir="ltr" />
                <Button variant="outline" onClick={handleCopyPassword}>
                  {passwordCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                שמור את הסיסמה! לא תוכל לראות אותה שוב לאחר סגירת חלון זה.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleClosePasswordDialog}>סגור</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlayerForm;
