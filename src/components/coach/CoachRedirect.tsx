
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const CoachRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // הצג הודעת פופ אפ
    toast({
      title: "טעינת עמוד המאמן שלך...",
      duration: 2000,
    });

    // המתן מעט ואז הפנה לעמוד index
    const redirectTimer = setTimeout(() => {
      navigate('/index');
    }, 1000);

    return () => clearTimeout(redirectTimer);
  }, [navigate]);

  // הצג מסך טעינה בזמן ההמתנה
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-sage-50 to-white">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
        <p className="mt-4 text-lg font-medium">טוען את עמוד המאמן שלך...</p>
      </div>
    </div>
  );
};

export default CoachRedirect;
