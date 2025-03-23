
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="container mx-auto flex h-20 items-center justify-center md:justify-start">
          <Link to="/" className="flex items-center">
            <img 
              src="/lovable-uploads/d047e01f-672c-4050-b36c-6e4a098565e4.png" 
              alt="CASSABOOM" 
              className="h-16 md:h-20 w-auto transition-transform duration-300 hover:scale-105"
            />
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
