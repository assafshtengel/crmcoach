import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { LandingPage, supabase } from '@/lib/supabase';
import { getImageUrl } from '@/lib/getImageUrl';

interface LandingPagePreviewProps {
  landingPage: LandingPage | null;
  onEdit: () => void;
}

export const LandingPagePreview: React.FC<LandingPagePreviewProps> = ({ landingPage, onEdit }) => {
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    if (landingPage) {
      setIsLoading(false);
    }
  }, [landingPage]);

  if (!landingPage) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        <p className="mt-2 text-sm text-gray-500">Loading preview...</p>
      </div>
    );
  }

  const containerStyle = {
    backgroundColor: landingPage.bg_color || '#f0f0f0',
    color: landingPage.is_dark_text ? '#000' : '#fff',
  };

  const buttonStyle = {
    backgroundColor: landingPage.button_color || '#3498db',
    color: landingPage.is_dark_text ? '#000' : '#fff',
  };

  const getProfileImage = async (landingPage: LandingPage) => {
  if (!landingPage.profile_image_path) return '';
  return await getImageUrl('landing-pages', landingPage.profile_image_path);
};

  useEffect(() => {
  const loadProfileImage = async () => {
    if (landingPage && landingPage.profile_image_path) {
      const imageUrl = await getProfileImage(landingPage);
      setProfileImageUrl(imageUrl);
    }
  };
  
  loadProfileImage();
}, [landingPage]);

  return (
    <div style={containerStyle} className="p-8 rounded-lg shadow-md">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={onEdit}>
          Edit
        </Button>
      </div>
      <div className="text-center">
        {profileImageUrl && (
          <img
            src={profileImageUrl}
            alt="Profile"
            className="rounded-full mx-auto mb-4 w-32 h-32 object-cover"
          />
        )}
        <h1 className="text-3xl font-bold">{landingPage.title}</h1>
        <h2 className="text-xl mb-4">{landingPage.subtitle}</h2>
        <p className="mb-6">{landingPage.description}</p>
        <Button style={buttonStyle}>{landingPage.cta_text}</Button>
      </div>
    </div>
  );
};
