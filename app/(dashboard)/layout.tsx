"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, History, BarChart2, User, LogOut, Database } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

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
    { href: '/question-bank', label: 'Question Bank', icon: Database, badge: '200+' },
    { href: '/history', label: 'History', icon: History },
    { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Sidebar */}
      <aside className="w-64 backdrop-blur-md flex-col hidden md:flex sticky top-0 h-screen" style={{ backgroundColor: 'var(--bg-surface)', borderRight: '1px solid var(--border-color)', transition: 'var(--transition)' }}>
        <div className="p-6" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg border border-primary/50 bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-sm">AI</span>
            </div>
            <span className="font-bold text-lg tracking-wide" style={{ color: 'var(--text-primary)' }}>MockPrep</span>
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
                    : 'hover:bg-primary/5'
                }`}
                style={!isActive ? { color: 'var(--text-secondary)' } : undefined}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1">{item.label}</span>
                {(item as any).badge && (
                  <span className="text-[10px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">{(item as any).badge}</span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4" style={{ borderTop: '1px solid var(--border-color)' }}>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:text-red-400 hover:bg-red-400/10 transition-colors"
            style={{ color: 'var(--text-secondary)' }}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative overflow-hidden min-h-screen">
        {/* Mobile Header */}
        <header className="md:hidden p-4 flex items-center justify-between backdrop-blur-md sticky top-0 z-50" style={{ backgroundColor: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }}>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded border border-primary/50 bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-[10px]">AI</span>
            </div>
            <span className="font-bold text-base" style={{ color: 'var(--text-primary)' }}>MockPrep</span>
          </div>
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <button onClick={handleLogout} style={{ color: 'var(--text-secondary)' }} className="hover:text-red-400">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="absolute top-6 right-6 md:top-8 md:right-8 z-50 hidden md:block">
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 w-full mx-auto max-w-[1600px]">
          {children}
        </div>

        {/* Subtle background glow */}
        <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      </main>
    </div>
  );
}
