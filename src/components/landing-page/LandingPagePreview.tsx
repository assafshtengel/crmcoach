
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface LandingPageData {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  contact_email: string;
  contact_phone: string;
  main_reason: string;
  advantages: string[];
  work_steps: string[];
  cta_text: string;
  profile_image_path: string | null;
  bg_color: string;
  accent_color: string;
  button_color: string;
  is_dark_text: boolean;
  is_published?: boolean;
}

export function LandingPagePreview() {
  const { id } = useParams<{ id: string }>();
  const [pageData, setPageData] = useState<LandingPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isPreview = window.location.pathname.includes('/preview/');

  useEffect(() => {
    const fetchLandingPage = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('landing_pages')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        
        // If not in preview mode, check if the page is published
        if (!isPreview && !data.is_published) {
          throw new Error('עמוד זה אינו זמין');
        }

        setPageData(data as LandingPageData);
      } catch (error) {
        console.error('Error loading landing page:', error);
        toast({
          title: "שגיאה בטעינת העמוד",
          description: "לא ניתן לטעון את עמוד הנחיתה המבוקש",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLandingPage();
  }, [id, toast, isPreview]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!pageData) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ backgroundColor: '#f9fafb' }}>
        <div className="text-center p-8 max-w-md">
          <h2 className="text-2xl font-bold mb-4">עמוד לא נמצא</h2>
          <p className="mb-6">עמוד הנחיתה המבוקש אינו קיים או שאינו זמין כרגע.</p>
          <Button 
            onClick={() => window.history.back()}
            className="bg-primary hover:bg-primary/90"
          >
            חזרה
          </Button>
        </div>
      </div>
    );
  }

  const textColorClass = pageData.is_dark_text ? 'text-gray-800' : 'text-white';

  // Format phone number with a link
  const formatPhone = (phone: string) => {
    return phone.startsWith('0') ? phone : `0${phone}`;
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: pageData.bg_color }}>
      {/* Header with preview banner */}
      {isPreview && (
        <div className="bg-black text-white text-center py-2 text-sm">
          תצוגה מקדימה - עמוד זה אינו מפורסם עדיין
        </div>
      )}
      
      {/* Main content */}
      <div className="flex-grow">
        <div className="container mx-auto px-4 py-12 max-w-6xl">
          {/* Hero section */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className={`space-y-6 order-2 md:order-1 ${textColorClass}`}>
              <h1 className="text-4xl font-bold leading-tight">{pageData.title}</h1>
              <p className="text-xl">{pageData.subtitle}</p>
              
              {/* Main reason */}
              <div className="py-3 px-6 rounded-lg inline-block mt-2" style={{ backgroundColor: pageData.accent_color, color: 'white' }}>
                {pageData.main_reason}
              </div>
              
              <div className="py-4">
                <Button 
                  className="text-lg px-8 py-6 rounded-md text-white font-medium"
                  style={{ backgroundColor: pageData.button_color }}
                >
                  {pageData.cta_text}
                </Button>
              </div>
            </div>
            
            {/* Profile image */}
            <div className="flex justify-center order-1 md:order-2">
              {pageData.profile_image_path ? (
                <div className="rounded-full overflow-hidden h-64 w-64 border-4 shadow-lg" style={{ borderColor: pageData.accent_color }}>
                  <img 
                    src={`/storage/landing-pages/${pageData.profile_image_path}`} 
                    alt="תמונת פרופיל" 
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="rounded-full bg-gray-200 h-64 w-64 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
            </div>
          </div>
          
          {/* Advantages section */}
          <div className="mt-24">
            <h2 className={`text-2xl font-bold mb-8 text-center ${textColorClass}`}>יתרונות שתקבל בליווי</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageData.advantages.map((advantage, index) => (
                <div 
                  key={index} 
                  className="p-6 rounded-lg shadow-md bg-white"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: pageData.accent_color }}>
                    <span className="text-white font-bold text-xl">{index + 1}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{advantage}</h3>
                </div>
              ))}
            </div>
          </div>
          
          {/* Work process section */}
          <div className="mt-24">
            <h2 className={`text-2xl font-bold mb-12 text-center ${textColorClass}`}>תהליך העבודה שלנו</h2>
            <div className="relative">
              {/* Process line */}
              <div className="absolute hidden md:block left-1/2 top-0 bottom-0 w-1 bg-gray-200 transform -translate-x-1/2"></div>
              
              {/* Process steps */}
              <div className="space-y-16">
                {pageData.work_steps.map((step, index) => (
                  <div key={index} className="relative">
                    <div className={`md:absolute md:left-1/2 md:transform md:-translate-x-1/2 w-12 h-12 rounded-full z-10 flex items-center justify-center ${index % 2 === 0 ? 'md:top-0' : 'md:top-0'}`} style={{ backgroundColor: pageData.accent_color }}>
                      <span className="text-white font-bold">{index + 1}</span>
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
              <p className="whitespace-pre-line">{pageData.description}</p>
            </div>
          </div>
          
          {/* Contact and CTA section */}
          <div className="mt-24 text-center">
            <h2 className={`text-2xl font-bold mb-6 ${textColorClass}`}>מוכנים להתחיל?</h2>
            <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
              <Button 
                className="w-full text-lg py-6 mb-6 text-white"
                style={{ backgroundColor: pageData.button_color }}
              >
                {pageData.cta_text}
              </Button>
              
              <div className="space-y-4 mt-6">
                <div>
                  <p className="text-gray-500 text-sm">שלח אימייל</p>
                  <a href={`mailto:${pageData.contact_email}`} className="text-primary font-medium hover:underline">
                    {pageData.contact_email}
                  </a>
                </div>
                <div>
                  <p className="text-gray-500 text-sm">התקשר</p>
                  <a href={`tel:${formatPhone(pageData.contact_phone)}`} className="text-primary font-medium hover:underline">
                    {formatPhone(pageData.contact_phone)}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="py-6 mt-24" style={{ backgroundColor: pageData.accent_color }}>
        <div className="container mx-auto px-4 text-center text-white">
          <p>© {new Date().getFullYear()} כל הזכויות שמורות</p>
        </div>
      </footer>
    </div>
  );
}
