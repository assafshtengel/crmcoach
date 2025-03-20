
import { LandingPagesList } from '@/components/landing-page/LandingPagesList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function LandingPages() {
  return (
    <div className="container py-8">
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-medium">טמפלט לדוגמה</h2>
            <p className="text-sm text-gray-500">לא בטוח איך להתחיל? בדוק את הטמפלט שלנו</p>
          </div>
          <Link to="/coach-landing-template">
            <Button variant="outline">צפה בטמפלט</Button>
          </Link>
        </div>
      </div>
      <LandingPagesList />
    </div>
  );
}
