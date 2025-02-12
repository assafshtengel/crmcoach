
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { MentalPrepForm } from "@/components/MentalPrepForm";

const Index = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getUserEmail = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserEmail(user?.email || null);
    };
    getUserEmail();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="min-h-screen bg-sage-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">ברוך הבא{userEmail ? `, ${userEmail}` : ''}</h1>
          <Button onClick={handleLogout} variant="outline">התנתק</Button>
        </div>
        <MentalPrepForm />
      </div>
    </div>
  );
};

export default Index;
