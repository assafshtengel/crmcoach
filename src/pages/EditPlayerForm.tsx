
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface PlayerData {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  birthdate: string | null;
  club: string | null;
  city: string | null;
  sport_field: string | null;
}

const EditPlayerForm = () => {
  const { playerId } = useParams<{ playerId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [player, setPlayer] = useState<PlayerData>({
    id: '',
    full_name: '',
    email: '',
    phone: '',
    birthdate: '',
    club: '',
    city: '',
    sport_field: ''
  });

  useEffect(() => {
    if (playerId) {
      fetchPlayerData(playerId);
    }
  }, [playerId]);

  const fetchPlayerData = async (id: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        setPlayer(data as PlayerData);
      }
    } catch (error) {
      console.error('Error fetching player data:', error);
      toast.error('Failed to load player data.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('players')
        .update({
          full_name: player.full_name,
          email: player.email,
          phone: player.phone,
          birthdate: player.birthdate,
          club: player.club,
          city: player.city,
          sport_field: player.sport_field
        })
        .eq('id', player.id);

      if (error) {
        throw error;
      }

      toast.success('Player updated successfully');
      navigate('/players-list');
    } catch (error) {
      console.error('Error updating player:', error);
      toast.error('Failed to update player');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !player.id) {
    return (
      <Layout>
        <div className="container mx-auto py-6">
          <p className="text-center">Loading player data...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>עריכת פרטי שחקן</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">שם מלא</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={player.full_name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">דוא"ל</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={player.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">טלפון</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={player.phone || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthdate">תאריך לידה</Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  value={player.birthdate || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="club">מועדון</Label>
                <Input
                  id="club"
                  name="club"
                  value={player.club || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">עיר</Label>
                <Input
                  id="city"
                  name="city"
                  value={player.city || ''}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sport_field">תחום ספורט</Label>
                <Input
                  id="sport_field"
                  name="sport_field"
                  value={player.sport_field || ''}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate('/players-list')}>
                ביטול
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'שומר שינויים...' : 'שמור שינויים'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default EditPlayerForm;
