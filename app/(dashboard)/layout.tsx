"use client";

import React from 'react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Home, History, BarChart2, User, LogOut, Database, ArrowUp } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';
import { AnimatePresence, motion } from 'framer-motion';

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisible = () => setVisible(window.scrollY > 300);
    window.addEventListener('scroll', toggleVisible);
    return () => window.removeEventListener('scroll', toggleVisible);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-11 h-11 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow-[0_4px_15px_rgba(124,58,237,0.4)] z-[100] transition-colors hover:bg-[#6D28D9]"
        >
          <ArrowUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

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
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors relative group/nav ${
                  isActive 
                    ? 'text-primary font-medium' 
                    : 'hover:bg-primary/5'
                }`}
                style={!isActive ? { color: 'var(--text-secondary)' } : undefined}
              >
                {isActive && (
                  <>
                    <div className="absolute inset-0 rounded-lg p-[1px] -z-10 animate-gradient-border opacity-100">
                      <div className="w-full h-full rounded-lg bg-surface" style={{ backgroundColor: 'var(--bg-surface)' }}></div>
                    </div>
                    <style jsx>{`
                      @keyframes rotate-gradient {
                        0% { background-position: 0% 50%; }
                        50% { background-position: 100% 50%; }
                        100% { background-position: 0% 50%; }
                      }
                      .animate-gradient-border {
                        background: linear-gradient(90deg, #7C3AED, #06b6d4, #7C3AED);
                        background-size: 200% 200%;
                        animation: rotate-gradient 3s linear infinite;
                      }
                    `}</style>
                  </>
                )}
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

        {/* Desktop Top Bar */}
        <div className="hidden md:flex items-center justify-end px-8 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border-color)', transition: 'var(--transition)' }}>
          <ThemeToggle />
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 w-full mx-auto max-w-[1600px]">
          {children}
        </div>

        <ScrollToTop />

        {/* Subtle background glow */}
        <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      </main>
    </div>
  );
}
