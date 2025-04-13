import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, FilePenLine, Globe, Plus, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LandingPage, supabase } from '@/lib/supabase';
import { getImageUrl } from '@/lib/getImageUrl';
import { LandingPageDialog } from './LandingPageDialog';
import { Card, CardContent } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';

interface LandingPagesListProps {
  coachId?: string;
}

export const LandingPagesList = ({ coachId }: LandingPagesListProps) => {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedLandingPage, setSelectedLandingPage] = useState<LandingPage | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [landingPageToDelete, setLandingPageToDelete] = useState<LandingPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLandingPages();
  }, []);

  const fetchLandingPages = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from('landing_pages').select('*').order('created_at', { ascending: false });
      
      if (coachId) {
        query = query.eq('coach_id', coachId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching landing pages:', error);
        toast({
          title: 'שגיאה',
          description: 'אירעה שגיאה בטעינת עמודי הנחיתה',
          variant: 'destructive',
        });
        return;
      }

      setLandingPages(data || []);
    } catch (error) {
      console.error('Unexpected error fetching landing pages:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה לא צפויה',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setSelectedLandingPage(null);
      fetchLandingPages();
    }
  };

  const handleEdit = (landingPage: LandingPage) => {
    setSelectedLandingPage(landingPage);
    setOpen(true);
  };

  const handleCreate = () => {
    setSelectedLandingPage(null);
    setOpen(true);
  };

  const handleDelete = (landingPage: LandingPage) => {
    setLandingPageToDelete(landingPage);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!landingPageToDelete) return;

    try {
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', landingPageToDelete.id);

      if (error) {
        console.error('Error deleting landing page:', error);
        toast({
          title: 'שגיאה',
          description: 'אירעה שגיאה במחיקת עמוד הנחיתה',
          variant: 'destructive',
        });
        return;
      }

      setLandingPages(landingPages.filter(lp => lp.id !== landingPageToDelete.id));
      setIsDeleteDialogOpen(false);
      setLandingPageToDelete(null);
      toast({
        title: 'עמוד נחיתה נמחק',
        description: 'עמוד הנחיתה נמחק בהצלחה',
      });
    } catch (error) {
      console.error('Unexpected error deleting landing page:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה לא צפויה',
        variant: 'destructive',
      });
    }
  };

  const togglePublish = async (landingPage: LandingPage) => {
    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({ is_published: !landingPage.is_published })
        .eq('id', landingPage.id);

      if (error) {
        console.error('Error updating landing page:', error);
        toast({
          title: 'שגיאה',
          description: 'אירעה שגיאה בעדכון עמוד הנחיתה',
          variant: 'destructive',
        });
        return;
      }

      setLandingPages(landingPages.map(lp =>
        lp.id === landingPage.id ? { ...lp, is_published: !lp.is_published } : lp
      ));
      toast({
        title: 'סטטוס פורסם שונה',
        description: `עמוד הנחיתה ${landingPage.is_published ? 'הוסר מפרסום' : 'פורסם'}`,
      });
    } catch (error) {
      console.error('Unexpected error updating landing page:', error);
      toast({
        title: 'שגיאה',
        description: 'אירעה שגיאה לא צפויה',
        variant: 'destructive',
      });
    }
  };

  const copyLink = (landingPage: LandingPage) => {
    const link = `${window.location.origin}/landing/${landingPage.id}`;
    navigator.clipboard.writeText(link);
    toast({
      title: 'הקישור הועתק',
      description: 'הקישור לעמוד הנחיתה הועתק ללוח',
    });
  };

// Update the getProfileImage function to handle the async getImageUrl correctly
const getProfileImage = async (landingPage: LandingPage) => {
  if (!landingPage.profile_image_path) return '';
  return await getImageUrl('landing-pages', landingPage.profile_image_path);
};

// Update image handling in the renderLandingPageCards function
const renderLandingPageCards = () => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="h-24 bg-gray-200 rounded-md mb-2"></div>
              <div className="h-4 bg-gray-200 rounded-md mb-1"></div>
              <div className="h-4 bg-gray-200 rounded-md"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  return landingPages.map(landingPage => {
    // Update to handle async image URL properly
    const [imageUrl, setImageUrl] = useState<string>('');
    
    useEffect(() => {
      const loadImage = async () => {
        if (landingPage.profile_image_path) {
          const url = await getProfileImage(landingPage);
          setImageUrl(url);
        }
      };
      loadImage();
    }, [landingPage]);
    
    return (
      <Card key={landingPage.id} className="bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm">
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium">{landingPage.title}</h3>
              <p className="text-sm text-gray-500">{landingPage.subtitle}</p>
            </div>
            <Badge variant={landingPage.is_published ? 'default' : 'secondary'}>
              {landingPage.is_published ? 'פורסם' : 'לא פורסם'}
            </Badge>
          </div>
          <div className="mt-4 flex items-center space-x-4">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                <Globe className="w-8 h-8 text-gray-500" />
              </div>
            )}
            <div className="flex flex-col space-y-1">
              <Button variant="ghost" size="sm" onClick={() => copyLink(landingPage)}>
                <Copy className="h-4 w-4 mr-2" />
                העתק קישור
              </Button>
              <Button variant="ghost" size="sm" onClick={() => window.open(`/landing/${landingPage.id}`, '_blank')}>
                <ExternalLink className="h-4 w-4 mr-2" />
                תצוגה מקדימה
              </Button>
            </div>
          </div>
          <div className="mt-4 flex justify-end space-x-2">
            <Button variant="outline" size="sm" onClick={() => togglePublish(landingPage)}>
              {landingPage.is_published ? 'הסר מפרסום' : 'פרסם'}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => handleEdit(landingPage)}>
              <FilePenLine className="h-4 w-4 mr-2" />
              ערוך
            </Button>
            <Button variant="destructive" size="sm" onClick={() => handleDelete(landingPage)}>
              <Trash className="h-4 w-4 mr-2" />
              מחק
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  });
};

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">עמודי נחיתה</h2>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          צור עמוד נחיתה
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {renderLandingPageCards()}
      </div>

      <LandingPageDialog open={open} onOpenChange={handleOpenChange} landingPage={selectedLandingPage} />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              האם אתה בטוח שברצונך למחוק את עמוד הנחיתה הזה? פעולה זו היא בלתי הפיכה.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
