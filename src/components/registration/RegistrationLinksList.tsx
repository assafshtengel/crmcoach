
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Plus, Copy, Calendar } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface RegistrationLink {
  id: string;
  created_at: string;
  expires_at: string | null;
  is_active: boolean;
  custom_message: string | null;
}

const RegistrationLinksList = () => {
  const [links, setLinks] = useState<RegistrationLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLinkMessage, setNewLinkMessage] = useState('');
  const [newLinkExpiry, setNewLinkExpiry] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('registration_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLinks(data || []);
    } catch (error) {
      toast.error('שגיאה בטעינת הלינקים');
    } finally {
      setLoading(false);
    }
  };

  const createNewLink = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('לא מחובר');

      const { data, error } = await supabase
        .from('registration_links')
        .insert([{
          coach_id: userData.user.id,
          custom_message: newLinkMessage || null,
          expires_at: newLinkExpiry || null
        }])
        .select()
        .single();

      if (error) throw error;

      setLinks([data, ...links]);
      setNewLinkMessage('');
      setNewLinkExpiry('');
      setIsDialogOpen(false);
      toast.success('הלינק נוצר בהצלחה');
    } catch (error: any) {
      toast.error('שגיאה ביצירת הלינק: ' + error.message);
    }
  };

  const copyLink = (linkId: string) => {
    const linkUrl = `${window.location.origin}/register/${linkId}`;
    navigator.clipboard.writeText(linkUrl);
    toast.success('הלינק הועתק ללוח');
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
      
      toast.success(`הלינק ${currentStatus ? 'בוטל' : 'הופעל'} בהצלחה`);
    } catch (error) {
      toast.error('שגיאה בעדכון סטטוס הלינק');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">לינקים להרשמה</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="ml-2 h-4 w-4" />
              צור לינק חדש
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>יצירת לינק חדש להרשמה</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="message">הודעה מותאמת אישית (אופציונלי)</Label>
                <Textarea
                  id="message"
                  value={newLinkMessage}
                  onChange={(e) => setNewLinkMessage(e.target.value)}
                  placeholder="הוסף הודעה שתוצג בראש טופס ההרשמה"
                />
              </div>
              <div>
                <Label htmlFor="expiry">תאריך תפוגה (אופציונלי)</Label>
                <Input
                  id="expiry"
                  type="datetime-local"
                  value={newLinkExpiry}
                  onChange={(e) => setNewLinkExpiry(e.target.value)}
                />
              </div>
              <Button onClick={createNewLink} className="w-full">צור לינק</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div>טוען...</div>
      ) : (
        <div className="grid gap-4">
          {links.map((link) => (
            <Card key={link.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm ${link.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {link.is_active ? 'פעיל' : 'לא פעיל'}
                    </span>
                  </div>
                  {link.custom_message && (
                    <p className="text-sm text-gray-600">{link.custom_message}</p>
                  )}
                  {link.expires_at && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-4 w-4 ml-1" />
                      {new Date(link.expires_at).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(link.id)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={link.is_active ? "destructive" : "default"}
                    size="sm"
                    onClick={() => toggleLinkStatus(link.id, link.is_active)}
                  >
                    {link.is_active ? 'בטל' : 'הפעל'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegistrationLinksList;
