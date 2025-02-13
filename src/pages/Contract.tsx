import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Download, Printer, Edit2, Save, Undo } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import SignatureCanvas from 'react-signature-canvas';

const Contract = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [contract, setContract] = useState<any>(null);
  const [playerSignature, setPlayerSignature] = useState("");
  const [isDrawing, setIsDrawing] = useState(false);
  const signatureRef = useRef<SignatureCanvas>(null);

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

  const clearSignature = () => {
    if (signatureRef.current) {
      signatureRef.current.clear();
      setPlayerSignature("");
    }
  };

  const saveSignature = () => {
    if (signatureRef.current) {
      const signatureData = signatureRef.current.toDataURL();
      setPlayerSignature(signatureData);
      setIsDrawing(false);
    }
  };

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
        signature: playerSignature,
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

  const getTeamColors = () => {
    const hash = contract.team.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const hue = hash % 360;
    return {
      primary: `hsl(${hue}, 70%, 50%)`,
      secondary: `hsl(${(hue + 30) % 360}, 60%, 60%)`,
    };
  };

  const teamColors = getTeamColors();

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
            {isEditing && isDrawing && (
              <>
                <Button variant="outline" onClick={clearSignature}>
                  <Undo className="h-4 w-4 mr-2" />
                  נקה חתימה
                </Button>
                <Button onClick={saveSignature}>
                  <Save className="h-4 w-4 mr-2" />
                  שמור חתימה
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setIsEditing(!isEditing);
                if (!isEditing) setIsDrawing(false);
              }}
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

        <div 
          className="relative bg-white p-8 rounded-xl shadow-xl print:shadow-none print:p-0 border-4"
          style={{
            borderImage: `linear-gradient(45deg, ${teamColors.primary}, ${teamColors.secondary}) 1`,
            backgroundImage: `linear-gradient(to right, ${teamColors.primary}05, ${teamColors.secondary}05)`
          }}
          id="contract-content"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="w-24 h-24">
              <div 
                className="w-full h-full rounded-full bg-gradient-to-r flex items-center justify-center"
                style={{ 
                  backgroundImage: `linear-gradient(45deg, ${teamColors.primary}, ${teamColors.secondary})` 
                }}
              >
                <span className="text-white text-2xl font-bold">
                  {contract.team?.substring(0, 2).toUpperCase() || "FC"}
                </span>
              </div>
            </div>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent" 
                style={{ 
                  backgroundImage: `linear-gradient(45deg, ${teamColors.primary}, ${teamColors.secondary})` 
                }}>
                חוזה שחקן מקצועני
              </h1>
              <p className="text-gray-600">
                שנחתם ביום {new Date().toLocaleDateString('he-IL')}
              </p>
            </div>
            <div className="w-24"></div> {/* Spacer for symmetry */}
          </div>

          <div className="space-y-6 text-lg leading-relaxed">
            <div className="bg-gray-50/80 p-6 rounded-lg backdrop-blur-sm border border-gray-200">
              <p className="mb-4 font-semibold text-xl text-center">
                הסכם התקשרות מקצועי
              </p>
              
              <p className="mb-6">
                שנערך ונחתם בין:
              </p>

              <div className="space-y-4">
                <p>
                  <span className="font-semibold">קבוצת {contract.team}</span> (להלן: "המועדון")
                  <br />
                  מצד אחד
                </p>

                <p>
                  <span className="font-semibold">{contract.full_name}</span> (להלן: "השחקן")
                  <br />
                  מצד שני
                </p>
              </div>

              <div className="mt-8 space-y-4">
                <p>הואיל והצדדים מעוניינים להסדיר את תנאי העסקתו של השחקן במועדון,</p>
                <p>לפיכך הוסכם, הוצהר והותנה בין הצדדים כדלקמן:</p>

                <div className="space-y-4 mt-6">
                  <p>
                    1. השחקן {contract.full_name} מתקבל למועדון {contract.team} המשחק ב{contract.league} כשחקן מקצועני.
                  </p>
                  
                  <p>
                    2. השחקן ישחק בעמדת {contract.position} וישא את מספר החולצה {contract.jersey_number}.
                  </p>

                  <p>
                    3. התמורה השנתית עבור שירותיו המקצועיים של השחקן תעמוד על סך {contract.contract_value} יורו.
                  </p>

                  <p>
                    4. השחקן מתחייב לפעול בהתאם למוטו האישי שלו: "{contract.mental_commitment}"
                  </p>

                  <p>
                    5. השחקן מתחייב לשמור על בסיס האוהדים שלו העומד על {contract.followers} עוקבים ולפעול להגדלתו.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-white to-gray-50 p-6 rounded-lg border border-gray-200 relative overflow-hidden">
              <h3 className="text-xl font-semibold mb-4" 
                style={{ color: teamColors.primary }}>
                חזון עתידי
              </h3>
              
              <div className="space-y-4 relative z-10">
                <p>
                  מטרת {contract.full_name} היא להפוך לשחקן המוביל של {contract.team}.
                </p>
                <p>
                  בשנת 2035 הוא צפוי להיבחר לחמישיית השנה של פיפ"א ולהוביל את נבחרת ישראל להישג השיא במונדיאל בעלייה לשלב רבע הגמר.
                </p>
                <p>
                  {contract.full_name} מכוון להגיע לרמות הגבוהות ביותר בכדורגל העולמי ולהיות מוכר בכל בית. בהצלחה.
                </p>
              </div>

              <div 
                className="absolute top-0 right-0 w-24 h-24 opacity-5 transform rotate-45"
                style={{
                  background: `linear-gradient(45deg, ${teamColors.primary}, ${teamColors.secondary})`
                }}
              />
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="font-semibold mb-4">חתימת השחקן:</p>
                {isEditing ? (
                  isDrawing ? (
                    <div className="border rounded-lg bg-white">
                      <SignatureCanvas
                        ref={signatureRef}
                        canvasProps={{
                          className: 'signature-canvas w-full h-32'
                        }}
                      />
                    </div>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={() => setIsDrawing(true)}
                    >
                      הוסף חתימה
                    </Button>
                  )
                ) : (
                  <div className="border-b border-gray-300 h-20 flex items-center justify-center">
                    {playerSignature ? (
                      <img src={playerSignature} alt="חתימת השחקן" className="h-16" />
                    ) : (
                      <span className="text-gray-400">טרם נחתם</span>
                    )}
                  </div>
                )}
                <p className="mt-2 text-sm text-gray-600">{contract.full_name}</p>
              </div>
              <div className="text-center">
                <p className="font-semibold mb-4">חתימת נציג המועדון:</p>
                <div className="h-20 flex items-center justify-center">
                  <span 
                    className="font-signature text-xl"
                    style={{ color: teamColors.primary }}
                  >
                    Marco Rossi
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">מנהל ספורטיבי</p>
              </div>
            </div>
          </div>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
            <div 
              className="transform rotate-45 text-6xl font-bold"
              style={{ color: teamColors.primary }}
            >
              OFFICIAL
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contract;
