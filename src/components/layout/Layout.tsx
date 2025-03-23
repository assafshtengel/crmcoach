import React from 'react';
import { Outlet, Link } from 'react-router-dom';
export function Layout() {
  return <div className="flex min-h-screen flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50 py-3 px-4 md:px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="focus:outline-none transition-transform hover:scale-105">
            <div className="flex flex-col items-center">
              <img src="/lovable-uploads/e56d4611-f512-47f8-901e-904530a294b1.png" alt="CASSABOOM - Coach Smarter, Grow Faster" className="h-100 md:h-200 w-auto object-cover" />
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
    </div>;
}