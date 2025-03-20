
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { getImageUrl } from '@/lib/getImageUrl';

export default function CoachLandingTemplate() {
  // מידע מדגמי לטמפלט
  const coachData = {
    name: "אריק כהן",
    title: "מאמן מנטלי לספורטאים",
    subtitle: "ליווי מקצועי להצלחה ספורטיבית",
    mainReason: "10 שנות ניסיון בליווי ספורטאים",
    profileImage: "/assets/coach-profile.jpg", // תמונה לדוגמה
    description: "מאמן מקצועי עם ניסיון של למעלה מעשר שנים באימון מנטלי לספורטאים. סייעתי למאות ספורטאים להשיג את המטרות שלהם ולהתגבר על חסמים מנטליים. הגישה שלי משלבת טכניקות מתקדמות מעולם הפסיכולוגיה הספורטיבית, NLP וקואצ'ינג ביצועים.\n\nאני מאמין שכל ספורטאי יכול להגיע לביצועי שיא כאשר המצב המנטלי שלו מאוזן ומכוון למטרה. בעבודתי אני שם דגש על פיתוח חוסן מנטלי, התמודדות עם לחץ, שיפור המיקוד והריכוז, והגברת המוטיבציה.",
    contactEmail: "coach@example.com",
    contactPhone: "050-1234567",
    advantages: [
      "חוסן מנטלי",
      "שיפור ביטחון עצמי",
      "ניהול לחץ ומתח",
      "שיפור ריכוז ומיקוד",
      "הצבת מטרות והשגתן",
    ],
    workSteps: [
      "פגישת היכרות ואבחון צרכים אישי",
      "בניית תוכנית אימון מותאמת אישית",
      "מפגשי אימון והערכת התקדמות",
    ],
    ctaText: "קבע פגישת ייעוץ חינם!",
    colors: {
      bg: "#F1F0FB",
      accent: "#9b87f5",
      button: "#9b87f5",
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: coachData.colors.bg }}>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* הודעת הסבר */}
        <div className="bg-white rounded-lg p-4 mb-12 shadow-md text-center">
          <h2 className="text-xl font-bold">טמפלט לעמוד נחיתה למאמן</h2>
          <p className="mt-2">
            זהו טמפלט לדוגמה של עמוד נחיתה למאמן. 
            באמצעות מערכת עמודי הנחיתה, תוכל ליצור עמודים מותאמים אישית לפי הצרכים שלך.
          </p>
          <div className="mt-4">
            <Link 
              to="/landing-pages" 
              className="inline-block bg-primary text-white px-6 py-2 rounded-md hover:bg-primary/80 transition-colors"
            >
              לניהול עמודי הנחיתה שלי
            </Link>
          </div>
        </div>

        {/* Hero section */}
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 order-2 md:order-1">
            <h1 className="text-4xl font-bold leading-tight">{coachData.name}</h1>
            <h2 className="text-3xl font-bold">{coachData.title}</h2>
            <p className="text-xl">{coachData.subtitle}</p>
            
            {/* Main reason */}
            <div className="py-3 px-6 rounded-lg inline-block mt-2 text-white" style={{ backgroundColor: coachData.colors.accent }}>
              {coachData.mainReason}
            </div>
            
            <div className="py-4">
              <Button 
                className="text-lg px-8 py-6 rounded-md text-white font-medium"
                style={{ backgroundColor: coachData.colors.button }}
              >
                {coachData.ctaText}
              </Button>
            </div>
          </div>
          
          {/* Profile image */}
          <div className="flex justify-center order-1 md:order-2">
            <div className="rounded-full overflow-hidden h-64 w-64 border-4 shadow-lg" style={{ borderColor: coachData.colors.accent }}>
              <img 
                src="/placeholder.svg" 
                alt="תמונת פרופיל" 
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </div>
        
        {/* Advantages section */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold mb-8 text-center">יתרונות שתקבל בליווי</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coachData.advantages.map((advantage, index) => (
              <div 
                key={index} 
                className="p-6 rounded-lg shadow-md bg-white"
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4 text-white" style={{ backgroundColor: coachData.colors.accent }}>
                  <span className="font-bold text-xl">{index + 1}</span>
                </div>
                <h3 className="text-lg font-semibold mb-2">{advantage}</h3>
              </div>
            ))}
          </div>
        </div>
        
        {/* Work process section */}
        <div className="mt-24">
          <h2 className="text-2xl font-bold mb-12 text-center">תהליך העבודה שלנו</h2>
          <div className="relative">
            {/* Process line */}
            <div className="absolute hidden md:block left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform -translate-x-1/2"></div>
            
            {/* Process steps */}
            <div className="space-y-16">
              {coachData.workSteps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="md:absolute md:left-1/2 md:transform md:-translate-x-1/2 w-12 h-12 rounded-full z-10 flex items-center justify-center text-white" style={{ backgroundColor: coachData.colors.accent }}>
                    <span className="font-bold">{index + 1}</span>
                  </div>
                  
                  <div className={`md:w-5/12 ${index % 2 === 0 ? 'md:mr-auto md:pl-10' : 'md:ml-auto md:pr-10'} bg-white p-6 rounded-lg shadow-md ml-14 md:ml-0`}>
                    <h3 className="text-lg font-semibold mb-2">שלב {index + 1}</h3>
                    <p>{step}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Description section */}
        <div className="mt-24">
          <div className="bg-white rounded-lg p-8 shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">קצת עלי</h2>
            <p className="whitespace-pre-line">{coachData.description}</p>
          </div>
        </div>
        
        {/* Contact and CTA section */}
        <div className="mt-24 text-center">
          <h2 className="text-2xl font-bold mb-6">מוכנים להתחיל?</h2>
          <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
            <Button 
              className="w-full text-lg py-6 mb-6 text-white"
              style={{ backgroundColor: coachData.colors.button }}
            >
              {coachData.ctaText}
            </Button>
            
            <div className="space-y-4 mt-6">
              <div>
                <p className="text-gray-500 text-sm">שלח אימייל</p>
                <a href={`mailto:${coachData.contactEmail}`} className="text-primary font-medium hover:underline">
                  {coachData.contactEmail}
                </a>
              </div>
              <div>
                <p className="text-gray-500 text-sm">התקשר</p>
                <a href={`tel:${coachData.contactPhone}`} className="text-primary font-medium hover:underline">
                  {coachData.contactPhone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 mt-24 text-white" style={{ backgroundColor: coachData.colors.accent }}>
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} כל הזכויות שמורות</p>
        </div>
      </footer>
    </div>
  );
}
