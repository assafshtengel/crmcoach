
import React, { useState, useEffect } from 'react';
import { MentalPrepForm } from '@/components/MentalPrepForm';
import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronRight, Home, Eye, RefreshCw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DataTable } from '@/components/admin/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { supabase } from '@/lib/supabase';
import { FormData } from '@/types/mentalPrep';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { PreviewContent } from '@/components/mental-prep/PreviewDialog';

// Define the column type for the completed forms table
type CompletedForm = {
  id: string;
  full_name: string;
  email: string;
  match_date: string;
  opposing_team: string;
  created_at: string;
  selected_states: string[];
  selected_goals: any[];
  answers: Record<string, string>;
  current_pressure?: string;
  optimal_pressure?: string;
  player_name?: string;
};

const GamePreparation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [completedForms, setCompletedForms] = useState<CompletedForm[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedForm, setSelectedForm] = useState<CompletedForm | null>(null);
  const [showFormDetails, setShowFormDetails] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("new-form");

  useEffect(() => {
    // Check for activeTab in location state (for navigation from other components)
    if (location.state && location.state.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    
    fetchCompletedForms();
  }, [location.state]);

  const fetchCompletedForms = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session) {
        console.log('No session found, redirecting to auth');
        navigate('/auth');
        return;
      }

      // Log the user ID we're using for the query
      console.log('Fetching forms for coach ID:', session.session.user.id);

      const { data, error } = await supabase
        .from('mental_prep_forms')
        .select('*')
        .eq('coach_id', session.session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching completed forms:', error);
        throw error;
      }

      console.log('Fetched forms:', data);
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
            onClick={() => handleViewDetails(row.original)}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" /> צפה בפרטים
          </Button>
        );
      },
    },
  ];

  const handleViewDetails = (form: CompletedForm) => {
    setSelectedForm(form);
    setShowFormDetails(true);
  };

  const handleRefresh = () => {
    fetchCompletedForms();
  };

  // Convert the selected form to the FormData type needed by PreviewContent
  const convertToFormData = (form: CompletedForm | null): FormData | null => {
    if (!form) return null;
    
    return {
      fullName: form.full_name,
      email: form.email,
      phone: '',
      matchDate: form.match_date,
      opposingTeam: form.opposing_team,
      gameType: form.opposing_team,
      selectedStates: form.selected_states || [],
      selectedGoals: form.selected_goals || [],
      answers: form.answers || {},
      currentPressure: form.current_pressure,
      optimalPressure: form.optimal_pressure,
      playerName: form.player_name,
    };
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

        <Tabs value={activeTab} defaultValue="new-form" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="mb-8 w-full">
            <TabsTrigger value="new-form" className="flex-1">טופס הכנה למשחק</TabsTrigger>
            <TabsTrigger value="completed-forms" className="flex-1">צפייה בטפסים שמולאו</TabsTrigger>
          </TabsList>
          
          <TabsContent value="new-form">
            <MentalPrepForm onFormSubmitted={handleRefresh} />
          </TabsContent>
          
          <TabsContent value="completed-forms">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">טפסי הכנה למשחק שמולאו</h2>
                <Button 
                  onClick={handleRefresh} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> רענן
                </Button>
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

      <Dialog open={showFormDetails} onOpenChange={setShowFormDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>פרטי טופס הכנה למשחק</DialogTitle>
          </DialogHeader>
          {selectedForm && (
            <div className="mt-4">
              <div ref={el => {}} className="space-y-6">
                <PreviewContent formData={convertToFormData(selectedForm)!} previewRef={React.createRef()} />
              </div>
              <div className="flex justify-end mt-6">
                <Button onClick={() => setShowFormDetails(false)}>סגור</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GamePreparation;
