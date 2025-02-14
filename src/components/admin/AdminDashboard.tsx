
import React, { useState, useEffect } from 'react';
import { DataTable } from './DataTable';
import { columns } from './columns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FormData } from '@/types/mentalPrep';
import { supabase } from '@/integrations/supabase/client';
import * as XLSX from 'xlsx';

export const AdminDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [gameTypeFilter, setGameTypeFilter] = useState('all');
  const [data, setData] = useState<FormData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: forms, error } = await supabase
        .from('mental_prep_forms')
        .select('*');

      if (error) throw error;

      const formattedData: FormData[] = forms.map(form => {
        // המרת answers לאובייקט של מחרוזות
        const formattedAnswers: Record<string, string> = {};
        if (typeof form.answers === 'object' && form.answers !== null) {
          Object.entries(form.answers).forEach(([key, value]) => {
            formattedAnswers[key] = String(value);
          });
        }

        return {
          fullName: form.full_name,
          email: form.email,
          phone: form.phone,
          matchDate: form.match_date,
          opposingTeam: form.opposing_team,
          gameType: form.game_type,
          selectedStates: Array.isArray(form.selected_states) 
            ? form.selected_states.map(state => String(state))
            : [],
          selectedGoals: Array.isArray(form.selected_goals) 
            ? form.selected_goals.map((goal: any) => ({
                goal: String(goal.goal || ''),
                metric: String(goal.metric || '')
              }))
            : [],
          answers: formattedAnswers,
          currentPressure: form.current_pressure || undefined,
          optimalPressure: form.optimal_pressure || undefined,
        };
      });

      setData(formattedData);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת הנתונים",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mental Prep Forms");
    XLSX.writeFile(wb, "mental_prep_forms.xlsx");
    
    toast({
      title: "יצוא נתונים",
      description: "הנתונים יורדים כקובץ Excel",
    });
  };

  const filteredData = data.filter(item => {
    const matchesSearch = 
      item.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.opposingTeam.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGameType = gameTypeFilter === 'all' || item.gameType === gameTypeFilter;
    
    return matchesSearch && matchesGameType;
  });

  if (isLoading) {
    return <div className="p-8 text-center">טוען נתונים...</div>;
  }

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
