
import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowRight, Home, Calendar, Users, Wrench, FileText, Settings } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

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
            <nav className="flex items-center space-x-2 rtl:space-x-reverse">
              <Link to="/dashboard-coach">
                <Button variant={isActive("/dashboard-coach") ? "default" : "ghost"}>
                  <Home className="mr-2 h-4 w-4" />
                  בית
                </Button>
              </Link>
              <Link to="/sessions-list">
                <Button variant={isActive("/sessions-list") ? "default" : "ghost"}>
                  <Calendar className="mr-2 h-4 w-4" />
                  מפגשים
                </Button>
              </Link>
              <Link to="/players-list">
                <Button variant={isActive("/players-list") ? "default" : "ghost"}>
                  <Users className="mr-2 h-4 w-4" />
                  שחקנים
                </Button>
              </Link>
              <Link to="/tool-management">
                <Button variant={isActive("/tool-management") ? "default" : "ghost"}>
                  <Wrench className="mr-2 h-4 w-4" />
                  ניהול כלים
                </Button>
              </Link>
              <Link to="/session-summaries">
                <Button variant={isActive("/session-summaries") ? "default" : "ghost"}>
                  <FileText className="mr-2 h-4 w-4" />
                  סיכומים
                </Button>
              </Link>
              <Link to="/profile-coach">
                <Button variant={isActive("/profile-coach") ? "default" : "ghost"}>
                  <Settings className="mr-2 h-4 w-4" />
                  הגדרות
                </Button>
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
