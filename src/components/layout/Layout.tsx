
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50 py-3 px-4 md:px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="focus:outline-none transition-transform hover:scale-105">
            <div className="flex flex-col items-center">
              <img 
                src="/lovable-uploads/7164d991-59d2-4e9c-bedc-46d604c49fce.png" 
                alt="CASSABOOM - Coach Smarter, Grow Faster" 
                className="h-16 md:h-20 w-auto"
              />
              <div className="text-xs md:text-sm text-primary font-medium mt-1">
                אימון חכם יותר, צמיחה מהירה יותר
              </div>
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* כאן ניתן להוסיף בעתיד פקדי ניווט, כפתורי פעולה או תפריט */}
          </div>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
