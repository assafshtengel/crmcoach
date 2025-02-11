
import React, { useState } from 'react';
import { DataTable } from './DataTable';
import { columns } from './columns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FormData } from '@/types/mentalPrep';

// Mock data for now - will be replaced with Supabase data
const mockData: FormData[] = [];

export const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gameTypeFilter, setGameTypeFilter] = useState('all');
  const { toast } = useToast();

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "יצוא נתונים",
      description: "הנתונים יורדים כקובץ Excel",
    });
  };

  const filteredData = mockData.filter(item => {
    const matchesSearch = 
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.opposingTeam.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGameType = gameTypeFilter === 'all' || item.gameType === gameTypeFilter;
    
    return matchesSearch && matchesGameType;
  });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">ניהול דוחות הכנה מנטלית</h1>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" />
          ייצוא לאקסל
        </Button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="חיפוש לפי שם שחקן או קבוצה"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-right"
            />
          </div>
        </div>
        <Select value={gameTypeFilter} onValueChange={setGameTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="סנן לפי סוג משחק" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">הכל</SelectItem>
            <SelectItem value="league">ליגה</SelectItem>
            <SelectItem value="cup">גביע</SelectItem>
            <SelectItem value="friendly">ידידות</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable columns={columns} data={filteredData} />
    </div>
  );
};

