
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Copy, Calendar, Share, Trash, ArrowLeft, Link as LinkIcon, Users, Bell, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { format, isAfter } from 'date-fns';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RegistrationLink {
  id: string;
  created_at: string;
  is_active: boolean;
  custom_message: string | null;
  registered_count?: number;
}

const RegistrationLinks = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [links, setLinks] = useState<RegistrationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [newLinkMessage, setNewLinkMessage] = useState('');
  const [shareUrl, setShareUrl] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        navigate('/auth');
        return;
      }
      fetchLinks();
    };
    
    checkUser();
  }, [navigate]);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      // Fetch registration links
      const { data: linksData, error: linksError } = await supabase
        .from('registration_links')
        .select('*')
        .eq('coach_id', user.id)
        .order('created_at', { ascending: false });

      if (linksError) throw linksError;
      
      // If we have links, fetch the registration count for each link
      if (linksData && linksData.length > 0) {
        const linksWithCounts = await Promise.all(
          linksData.map(async (link) => {
            // Count how many players registered using this link
            const { count, error: countError } = await supabase
              .from('players')
              .select('*', { count: 'exact', head: true })
              .eq('registration_link_id', link.id);
              
            if (countError) {
              console.error('Error fetching registration count:', countError);
              return { ...link, registered_count: 0 };
            }
            
            return { ...link, registered_count: count || 0 };
          })
        );
        
        setLinks(linksWithCounts);
      } else {
        setLinks([]);
      }
    } catch (error) {
      console.error('Error fetching registration links:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בטעינת הלינקים",
        description: "אנא נסה שוב מאוחר יותר"
      });
    } finally {
      setLoading(false);
    }
  };

  const createNewLink = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('משתמש לא מחובר');

      const newLinkData = {
        coach_id: user.id,
        custom_message: newLinkMessage || null,
        is_active: true
      };

      const { data, error } = await supabase
        .from('registration_links')
        .insert([newLinkData])
        .select()
        .single();

      if (error) throw error;

      setLinks([{ ...data, registered_count: 0 }, ...links]);
      setNewLinkMessage('');
      setIsCreatingLink(false);
      
      toast({
        title: "הלינק נוצר בהצלחה",
        description: "עכשיו תוכל לשתף אותו עם השחקנים"
      });
    } catch (error: any) {
      console.error('Error creating registration link:', error);
      toast({
        variant: "destructive",
        title: "שגיאה ביצירת הלינק",
        description: error.message || "אנא נסה שוב מאוחר יותר"
      });
    }
  };

  const copyLink = (linkId: string) => {
    const linkUrl = `${window.location.origin}/register/${linkId}`;
    navigator.clipboard.writeText(linkUrl);
    toast({
      title: "הלינק הועתק",
      description: "הלינק הועתק ללוח"
    });
  };

  const toggleLinkStatus = async (linkId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('registration_links')
        .update({ is_active: !currentStatus })
        .eq('id', linkId);

      if (error) throw error;

      setLinks(links.map(link => 
        link.id === linkId ? { ...link, is_active: !currentStatus } : link
      ));
      
      toast({
        title: `הלינק ${currentStatus ? 'בוטל' : 'הופעל'} בהצלחה`,
      });
    } catch (error) {
      console.error('Error updating link status:', error);
      toast({
        variant: "destructive",
        title: "שגיאה בעדכון סטטוס הלינק",
        description: "אנא נסה שוב מאוחר יותר"
      });
    }
  };

  const deleteLink = async (linkId: string) => {
    try {
      const { error } = await supabase
        .from('registration_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      setLinks(links.filter(link => link.id !== linkId));
      toast({
        title: "הלינק נמחק בהצלחה",
      });
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        variant: "destructive",
        title: "שגיאה במחיקת הלינק",
        description: "אנא נסה שוב מאוחר יותר"
      });
    }
  };

  const shareViaWhatsApp = (linkId: string) => {
    const linkUrl = `${window.location.origin}/register/${linkId}`;
    const message = encodeURIComponent(`הצטרף לרישום באמצעות הלינק הבא: ${linkUrl}`);
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  const shareViaEmail = (linkId: string) => {
    const linkUrl = `${window.location.origin}/register/${linkId}`;
    const subject = encodeURIComponent('הזמנה להירשם כשחקן חדש');
    const body = encodeURIComponent(`שלום,\n\nמזמין אותך להירשם דרך הלינק הבא:\n${linkUrl}\n\nבברכה,`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              חזרה לדף הבית
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ניהול לינקי הרשמה</h1>
          <p className="text-gray-600">יצירה וניהול לינקים להרשמת שחקנים חדשים</p>
        </header>

        <div className="grid grid-cols-1 gap-6 mb-10">
          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>יצירת לינק הרשמה חדש</span>
                <Dialog open={isCreatingLink} onOpenChange={setIsCreatingLink}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <PlusCircle className="h-5 w-5" />
                      צור לינק חדש
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>יצירת לינק הרשמה חדש</DialogTitle>
                      <DialogDescription>
                        צור לינק ייחודי שדרכו שחקנים יוכלו להירשם
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="message">הודעה מותאמת אישית (אופציונלי)</Label>
                        <Textarea
                          id="message"
                          placeholder="הוסף הודעה שתוצג בטופס ההרשמה"
                          value={newLinkMessage}
                          onChange={(e) => setNewLinkMessage(e.target.value)}
                          className="min-h-[100px]"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={createNewLink} className="w-full">
                        צור לינק
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>
                צור לינק ייחודי שדרכו שחקנים יוכלו להירשם כשחקנים חדשים תחת החשבון שלך
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white shadow-md">
            <CardHeader>
              <CardTitle>לינקים קיימים</CardTitle>
              <CardDescription>
                כל הלינקים שיצרת לצורך הרשמת שחקנים חדשים
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-10 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-gray-600">טוען לינקים...</p>
                </div>
              ) : links.length > 0 ? (
                <Table>
                  <TableCaption>רשימת לינקי ההרשמה שלך</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>תאריך יצירה</TableHead>
                      <TableHead>סטטוס</TableHead>
                      <TableHead>נרשמים</TableHead>
                      <TableHead className="text-left">פעולות</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="font-medium">
                          {format(new Date(link.created_at), 'dd/MM/yyyy')}
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            link.is_active 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {link.is_active ? (
                              <>
                                <Check className="h-3 w-3 mr-1" />
                                פעיל
                              </>
                            ) : (
                              <>
                                <span className="h-3 w-3 mr-1">✕</span>
                                לא פעיל
                              </>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Users className="h-4 w-4 ml-1 text-gray-500" />
                            <span>{link.registered_count || 0}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 space-x-reverse">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyLink(link.id)}
                              title="העתק לינק"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => shareViaWhatsApp(link.id)}
                              title="שתף בוואטסאפ"
                              className="text-green-600"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                              </svg>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => shareViaEmail(link.id)}
                              title="שתף באימייל"
                              className="text-blue-600"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                              </svg>
                            </Button>
                            <Button
                              variant={link.is_active ? "destructive" : "outline"}
                              size="sm"
                              onClick={() => toggleLinkStatus(link.id, link.is_active)}
                              title={link.is_active ? "בטל לינק" : "הפעל לינק"}
                            >
                              {link.is_active ? "בטל" : "הפעל"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteLink(link.id)}
                              title="מחק לינק"
                              className="text-red-600"
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-10 text-center bg-gray-50 rounded-lg">
                  <LinkIcon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">אין לינקים</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-4">
                    לא יצרת עדיין לינקים להרשמה. צור לינק חדש כדי לאפשר לשחקנים להירשם.
                  </p>
                  <Button onClick={() => setIsCreatingLink(true)}>
                    <PlusCircle className="h-5 w-5 mr-2" />
                    צור לינק חדש
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={!!shareUrl} onOpenChange={(open) => !open && setShareUrl(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>שיתוף לינק</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>לינק להרשמה</Label>
              <div className="flex">
                <Input readOnly value={shareUrl || ''} />
                <Button 
                  variant="outline" 
                  className="ml-2"
                  onClick={() => {
                    if (shareUrl) {
                      navigator.clipboard.writeText(shareUrl);
                      toast({
                        title: "הלינק הועתק",
                        description: "הלינק הועתק ללוח"
                      });
                    }
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  if (shareUrl) {
                    const message = encodeURIComponent(`הצטרף לרישום באמצעות הלינק הבא: ${shareUrl}`);
                    window.open(`https://wa.me/?text=${message}`, '_blank');
                  }
                }}
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                </svg>
                שתף בוואטסאפ
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (shareUrl) {
                    const subject = encodeURIComponent('הזמנה להירשם כשחקן חדש');
                    const body = encodeURIComponent(`שלום,\n\nמזמין אותך להירשם דרך הלינק הבא:\n${shareUrl}\n\nבברכה,`);
                    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
                  }
                }}
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
                </svg>
                שתף באימייל
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistrationLinks;
