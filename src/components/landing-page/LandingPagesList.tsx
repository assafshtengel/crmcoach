
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabaseClient, LandingPage } from '@/lib/supabaseClient';
import { useToast } from '@/hooks/use-toast';
import { Eye, Copy, Trash2, Globe } from 'lucide-react';
import { LandingPageDialog } from './LandingPageDialog';
import { getImageUrl } from '@/lib/getImageUrl';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

export function LandingPagesList() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [deletePageId, setDeletePageId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchLandingPages();
  }, []);

  const fetchLandingPages = async () => {
    try {
      setIsLoading(true);
      
      const { data: session } = await supabaseClient.auth.getSession();
      
      if (!session?.session) {
        toast({
          title: "שגיאה",
          description: "יש להתחבר למערכת כדי לצפות בעמודי הנחיתה",
          variant: "destructive",
        });
        return;
      }

      console.log("Fetching landing pages for coach:", session.session.user.id);
      
      const { data, error } = await supabaseClient
        .from('landing_pages')
        .select('*')
        .eq('coach_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase query error:", error);
        throw error;
      }
      
      if (!data) {
        console.log("No landing pages data returned");
        setLandingPages([]);
        return;
      }
      
      console.log("Landing pages data:", data);
      
      // Ensure all required fields are present, with safe defaults for optional ones
      const typedData: LandingPage[] = data.map(page => ({
        id: page.id,
        coach_id: page.coach_id,
        title: page.title,
        subtitle: page.subtitle || "",
        description: page.description || "",
        contact_email: page.contact_email || "",
        contact_phone: page.contact_phone || "",
        main_reason: page.main_reason || "",
        advantages: page.advantages || [],
        work_steps: page.work_steps || [],
        cta_text: page.cta_text || "",
        profile_image_path: page.profile_image_path,
        is_published: page.is_published || false,
        created_at: page.created_at,
        // Include other fields with defaults
        subtitle_id: page.subtitle_id,
        advantages_ids: page.advantages_ids,
        cta_id: page.cta_id,
        bg_color: page.bg_color || "#ffffff",
        accent_color: page.accent_color || "#000000",
        button_color: page.button_color || "#3b82f6",
        is_dark_text: page.is_dark_text !== undefined ? page.is_dark_text : true,
        styles: page.styles
      }));
      
      setLandingPages(typedData);
    } catch (error) {
      console.error('Error fetching landing pages:', error);
      toast({
        title: "שגיאה בטעינת עמודי הנחיתה",
        description: "אירעה שגיאה בעת טעינת עמודי הנחיתה שלך",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletePageId) return;
    
    try {
      const { error } = await supabaseClient
        .from('landing_pages')
        .delete()
        .eq('id', deletePageId);

      if (error) throw error;
      
      setLandingPages(prev => prev.filter(page => page.id !== deletePageId));
      
      toast({
        title: "עמוד הנחיתה נמחק",
        description: "עמוד הנחיתה נמחק בהצלחה",
      });
    } catch (error) {
      console.error('Error deleting landing page:', error);
      toast({
        title: "שגיאה במחיקת עמוד הנחיתה",
        description: "אירעה שגיאה בעת מחיקת עמוד הנחיתה",
        variant: "destructive",
      });
    } finally {
      setDeletePageId(null);
    }
  };

  const copyToClipboard = (pageId: string) => {
    const url = `${window.location.origin}/landing/${pageId}`;
    navigator.clipboard.writeText(url);
    toast({
      title: "הקישור הועתק",
      description: "הקישור לעמוד הנחיתה הועתק ללוח",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">עמודי הנחיתה שלי</h2>
        <Button onClick={() => setOpenDialog(true)}>צור עמוד נחיתה חדש</Button>
      </div>
      
      {landingPages.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <p className="mb-6 text-gray-500">עדיין אין לך עמודי נחיתה</p>
            <Button onClick={() => setOpenDialog(true)}>צור את עמוד הנחיתה הראשון שלך</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {landingPages.map(page => (
            <Card key={page.id} className="overflow-hidden">
              <div className="h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
                {page.profile_image_path ? (
                  <img 
                    src={getImageUrl(page.profile_image_path)} 
                    alt={page.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400">אין תמונה</div>
                )}
              </div>
              <CardHeader>
                <CardTitle className="truncate">{page.title}</CardTitle>
                <CardDescription>
                  נוצר ב-{new Date(page.created_at).toLocaleDateString('he-IL')}
                  {page.is_published && (
                    <span className="inline-flex items-center ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      <Globe className="w-3 h-3 mr-1" />
                      מפורסם
                    </span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardFooter className="grid grid-cols-3 gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => window.open(`/landing/preview/${page.id}`, '_blank')}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  צפה
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(page.id)}
                  disabled={!page.is_published}
                >
                  <Copy className="w-4 h-4 mr-1" />
                  העתק
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-red-500 hover:text-red-700"
                  onClick={() => setDeletePageId(page.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  מחק
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <LandingPageDialog open={openDialog} onOpenChange={setOpenDialog} onPageCreated={fetchLandingPages} />
      
      <AlertDialog open={!!deletePageId} onOpenChange={(open) => !open && setDeletePageId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>מחיקת עמוד נחיתה</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את עמוד הנחיתה הזה? פעולה זו אינה ניתנת לביטול.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              כן, למחוק
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
