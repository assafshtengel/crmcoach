
import React, { useState, useEffect } from 'react';
import { MentalPrepForm } from '@/components/MentalPrepForm';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { supabase } from '@/lib/supabase';
import { FormData } from '@/types/mentalPrep';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Define the column type for the completed forms table
type CompletedForm = {
  id: string;
  full_name: string;
  email: string;
  match_date: string;
  opposing_team: string;
  created_at: string;
};

const GamePreparation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [completedForms, setCompletedForms] = useState<CompletedForm[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedForms();
  }, []);

  const fetchCompletedForms = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('mental_prep_forms')
        .select('id, full_name, email, match_date, opposing_team, created_at')
        .eq('coach_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setCompletedForms(data || []);
    } catch (error) {
      console.error('Error fetching completed forms:', error);
      toast({
        title: 'שגיאה בטעינת הטפסים',
        description: 'אירעה שגיאה בטעינת טפסי ההכנה למשחק',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Define the columns for the DataTable component
  const columns: ColumnDef<CompletedForm>[] = [
    {
      accessorKey: 'full_name',
      header: 'שם מלא',
    },
    {
      accessorKey: 'match_date',
      header: 'תאריך משחק',
    },
    {
      accessorKey: 'opposing_team',
      header: 'קבוצה יריבה',
    },
    {
      accessorKey: 'created_at',
      header: 'תאריך מילוי',
      cell: ({ row }) => {
        const date = row.original.created_at;
        if (!date) return null;
        
        try {
          return format(new Date(date), 'dd/MM/yyyy HH:mm');
        } catch (e) {
          return date;
        }
      },
    },
    {
      id: 'actions',
      header: 'פעולות',
      cell: ({ row }) => {
        return (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleViewDetails(row.original.id)}
          >
            צפה בפרטים
          </Button>
        );
      },
    },
  ];

  const handleViewDetails = (formId: string) => {
    // In the future, this could navigate to a detailed view of the form
    console.log('View details for form:', formId);
    toast({
      title: 'תצוגה מפורטת',
      description: 'תכונה זו תהיה זמינה בקרוב',
    });
  };

  const handleRefresh = () => {
    fetchCompletedForms();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            title="חזור לדף הקודם"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/')}
            title="חזור לדשבורד"
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">הכנה למשחק</h1>
            <p className="text-gray-600 mt-2">
              מלא את הטופס הבא כדי להתכונן למשחק בצורה הטובה ביותר
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/')}
            className="h-10 w-10 rounded-full"
            title="חזור לדשבורד"
          >
            <Home className="h-6 w-6 text-primary" />
          </Button>
        </div>

        <Tabs defaultValue="new-form" className="w-full">
          <TabsList className="mb-8 w-full">
            <TabsTrigger value="new-form" className="flex-1">טופס הכנה למשחק</TabsTrigger>
            <TabsTrigger value="completed-forms" className="flex-1">צפייה בטפסים שמולאו</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new-form">
            <MentalPrepForm />
          </TabsContent>
          
          <TabsContent value="completed-forms">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">טפסי הכנה למשחק שמולאו</h2>
                <Button onClick={handleRefresh} variant="outline">רענן</Button>
              </div>
              
              {loading ? (
                <div className="text-center py-10">
                  <p className="text-gray-500">טוען נתונים...</p>
                </div>
              ) : completedForms.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">לא נמצאו טפסים שמולאו</p>
                </div>
              ) : (
                <DataTable columns={columns} data={completedForms} />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GamePreparation;
