
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

const AddPlayerForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState({
    full_name: '',
    email: '',
    phone: '',
    birthdate: '',
    club: '',
    city: '',
    sport_field: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPlayer(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('players')
        .insert([
          {
            full_name: player.full_name,
            email: player.email,
            phone: player.phone || null,
            birthdate: player.birthdate || null,
            club: player.club || null,
            city: player.city || null,
            sport_field: player.sport_field || null
          }
        ])
        .select();

      if (error) {
        throw error;
      }

      toast.success('Player added successfully');
      navigate('/players-list');
    } catch (error) {
      console.error('Error adding player:', error);
      toast.error('Failed to add player');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>הוספת שחקן חדש</CardTitle>
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
                  value={player.phone}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="birthdate">תאריך לידה</Label>
                <Input
                  id="birthdate"
                  name="birthdate"
                  type="date"
                  value={player.birthdate}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="club">מועדון</Label>
                <Input
                  id="club"
                  name="club"
                  value={player.club}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="city">עיר</Label>
                <Input
                  id="city"
                  name="city"
                  value={player.city}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="sport_field">תחום ספורט</Label>
                <Input
                  id="sport_field"
                  name="sport_field"
                  value={player.sport_field}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" onClick={() => navigate('/players-list')}>
                ביטול
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'מוסיף שחקן...' : 'הוסף שחקן'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default AddPlayerForm;
