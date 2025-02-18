
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/use-toast';
import { PlayerFormData } from '@/types/player';

const NewPlayerForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PlayerFormData>({
    full_name: '',
    email: '',
    phone: '',
    position: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.full_name || !formData.email || !formData.phone) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: 'נא למלא את כל שדות החובה'
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "שגיאה",
          description: 'לא נמצא משתמש מחובר'
        });
        navigate('/auth');
        return;
      }

      // Insert the player
      const { error: playerError } = await supabase.from('players').insert({
        coach_id: user.id,
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        position: formData.position,
        notes: formData.notes
      });

      if (playerError) throw playerError;

      // Create notification for new player
      const { error: notificationError } = await supabase.from('notifications').insert({
        coach_id: user.id,
        type: 'new_player',
        message: `שחקן ${formData.full_name} נרשם למערכת`
      });

      if (notificationError) throw notificationError;

      toast({
        title: "הצלחה",
        description: `השחקן ${formData.full_name} נוסף בהצלחה!`
      });
      navigate('/players-list');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "שגיאה",
        description: error.message || 'אירעה שגיאה בהוספת השחקן'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">הוספת שחקן חדש</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">שם מלא</label>
          <input
            type="text"
            value={formData.full_name}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">אימייל</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">טלפון</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">תפקיד</label>
          <input
            type="text"
            value={formData.position}
            onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">הערות</label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full p-2 border rounded"
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary/90 disabled:opacity-50"
        >
          {loading ? 'מוסיף...' : 'הוסף שחקן'}
        </button>
      </form>
    </div>
  );
};

export default NewPlayerForm;
