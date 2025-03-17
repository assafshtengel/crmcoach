
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function PlayerVideos() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <Button variant="outline" onClick={() => navigate("/player/profile")}>
          <ArrowRight className="mr-2 h-4 w-4" /> חזרה לפרופיל
        </Button>
        <h1 className="text-3xl font-bold">סרטוני אימון</h1>
      </div>
      
      <div className="text-center py-12">
        <p className="text-gray-500">תוכן זה יתווסף בקרוב</p>
      </div>
    </div>
  );
}
