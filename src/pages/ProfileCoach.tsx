import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';
import { Home, Pencil, User } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';

interface Coach {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_picture?: string;
  description?: string;
  created_at: string;
}

const ProfileCoach = () => {
  const [coach, setCoach] = useState<Coach | null>(null);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [profilePictureURL, setProfilePictureURL] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCoachData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data: coachData, error } = await supabase
          .from('coaches')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching coach data:', error);
          toast.error('Failed to fetch profile data.');
          return;
        }

        if (coachData) {
          setCoach(coachData as Coach);
          setFullName(coachData.full_name);
          setPhone(coachData.phone || '');
          setDescription(coachData.description || '');
          setProfilePictureURL(coachData.profile_picture || null);
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchCoachData();
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePicture(file);
      const url = URL.createObjectURL(file);
      setProfilePictureURL(url);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      let profilePicturePath = coach?.profile_picture;

      if (profilePicture) {
        const fileExt = profilePicture.name.split('.').pop();
        const filePath = `coaches/${user.id}/profile.${fileExt}`;

        const { data, error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, profilePicture, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Error uploading image:', uploadError);
          toast.error('Failed to upload image.');
          return;
        }

        profilePicturePath = `https://hntgzgrlyfhojcaofbjv.supabase.co/storage/v1/object/public/images/${filePath}`;
      }

      const { error: updateError } = await supabase
        .from('coaches')
        .upsert({
          id: user.id,
          full_name: fullName,
          phone: phone,
          description: description,
          profile_picture: profilePicturePath,
        }, { onConflict: 'id' });

      if (updateError) {
        console.error('Error updating coach data:', updateError);
        toast.error('Failed to update profile.');
        return;
      }

      setCoach({
        ...coach!,
        full_name: fullName,
        phone: phone,
        description: description,
        profile_picture: profilePicturePath,
      });

      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Unexpected error:', error);
      toast.error('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto mt-8">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <Button variant="outline" onClick={() => navigate('/dashboard-coach')}>
          <Home className="w-4 h-4 mr-2" />
          Dashboard
        </Button>
      </div>
      <form onSubmit={handleSubmit} className="max-w-lg">
        <div className="space-y-4">
          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={coach?.email || ''}
              readOnly
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              type="tel"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="profilePicture">Profile Picture</Label>
            <Input
              type="file"
              id="profilePicture"
              accept="image/*"
              onChange={handleImageChange}
            />
            {profilePictureURL && (
              <img
                src={profilePictureURL}
                alt="Profile Preview"
                className="mt-2 h-20 w-20 rounded-full object-cover"
              />
            )}
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                Updating...
              </>
            ) : (
              <>
                <Pencil className="w-4 h-4 mr-2" />
                Update Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfileCoach;
