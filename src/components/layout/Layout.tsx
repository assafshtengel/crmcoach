
import React, { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Calendar, Users, Wrench, FileText, Settings, Menu, X, Target } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: "/dashboard-coach", label: "בית", icon: Home },
    { path: "/sessions-list", label: "מפגשים", icon: Calendar },
    { path: "/players-list", label: "שחקנים", icon: Users },
    { path: "/goals", label: "מטרות", icon: Target }, // New Goals navigation item
    { path: "/tool-management", label: "ניהול כלים", icon: Wrench },
    { path: "/session-summaries", label: "סיכומים", icon: FileText },
    { path: "/profile-coach", label: "הגדרות", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link to="/" className="mr-4 hidden md:flex">
            <Button variant="ghost" className="px-2">
              <Home className="h-5 w-5" />
            </Button>
          </Link>
          <div className="mr-4 flex flex-1 md:hidden">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
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
                      <h2 className="text-lg font-semibold">תפריט</h2>
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
      <main className="flex-1">{children}</main>
    </div>
  );
}
