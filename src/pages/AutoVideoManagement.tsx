import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Pencil, Trash2, Save, PlayIcon, ExternalLink, RefreshCcw, Link } from "lucide-react";

interface Video {
  id: string;
  title: string;
  url: string;
  description: string;
  category?: string;
  created_at: string;
  is_admin_video?: boolean;
}

export default function AutoVideoManagement() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [newVideo, setNewVideo] = useState({
    title: '',
    url: '',
    description: '',
    category: '',
  });
  const [editMode, setEditMode] = useState<string | null>(null);
  const [editVideo, setEditVideo] = useState<Video | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchVideos();
  }, []);

  async function fetchVideos() {
    try {
      setLoading(true);
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) return;

      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('coach_id', session.session.user.id)
        .order('created_at', { ascending: false }) as { data: Video[] | null; error: any };

      if (error) {
        throw error;
      }

      if (data) {
        setVideos(data);
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "שגיאה בטעינת הסרטונים",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function addVideo() {
    if (!newVideo.title.trim() || !newVideo.url.trim() || !newVideo.description.trim()) {
      toast({
        title: "שדות חובה",
        description: "יש למלא שם, קישור ותיאור לסרטון",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast({
          title: "שגיאה בהוספת הסרטון",
          description: "יש להתחבר למערכת",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from('videos')
        .insert([
          {
            title: newVideo.title,
            url: newVideo.url,
            description: newVideo.description,
            category: newVideo.category,
            coach_id: session.session.user.id,
            is_admin_video: false
          },
        ])
        .select() as { data: Video[] | null; error: any };

      if (error) {
        throw error;
      }

      if (data) {
        setVideos([...data, ...videos]);
        setNewVideo({ title: '', url: '', description: '', category: '' });
        toast({
          title: "הסרטון נוסף בהצלחה",
        });
      }
    } catch (error) {
      console.error('Error adding video:', error);
      toast({
        title: "שגיאה בהוספת הסרטון",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  }

  async function updateVideo(id: string) {
    if (!editVideo?.title.trim() || !editVideo?.url.trim() || !editVideo?.description.trim()) {
      toast({
        title: "שדות חובה",
        description: "יש למלא שם, קישור ותיאור לסרטון",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('videos')
        .update({
          title: editVideo.title,
          url: editVideo.url,
          description: editVideo.description,
          category: editVideo.category,
        })
        .eq('id', id)
        .select() as { data: Video[] | null; error: any };

      if (error) {
        throw error;
      }

      if (data) {
        setVideos(videos.map(video => video.id === id ? data[0] : video));
        setEditMode(null);
        toast({
          title: "הסרטון עודכן בהצלחה",
        });
      }
    } catch (error) {
      console.error('Error updating video:', error);
      toast({
        title: "שגיאה בעדכון הסרטון",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  }

  async function deleteVideo(id: string) {
    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id) as { error: any };

      if (error) {
        throw error;
      }

      setVideos(videos.filter(video => video.id !== id));
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
      toast({
        title: "הסרטון נמחק בהצלחה",
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast({
        title: "שגיאה במחיקת הסרטון",
        description: "נסה שוב מאוחר יותר",
        variant: "destructive",
      });
    }
  }

  function startEdit(video: Video) {
    setEditMode(video.id);
    setEditVideo(video);
  }

  function cancelEdit() {
    setEditMode(null);
    setEditVideo(null);
  }

  function openDeleteDialog(video: Video) {
    setVideoToDelete(video);
    setDeleteDialogOpen(true);
  }

  const columns: ColumnDef<Video>[] = [
    {
      accessorKey: 'title',
      header: 'כותרת',
    },
    {
      accessorKey: 'category',
      header: 'קטגוריה',
    },
    {
      accessorKey: 'created_at',
      header: 'תאריך הוספה',
      cell: ({ row }) => format(new Date(row.getValue("created_at")), "dd/MM/yyyy"),
    },
    {
      id: 'actions',
      header: 'פעולות',
      cell: ({ row }) => {
        const video = row.original;
        return (
          <div className="flex space-x-2 rtl:space-x-reverse">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => startEdit(video)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openDeleteDialog(video)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="videos" dir="rtl">
        <TabsList className="mb-4">
          <TabsTrigger value="videos">רשימת הסרטונים</TabsTrigger>
          <TabsTrigger value="add">הוספת סרטון חדש</TabsTrigger>
        </TabsList>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="text-center py-10">טוען...</div>
              ) : videos.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <p>טרם נוספו סרטונים למערכת</p>
                  <Button
                    variant="link"
                    onClick={() => {
                      const tabTrigger = document.querySelector('[data-value="add"]');
                      if (tabTrigger) {
                        (tabTrigger as HTMLElement).click();
                      }
                    }}
                  >
                    הוסף סרטון ראשון
                  </Button>
                </div>
              ) : (
                <DataTable columns={columns} data={videos} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label htmlFor="newVideoTitle" className="block text-sm font-medium mb-1">
                  שם הסרטון
                </label>
                <Input
                  id="newVideoTitle"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  placeholder="הזן שם לסרטון"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="newVideoUrl" className="block text-sm font-medium mb-1">
                  קישור לסרטון
                </label>
                <Input
                  id="newVideoUrl"
                  value={newVideo.url}
                  onChange={(e) => setNewVideo({ ...newVideo, url: e.target.value })}
                  placeholder="הזן קישור לסרטון"
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="newVideoDescription" className="block text-sm font-medium mb-1">
                  תיאור הסרטון
                </label>
                <Textarea
                  id="newVideoDescription"
                  value={newVideo.description}
                  onChange={(e) => setNewVideo({ ...newVideo, description: e.target.value })}
                  placeholder="תאר את הסרטון"
                  rows={6}
                  className="w-full"
                />
              </div>
              <div>
                <label htmlFor="newVideoCategory" className="block text-sm font-medium mb-1">
                  קטגוריה
                </label>
                <Input
                  id="newVideoCategory"
                  value={newVideo.category}
                  onChange={(e) => setNewVideo({ ...newVideo, category: e.target.value })}
                  placeholder="הזן קטגוריה לסרטון"
                  className="w-full"
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={addVideo}>
                  <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                  הוסף סרטון
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={editMode !== null} onOpenChange={(open) => {
        if (!open) {
          cancelEdit();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>עריכת סרטון</DialogTitle>
            <DialogDescription>
              ערוך את פרטי הסרטון
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label htmlFor="editVideoTitle" className="block text-sm font-medium mb-1">
                שם הסרטון
              </label>
              <Input
                id="editVideoTitle"
                value={editVideo?.title || ''}
                onChange={(e) => setEditVideo({ ...editVideo, title: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="editVideoUrl" className="block text-sm font-medium mb-1">
                קישור לסרטון
              </label>
              <Input
                id="editVideoUrl"
                value={editVideo?.url || ''}
                onChange={(e) => setEditVideo({ ...editVideo, url: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="editVideoDescription" className="block text-sm font-medium mb-1">
                תיאור הסרטון
              </label>
              <Textarea
                id="editVideoDescription"
                value={editVideo?.description || ''}
                onChange={(e) => setEditVideo({ ...editVideo, description: e.target.value })}
                rows={4}
                className="w-full"
              />
            </div>
            <div>
              <label htmlFor="editVideoCategory" className="block text-sm font-medium mb-1">
                קטגוריה
              </label>
              <Input
                id="editVideoCategory"
                value={editVideo?.category || ''}
                onChange={(e) => setEditVideo({ ...editVideo, category: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={cancelEdit}>
              ביטול
            </Button>
            <Button onClick={() => editVideo && updateVideo(editVideo.id)}>
              <Save className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              שמירה
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>האם למחוק את הסרטון?</DialogTitle>
            <DialogDescription>
              פעולה זו תמחק את הסרטון &quot;{videoToDelete?.title}&quot; לצמיתות.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={() => videoToDelete && deleteVideo(videoToDelete.id)}
            >
              מחק
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
