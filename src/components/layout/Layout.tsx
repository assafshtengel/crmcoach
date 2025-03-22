
import React from 'react';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="container flex h-16 items-center">
          {/* Logo and site name in the top left */}
          <div className="flex items-center mr-auto gap-3">
            <img 
              src="/lovable-uploads/40b936c5-746e-4c0e-8ba6-673d576cf884.png" 
              alt="CASSABOOM Logo" 
              className="h-12 w-auto"
            />
            <span className="font-bold text-xl text-primary hidden sm:block">CASSABOOM</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
