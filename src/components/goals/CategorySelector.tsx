
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Brain, BookOpen } from 'lucide-react';

interface CategorySelectorProps {
  activeCategory: string;
  onCategoryChange: (category: 'physical' | 'mental' | 'academic') => void;
}

export const CategorySelector: React.FC<CategorySelectorProps> = ({ 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <Tabs 
      value={activeCategory} 
      onValueChange={(value) => onCategoryChange(value as 'physical' | 'mental' | 'academic')}
      className="w-full mb-6"
    >
      <TabsList className="grid grid-cols-3 w-full">
        <TabsTrigger value="physical" className="flex items-center gap-2">
          <Dumbbell className="h-4 w-4" />
          <span>מטרות פיזיות</span>
        </TabsTrigger>
        <TabsTrigger value="mental" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span>מטרות מנטליות</span>
        </TabsTrigger>
        <TabsTrigger value="academic" className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span>מטרות לימודיות</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};
