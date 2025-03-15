
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-red-500">404</h1>
        <p className="text-xl text-gray-600 mb-6">דף זה אינו קיים במערכת</p>
        <div className="flex flex-col gap-4">
          <Button 
            onClick={() => navigate('/')} 
            className="w-full flex items-center justify-center gap-2"
          >
            <Home className="h-4 w-4" />
            חזרה לדף הבית
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)} 
            className="w-full"
          >
            חזרה לדף הקודם
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
