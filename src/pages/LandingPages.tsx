
import { LandingPagesList } from '@/components/landing-page/LandingPagesList';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function LandingPages() {
  return (
    <div className="container py-8">
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold">ניהול עמודי נחיתה</h2>
            <p className="text-gray-500 mt-1">צור ונהל עמודי נחיתה מותאמים אישית לשיווק השירותים שלך</p>
          </div>
          <Link to="/coach-landing-template">
            <Button variant="outline" className="whitespace-nowrap">צפה בטמפלט לדוגמה</Button>
          </Link>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-2/3">
            <h3 className="text-lg font-medium mb-2">טמפלט לדוגמה</h3>
            <p className="text-gray-500 mb-4">לא בטוח איך להתחיל? בדוק את הטמפלט שלנו למאמנים מנטליים וספורטיביים</p>
            <p className="text-sm text-gray-600 mb-4">
              העמוד כולל אזורים לתיאור היתרונות שלך, תהליך העבודה, מידע על הרקע שלך,
              פרטים ליצירת קשר ועוד. התאם אותו בקלות לצרכים שלך.
            </p>
            <div className="flex">
              <Link to="/coach-landing-template">
                <Button>צפה בטמפלט</Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/3 bg-gray-100 rounded-lg p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">🚀</div>
              <p className="text-sm text-gray-600">טמפלט מוכן לשימוש</p>
            </div>
          </div>
        </div>
      </div>
      
      <LandingPagesList />
    </div>
  );
}
