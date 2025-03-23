
import React from 'react';
import { Outlet } from 'react-router-dom';

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="container flex h-16 items-center">
          {/* Empty header */}
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
