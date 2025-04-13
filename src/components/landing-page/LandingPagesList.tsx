import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { getImageUrl } from '@/lib/getImageUrl';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { LandingPage } from '@/types/supabaseTypes';
import { Edit, Eye, Copy, Trash2, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface LandingPagesListProps {
  coachId: string;
  onEdit: (landingPage: LandingPage) => void;
}

const getLandingPageImageUrl = async (imagePath: string | null) => {
  if (!imagePath) return '';
  return getImageUrl(imagePath, 'landing-pages');
};

const LandingPagesList: React.FC<LandingPagesListProps> = ({ coachId, onEdit }) => {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLandingPageId, setSelectedLandingPageId] = useState<string | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchLandingPages = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .select('*')
        .eq('coach_id', coachId);

      if (error) {
        console.error("Error fetching landing pages:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch landing pages.",
        });
      } else {
        setLandingPages(data || []);
      }
    } finally {
      setIsLoading(false);
    }
  }, [coachId, toast]);

  useEffect(() => {
    fetchLandingPages();
  }, [fetchLandingPages]);

  const handleDuplicate = async (landingPage: LandingPage) => {
    try {
      const { data, error } = await supabase
        .from('landing_pages')
        .insert([{
          ...landingPage,
          id: undefined,
          title: `${landingPage.title} (עותק)`,
          is_published: false,
          created_at: undefined,
        }])
        .select()

      if (error) {
        console.error("Error duplicating landing page:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to duplicate landing page.",
        });
      } else if (data && data.length > 0) {
        toast({
          title: "Success",
          description: "Landing page duplicated successfully.",
        });
        fetchLandingPages();
      }
    } catch (error) {
      console.error("Unexpected error duplicating landing page:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while duplicating the landing page.",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedLandingPageId) return;

    try {
      const { error } = await supabase
        .from('landing_pages')
        .delete()
        .eq('id', selectedLandingPageId);

      if (error) {
        console.error("Error deleting landing page:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to delete landing page.",
        });
      } else {
        toast({
          title: "Success",
          description: "Landing page deleted successfully.",
        });
        fetchLandingPages();
      }
    } catch (error) {
      console.error("Unexpected error deleting landing page:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while deleting the landing page.",
      });
    } finally {
      setOpenDeleteDialog(false);
      setSelectedLandingPageId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold">דפי נחיתה</h2>
        <Button onClick={() => navigate('/landing-page/new')}>
          <PlusCircle className="mr-2 h-4 w-4" />
          צור דף נחיתה חדש
        </Button>
      </div>

      {isLoading ? (
        <p>Loading landing pages...</p>
      ) : (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
          {landingPages.length === 0 ? (
            <p className="p-4">No landing pages found.</p>
          ) : (
            <Table>
              <TableCaption>A list of your landing pages.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3">תמונה</TableHead>
                  <TableHead className="px-6 py-3">כותרת</TableHead>
                  <TableHead className="px-6 py-3">סטטוס</TableHead>
                  <TableHead className="px-6 py-3">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {landingPages.map((landingPage) => (
                  <TableRow key={landingPage.id}>
                    <TableCell className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      <img
                        src={getImageUrl(landingPage.profile_image_path)}
                        alt={landingPage.title}
                        className="w-20 h-12 object-cover rounded"
                      />
                    </TableCell>
                    <TableCell className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {landingPage.title}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {landingPage.is_published ? 'פורסם' : 'לא פורסם'}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (landingPage.id) {
                            window.open(`/landing/${landingPage.id}`, '_blank');
                          } else {
                            console.error("Landing page ID is undefined");
                            toast({
                              variant: "destructive",
                              title: "Error",
                              description: "Landing page ID is undefined.",
                            });
                          }
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(landingPage)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(landingPage)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedLandingPageId(landingPage.id);
                          setOpenDeleteDialog(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      <AlertDialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>האם אתה בטוח?</AlertDialogTitle>
            <AlertDialogDescription>
              פעולה זו בלתי הפיכה. דף הנחיתה יימחק לצמיתות.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ביטול</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>מחק</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default LandingPagesList;
