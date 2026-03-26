"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, BarChart2, User, LogOut } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/history', label: 'History', icon: History },
    { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen flex bg-background text-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-surface/30 backdrop-blur-md flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg border border-primary/50 bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-lg tracking-wide">MockPrep</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link 
                key={item.href}
                href={item.href} 
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-primary/10 text-primary font-medium border border-primary/20' 
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden p-4 border-b border-white/5 flex items-center justify-between bg-surface/30 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded border border-primary/50 bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-[10px]">AI</span>
            </div>
            <span className="font-bold text-base">MockPrep</span>
          </div>
          <button onClick={handleLogout} className="text-white/60 hover:text-red-400">
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 w-full mx-auto max-w-[1600px]">
          {children}
        </div>

        {/* Subtle background glow */}
        <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      </main>
    </div>
  );
}
