import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { getImageUrl } from '@/lib/getImageUrl';
import { Button } from '@/components/ui/button';
import { Edit, Eye, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LandingPagePreviewProps {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  profile_image_path?: string | null;
  bg_color?: string;
  accent_color?: string;
  button_color?: string;
  is_dark_text?: boolean;
}

const getLandingPageImageUrl = async (imagePath: string | null) => {
  if (!imagePath) return '';
  return getImageUrl(imagePath, 'landing-pages');
};

export const LandingPagePreview = ({
  id,
  title,
  subtitle,
  description,
  profile_image_path,
  bg_color = '#f8fafc',
  accent_color = '#6366f1',
  button_color = '#4f46e5',
  is_dark_text = false,
}: LandingPagePreviewProps) => {
  const navigate = useNavigate();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadImage = async () => {
      const url = await getLandingPageImageUrl(profile_image_path);
      setImageUrl(url);
    };

    loadImage();
  }, [profile_image_path]);

  const handleCopyToClipboard = () => {
    const landingPageUrl = `${window.location.origin}/landing/${id}`;
    navigator.clipboard.writeText(landingPageUrl);
    toast({
      title: 'כתובת האתר הועתקה',
      description: 'כתובת האתר של דף הנחיתה הועתקה ללוח.',
    });
  };

  return (
    <div
      className="rounded-lg shadow-md overflow-hidden"
      style={{ backgroundColor: bg_color }}
    >
      <div className="relative">
        {imageUrl && (
          <img
            src={imageUrl}
            alt="Landing Page Preview"
            className="w-full h-48 object-cover"
          />
        )}
        <div className="absolute top-2 right-2 flex space-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/landing-page-edit/${id}`)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(`/landing/${id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleCopyToClipboard}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4">
        <h3
          className="text-xl font-semibold"
          style={{ color: is_dark_text ? '#000' : '#fff' }}
        >
          {title}
        </h3>
        {subtitle && (
          <p
            className="text-gray-600"
            style={{ color: is_dark_text ? '#333' : '#ddd' }}
          >
            {subtitle}
          </p>
        )}
        {description && (
          <p
            className="text-gray-700"
            style={{ color: is_dark_text ? '#444' : '#ccc' }}
          >
            {description}
          </p>
        )}
        <Button
          className="mt-4 w-full"
          style={{ backgroundColor: button_color, color: is_dark_text ? '#000' : '#fff' }}
          onClick={() => navigate(`/landing/${id}`)}
        >
          View Landing Page
        </Button>
      </div>
    </div>
  );
};
