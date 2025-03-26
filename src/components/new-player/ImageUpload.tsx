
import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const DEFAULT_PROFILE_IMAGE = '/lovable-uploads/e1817c5d-6a43-4bc9-b689-cb52738451cc.png';

interface ImageUploadProps {
  onImageUpload: (file: File) => void;
  onImageRemove: () => void;
  previewUrl?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onImageRemove,
  previewUrl
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxSize: 5242880, // 5MB
    onDrop: (acceptedFiles) => {
      if (acceptedFiles?.length > 0) {
        onImageUpload(acceptedFiles[0]);
      }
    }
  });

  return (
    <div className="w-full space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 transition-all cursor-pointer",
          "hover:border-primary/50 hover:bg-muted/50",
          isDragActive && "border-primary/50 bg-muted/50",
          "animate-in fade-in-50 duration-200"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Image className="h-8 w-8" />
          <p className="text-sm text-center">
            {isDragActive ? (
              "שחרר את התמונה כאן"
            ) : (
              "גרור תמונה לכאן או לחץ לבחירה"
            )}
          </p>
        </div>
      </div>

      {previewUrl && (
        <div className="relative w-32 h-32 mx-auto animate-in zoom-in-50 duration-200">
          <img
            src={previewUrl}
            alt="תמונת פרופיל"
            className="w-full h-full object-cover rounded-full"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2"
            onClick={(e) => {
              e.stopPropagation();
              onImageRemove();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export { DEFAULT_PROFILE_IMAGE };
