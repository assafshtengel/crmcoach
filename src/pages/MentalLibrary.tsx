
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { MentalLibrary } from "@/components/mental-library/MentalLibrary";

const MentalLibraryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 to-white">
      <header className="p-4 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            הארכיון המנטאלי - מחקרים
          </h1>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="transition-transform hover:scale-105"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main>
        <MentalLibrary />
      </main>
    </div>
  );
};

export default MentalLibraryPage;
