
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">העמוד המבוקש לא נמצא</p>
        <p className="text-gray-500 mb-6">
          הנתיב "{location.pathname}" אינו קיים במערכת.
        </p>
        <Link 
          to="/" 
          className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/80 transition-colors"
        >
          חזרה לדף הבית
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
