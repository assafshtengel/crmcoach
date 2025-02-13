
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { FileText, PenLine } from "lucide-react";

interface Contract {
  player_name: string;
  team: string;
  league: string;
  position: string;
  mental_commitment: string;
  signature_date: string;
}

export const SignedContractCard = () => {
  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSignedContract = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: contractData, error } = await supabase
          .from("contracts")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        if (!error && contractData) {
          setContract(contractData);
        }
      } catch (error) {
        console.error("Error fetching contract:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedContract();
  }, []);

  if (isLoading) return null;

  if (!contract) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">החוזה שלי</CardTitle>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate("/contract")}
            className="hover:bg-primary hover:text-white transition-colors"
          >
            <PenLine className="h-4 w-4 ml-2" />
            חתום על חוזה
          </Button>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm text-center py-8">
            עדיין לא חתמת על חוזה. לחץ על הכפתור למעלה כדי לחתום על החוזה שלך.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">החוזה שלי</CardTitle>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => navigate("/contract")}
          className="hover:bg-primary hover:text-white transition-colors"
        >
          <FileText className="h-4 w-4 ml-2" />
          צפה בחוזה המלא
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold">שם השחקן:</p>
            <p>{contract.player_name}</p>
          </div>
          <div>
            <p className="font-semibold">קבוצה:</p>
            <p>{contract.team}</p>
          </div>
          <div>
            <p className="font-semibold">ליגה:</p>
            <p>{contract.league}</p>
          </div>
          <div>
            <p className="font-semibold">עמדה:</p>
            <p>{contract.position}</p>
          </div>
        </div>
        <div className="mt-4">
          <p className="font-semibold">המחויבות שלי:</p>
          <p className="italic text-sm mt-1">"{contract.mental_commitment}"</p>
        </div>
        <div className="text-sm text-muted-foreground mt-2">
          נחתם בתאריך: {new Date(contract.signature_date).toLocaleDateString('he-IL')}
        </div>
      </CardContent>
    </Card>
  );
};
