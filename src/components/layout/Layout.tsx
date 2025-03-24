
import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

export function Layout() {
  const [actionCount, setActionCount] = useState(0);
  const [showSplash, setShowSplash] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Track navigation changes
  useEffect(() => {
    setActionCount(prev => {
      const newCount = prev + 1;
      // Show splash every 5-6 actions
      if (newCount >= 5) {
        setShowSplash(true);
        setTimeout(() => setShowSplash(false), 2000); // Hide after 2 seconds
        return 0; // Reset counter
      }
      return newCount;
    });
  }, [location.pathname]); // Trigger on route changes

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="bg-[#2C3E50] text-white sticky top-0 z-50 py-3 px-4 md:px-6 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="font-bold text-xl md:text-2xl bg-gradient-to-r from-white to-white/80 bg-clip-text animate-fade-in">
            דַשְׁבּוֹרְד קְאַסַּבּוּם
          </h1>
          
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              className="text-white hover:bg-white/20 transition-all p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6 md:px-6 animate-fade-in">
        <Outlet />
      </main>

      {/* Logo Splash Overlay */}
      {showSplash && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-md z-50 animate-fade-in">
          <div className="flex items-center justify-center p-8 animate-scale-in">
            <img 
              src="/lovable-uploads/e56d4611-f512-47f8-901e-904530a294b1.png" 
              alt="CASSABOOM - Coach Smarter, Grow Faster" 
              className="h-auto w-[250px] object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
