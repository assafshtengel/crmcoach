import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { ColorPicker } from '@/components/ColorPicker';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { LandingPage, supabase } from '@/lib/supabase';
import { uploadImage } from '@/lib/uploadImage';
import { getImageUrl } from '@/lib/getImageUrl';

interface LandingPageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  landingPage?: LandingPage;
  onSave?: (landingPage: LandingPage) => void;
}

export const LandingPageDialog = ({
  open,
  onOpenChange,
  landingPage,
  onSave,
}: LandingPageDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [mainReason, setMainReason] = useState('');
  const [advantages, setAdvantages] = useState<string[]>(['', '', '']);
  const [workSteps, setWorkSteps] = useState<string[]>(['', '', '']);
  const [ctaText, setCtaText] = useState('');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [buttonColor, setButtonColor] = useState('#2563eb');
  const [isDarkText, setIsDarkText] = useState(true);
  const [isPublished, setIsPublished] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (landingPage) {
      setTitle(landingPage.title || '');
      setSubtitle(landingPage.subtitle || '');
      setDescription(landingPage.description || '');
      setContactEmail(landingPage.contact_email || '');
      setContactPhone(landingPage.contact_phone || '');
      setMainReason(landingPage.main_reason || '');
      setAdvantages(landingPage.advantages || ['', '', '']);
      setWorkSteps(landingPage.work_steps || ['', '', '']);
      setCtaText(landingPage.cta_text || '');
      setBgColor(landingPage.bg_color || '#ffffff');
      setAccentColor(landingPage.accent_color || '#3b82f6');
      setButtonColor(landingPage.button_color || '#2563eb');
      setIsDarkText(landingPage.is_dark_text !== false);
      setIsPublished(landingPage.is_published || false);

      // Load profile image if exists
      if (landingPage.profile_image_path) {
        loadProfileImage(landingPage.profile_image_path);
      }
    }
  }, [landingPage]);

  const loadProfileImage = async (imagePath: string) => {
    try {
      const imageUrl = await getImageUrl('landing-pages', imagePath);
      setProfileImagePreview(imageUrl);
    } catch (error) {
      console.error('Error loading profile image:', error);
    }
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdvantageChange = (index: number, value: string) => {
    const newAdvantages = [...advantages];
    newAdvantages[index] = value;
    setAdvantages(newAdvantages);
  };

  const handleWorkStepChange = (index: number, value: string) => {
    const newWorkSteps = [...workSteps];
    newWorkSteps[index] = value;
    setWorkSteps(newWorkSteps);
  };

  const handleSave = async () => {
    if (!title) {
      toast({
        title: 'שגיאה',
        description: 'יש להזין כותרת לדף הנחיתה',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error('לא מחובר');
      }

      let profileImagePath = landingPage?.profile_image_path || null;

      if (profileImage) {
        const timestamp = new Date().getTime();
        const path = `${userData.user.id}/${timestamp}-${profileImage.name}`;
        await uploadImage(profileImage, 'landing-pages', path);
        profileImagePath = path;
      }

      const landingPageData = {
        coach_id: userData.user.id,
        title,
        subtitle,
        description,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        main_reason: mainReason,
        advantages: advantages.filter(a => a.trim() !== ''),
        work_steps: workSteps.filter(s => s.trim() !== ''),
        cta_text: ctaText,
        profile_image_path: profileImagePath,
        bg_color: bgColor,
        accent_color: accentColor,
        button_color: buttonColor,
        is_dark_text: isDarkText,
        is_published: isPublished,
      };

      let result;

      if (landingPage?.id) {
        const { data, error } = await supabase
          .from('landing_pages')
          .update(landingPageData)
          .eq('id', landingPage.id)
          .select()
          .single();

        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from('landing_pages')
          .insert(landingPageData)
          .select()
          .single();

        if (error) throw error;
        result = data;
      }

      toast({
        title: 'נשמר בהצלחה',
        description: 'דף הנחיתה נשמר בהצלחה',
      });

      if (onSave) {
        onSave(result as LandingPage);
      }

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error saving landing page:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'אירעה שגיאה בשמירת דף הנחיתה',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {landingPage ? 'עריכת דף נחיתה' : 'יצירת דף נחיתה חדש'}
          </DialogTitle>
          <DialogDescription>
            צור דף נחיתה מותאם אישית לשיווק השירותים שלך
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="content" className="mt-6">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="content">תוכן</TabsTrigger>
            <TabsTrigger value="design">עיצוב</TabsTrigger>
            <TabsTrigger value="settings">הגדרות</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">כותרת ראשית</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="הכותרת הראשית של דף הנחיתה"
                />
              </div>

              <div>
                <Label htmlFor="subtitle">כותרת משנה</Label>
                <Input
                  id="subtitle"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="כותרת משנה (אופציונלי)"
                />
              </div>

              <div>
                <Label htmlFor="description">תיאור</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="תיאור קצר של השירות שלך"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="mainReason">סיבה עיקרית לבחור בך</Label>
                <Textarea
                  id="mainReason"
                  value={mainReason}
                  onChange={(e) => setMainReason(e.target.value)}
                  placeholder="למה לקוחות צריכים לבחור בך?"
                  rows={2}
                />
              </div>

              <div>
                <Label>יתרונות (עד 3)</Label>
                <div className="space-y-2">
                  {advantages.slice(0, 3).map((advantage, index) => (
                    <Input
                      key={index}
                      value={advantage}
                      onChange={(e) => handleAdvantageChange(index, e.target.value)}
                      placeholder={`יתרון ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label>שלבי עבודה (עד 3)</Label>
                <div className="space-y-2">
                  {workSteps.slice(0, 3).map((step, index) => (
                    <Input
                      key={index}
                      value={step}
                      onChange={(e) => handleWorkStepChange(index, e.target.value)}
                      placeholder={`שלב ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="ctaText">טקסט כפתור קריאה לפעולה</Label>
                <Input
                  id="ctaText"
                  value={ctaText}
                  onChange={(e) => setCtaText(e.target.value)}
                  placeholder="לדוגמה: צור קשר עכשיו"
                />
              </div>

              <div>
                <Label htmlFor="contactEmail">אימייל ליצירת קשר</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="האימייל שלך"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">טלפון ליצירת קשר</Label>
                <Input
                  id="contactPhone"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="מספר הטלפון שלך"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="design" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="profileImage">תמונת פרופיל</Label>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                      {profileImagePreview ? (
                        <img
                          src={profileImagePreview}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Upload className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <Label
                      htmlFor="profile-upload"
                      className="cursor-pointer bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90"
                    >
                      העלה תמונה
                      <Input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageChange}
                      />
                    </Label>
                  </div>
                </div>

                <div>
                  <Label>צבע רקע</Label>
                  <ColorPicker color={bgColor} onChange={setBgColor} />
                </div>

                <div>
                  <Label>צבע הדגשה</Label>
                  <ColorPicker color={accentColor} onChange={setAccentColor} />
                </div>

                <div>
                  <Label>צבע כפתור</Label>
                  <ColorPicker color={buttonColor} onChange={setButtonColor} />
                </div>

                <div className="flex items-center space-x-2 rtl:space-x-reverse">
                  <Switch
                    id="dark-text"
                    checked={isDarkText}
                    onCheckedChange={setIsDarkText}
                  />
                  <Label htmlFor="dark-text">טקסט כהה</Label>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-4">
                <div className="text-center">
                  <h3 className="font-medium mb-2">תצוגה מקדימה של הצבעים</h3>
                  <div
                    className="w-full h-32 rounded-lg mb-4 flex flex-col items-center justify-center"
                    style={{ backgroundColor: bgColor }}
                  >
                    <span
                      className="font-bold text-lg mb-2"
                      style={{ color: isDarkText ? '#000000' : '#ffffff' }}
                    >
                      כותרת לדוגמה
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: isDarkText ? '#333333' : '#f0f0f0' }}
                    >
                      טקסט לדוגמה
                    </span>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: accentColor }}
                    >
                      <span className="text-white text-xs">הדגשה</span>
                    </div>
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: buttonColor }}
                    >
                      <span className="text-white text-xs">כפתור</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <Switch
                  id="is-published"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
                <Label htmlFor="is-published">פרסם דף נחיתה</Label>
              </div>
              <p className="text-sm text-gray-500">
                כאשר דף הנחיתה מפורסם, הוא יהיה נגיש לכל מי שיש לו את הקישור.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between mt-6">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ביטול
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'שומר...' : 'שמור'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
