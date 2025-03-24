
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';

export function Layout() {
  const [actionCount, setActionCount] = useState(0);
  const [showSplash, setShowSplash] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Track navigation changes
  useEffect(() => {
    setActionCount(prev => {
      const newCount = prev + 1;
      // Show splash every 5-6 actions
      if (newCount >= 5) {
        setShowSplash(true);
        setTimeout(() => setShowSplash(false), 900); // Hide after 0.9 seconds
        return 0; // Reset counter
      }
      return newCount;
    });
  }, [location.pathname]); // Trigger on route changes

  // Listen for the custom event
  useEffect(() => {
    const handleSessionSummarySaved = () => {
      // Navigate to coach dashboard
      navigate('/dashboard-coach');
    };

    window.addEventListener('sessionSummarySaved', handleSessionSummarySaved);
    
    return () => {
      window.removeEventListener('sessionSummarySaved', handleSessionSummarySaved);
    };
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50 py-3 px-4 md:px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div></div> {/* Empty div to maintain layout balance */}
          
          <div className="flex items-center gap-4">
            {/* כאן ניתן להוסיף בעתיד פקדי ניווט, כפתורי פעולה או תפריט */}
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>

      {/* Logo Splash Overlay */}
      {showSplash && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50 animate-fade-in">
          <div className="flex items-center justify-center p-8 animate-scale-in">
            <img 
              src="/lovable-uploads/e56d4611-f512-47f8-901e-904530a294b1.png" 
              alt="CASSABOOM - Coach Smarter, Grow Faster" 
              className="h-auto w-[200px] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
