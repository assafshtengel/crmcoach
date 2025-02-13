
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Printer, Edit2, Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const Contract = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [playerSignature, setPlayerSignature] = useState("");

  useEffect(() => {
    const fetchPlayerDetails = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data: playerData, error: playerError } = await supabase
        .from("player_details")
        .select("*")
        .eq("id", user.id)
        .single();

      if (playerError || !playerData) {
        navigate("/player-form");
        return;
      }

      const { data: mentalData, error: mentalError } = await supabase
        .from("mental_commitments")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (mentalError || !mentalData) {
        navigate("/mental-commitment");
        return;
      }

      setContract({
        ...playerData,
        mental_commitment: mentalData.motivational_quote,
      });
    };

    fetchPlayerDetails();
  }, [navigate]);

  const handleDownload = async () => {
    const element = document.getElementById("contract-content");
    if (!element) return;

    try {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("professional-contract.pdf");

      toast({
        title: "החוזה הורד בהצלחה",
        description: "כעת תוכל להדפיס ולתלות אותו במקום בולט",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "שגיאה בהורדת החוזה",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = async () => {
    if (!contract) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { error } = await supabase
      .from("contracts")
      .upsert({
        user_id: user.id,
        player_name: contract.full_name,
        team: contract.team,
        league: contract.league,
        position: contract.position,
        jersey_number: contract.jersey_number,
        contract_value: contract.contract_value,
        followers: contract.followers,
        mental_commitment: contract.mental_commitment,
      });

    if (error) {
      toast({
        title: "שגיאה בשמירת החוזה",
        description: "אנא נסה שנית",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "החוזה נשמר בהצלחה",
      description: "כל הכבוד! עכשיו הגיע הזמן להתחיל לעבוד קשה כדי להגשים את החלום",
    });
    setIsEditing(false);
  };

  if (!contract) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 print:hidden">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit2 className="h-4 w-4 mr-2" />
              {isEditing ? "סיום עריכה" : "עריכה"}
            </Button>
            <Button
              variant="outline"
              onClick={handlePrint}
            >
              <Printer className="h-4 w-4 mr-2" />
              הדפסה
            </Button>
            <Button
              variant="outline"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4 mr-2" />
              הורדה
            </Button>
            {isEditing && (
              <Button
                onClick={handleSave}
              >
                <Save className="h-4 w-4 mr-2" />
                שמירה
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-xl print:shadow-none print:p-0">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              זה הרגע שבו החלום הופך למציאות
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              חוזה זה מסמל את המחויבות שלך לחלום. תלה אותו במקום בולט בחדר שלך - כשהמוח רואה את היעד בצורה ברורה וקבועה, הוא מתחיל ליצור את הדרך להשגתו.
            </p>
          </div>

          <div id="contract-content" className="space-y-8 print:p-0">
            {/* Logo and Header */}
            <div className="flex justify-center mb-12">
              <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white text-4xl font-bold">FC</span>
              </div>
            </div>

            {/* Contract Title */}
            <h2 className="text-2xl font-bold text-center mb-12">
              חוזה שחקן מקצועני
            </h2>

            {/* Contract Content */}
            <div className="space-y-6 text-lg leading-relaxed">
              <p>
                שנחתם ביום {new Date().toLocaleDateString('he-IL')}
              </p>
              <p>
                בין {contract.full_name} (להלן: "השחקן") לבין קבוצת {contract.team} (להלן: "המועדון")
              </p>
              <div className="space-y-4">
                <p>הואיל והצדדים מעוניינים להסדיר את תנאי העסקתו של השחקן במועדון, הוסכם כדלקמן:</p>
                <ol className="list-decimal list-inside space-y-2 pr-4">
                  <li>השחקן ישחק בעמדת {contract.position} וישא את חולצה מספר {contract.jersey_number}.</li>
                  <li>המועדון משחק ב{contract.league}.</li>
                  <li>השחקן יקבל שכר שנתי בסך {contract.contract_value} יורו.</li>
                  <li>השחקן מתחייב לפעול לפי המוטו: "{contract.mental_commitment}"</li>
                  <li>השחקן מתחייב לשמור על בסיס האוהדים שלו ({contract.followers} עוקבים) ולהגדילו.</li>
                </ol>
              </div>
            </div>

            {/* Signatures Section */}
            <div className="mt-16 pt-8 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <p className="font-semibold mb-2">חתימת השחקן:</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={playerSignature}
                      onChange={(e) => setPlayerSignature(e.target.value)}
                      className="border-b border-gray-300 text-center w-full"
                      placeholder="הקלד את שמך כחתימה"
                    />
                  ) : (
                    <div className="border-b border-gray-300 h-8">
                      {playerSignature}
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-semibold mb-2">חתימת נציג המועדון:</p>
                  <div className="font-signature text-xl text-blue-600">
                    Marco Rossi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contract;
