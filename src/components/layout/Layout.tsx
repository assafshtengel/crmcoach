
import React, { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, Calendar, Users, Wrench, FileText, Settings, Menu, X, Target } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Layout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/dashboard-coach", label: "בית", icon: Home },
    { path: "/sessions-list", label: "מפגשים", icon: Calendar },
    { path: "/players-list", label: "שחקנים", icon: Users },
    { path: "/goals", label: "מטרות", icon: Target },
    { path: "/tool-management", label: "ניהול כלים", icon: Wrench },
    { path: "/session-summaries", label: "סיכומים", icon: FileText },
    { path: "/profile-coach", label: "הגדרות", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full bg-white shadow-sm">
        <div className="container flex h-16 items-center">
          {/* Logo and site name in the top left */}
          <div className="flex items-center mr-auto gap-3">
            <img 
              src="/lovable-uploads/40b936c5-746e-4c0e-8ba6-673d576cf884.png" 
              alt="CASSABOOM Logo" 
              className="h-10 w-auto"
            />
            <span className="font-bold text-xl text-primary hidden sm:block">CASSABOOM</span>
          </div>
          
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-2 rtl:space-x-reverse">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path}>
                  <Button variant={isActive(item.path) ? "default" : "ghost"}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </nav>
            
            {/* Mobile Navigation */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80%] sm:w-[350px] p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img 
                          src="/lovable-uploads/40b936c5-746e-4c0e-8ba6-673d576cf884.png" 
                          alt="CASSABOOM Logo" 
                          className="h-8 w-auto"
                        />
                        <span className="font-bold text-lg text-primary">CASSABOOM</span>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                  <nav className="flex-1 overflow-auto p-4">
                    <div className="space-y-2">
                      {navItems.map((item) => (
                        <Link 
                          key={item.path} 
                          to={item.path}
                          onClick={() => setOpen(false)}
                        >
                          <Button 
                            variant={isActive(item.path) ? "default" : "ghost"}
                            className="w-full justify-start"
                          >
                            <item.icon className="mr-2 h-5 w-5" />
                            {item.label}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
