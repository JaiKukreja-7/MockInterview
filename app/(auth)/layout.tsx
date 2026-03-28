import React from 'react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)', transition: 'var(--transition)' }}>
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 hover:bg-primary/30 blur-[120px] rounded-full transition-all duration-1000"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/20 blur-[120px] rounded-full"></div>
      
      {children}
    </div>
  );
}
