
import React from 'react';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="container flex h-16 items-center">
          {/* Logo in the top left */}
          <div className="flex items-center mr-auto">
            <img 
              src="/lovable-uploads/106fd577-55b4-4dda-9b95-f7e8e483976e.png" 
              alt="CASSABOOM Logo" 
              className="h-12 w-auto"
            />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
