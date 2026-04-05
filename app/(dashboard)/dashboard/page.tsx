"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, Play, BarChart2, Zap } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useTheme } from '@/components/ThemeProvider';

// Lazy load Three.js background – SSR disabled to avoid hydration errors
const DashboardBackground = dynamic(() => import('@/components/DashboardBackground'), { ssr: false, loading: () => null });

/* ─── Typewriter greeting (unchanged) ─── */
function WelcomeGreeting({ name }: { name?: string }) {
  const [text, setText] = useState('');
  const fullText = `Welcome back, ${name || 'User'} 👋`;
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setText(fullText.slice(0, i + 1));
      i++;
      if (i >= fullText.length) {
        clearInterval(interval);
        setComplete(true);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [fullText]);

  return (
    <div className="relative inline-block">
      <h1 className="text-3xl font-bold inline">{text}</h1>
      {!complete && (
        <span className="inline-block ml-1 text-primary font-light" style={{ animation: 'blink 0.8s infinite' }}>|</span>
      )}
    </div>
  );
}

/* ─── Reusable 3D tilt card with premium hover effects ─── */
function TiltCard({
  children,
  maxTilt = 15,
  scale = 1.04,
  className = '',
  style = {},
}: {
  children: React.ReactNode;
  maxTilt?: number;
  scale?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!ref.current || !innerRef.current || window.innerWidth < 768) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;
    // Magnetic cursor translation (subtle)
    const moveX = ((x - centerX) / centerX) * 4;
    const moveY = ((y - centerY) / centerY) * 4;
    ref.current.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate(${moveX}px, ${moveY}px) scale(${scale})`;
    // Inner glow torch-light (subtle)
    innerRef.current.style.backgroundImage = `radial-gradient(circle at ${x}px ${y}px, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.03) 40%, transparent 70%)`;
  }, [maxTilt, scale]);

  const handleMouseLeave = useCallback(() => {
    if (!ref.current || !innerRef.current) return;
    ref.current.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translate(0px, 0px) scale(1)`;
    innerRef.current.style.backgroundImage = 'none';
    setHovered(false);
  }, []);

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`${className} tilt-card-mobile`}
      style={{
        transition: 'transform 0.2s cubic-bezier(0.23, 1, 0.32, 1)',
        willChange: 'transform',
        transformStyle: 'preserve-3d',
        position: 'relative',
        ...style,
      }}
    >
      {/* Animated gradient border */}
      <div
        className="tilt-card-border"
        style={{
          position: 'absolute',
          inset: '-1px',
          borderRadius: 'inherit',
          background: 'conic-gradient(from var(--border-angle, 0deg), rgba(124,58,237,0.5), rgba(6,182,212,0.4), rgba(236,72,153,0.3), rgba(124,58,237,0.5))',
          opacity: hovered ? 0.6 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: -1,
          animation: 'rotate-card-border 3s linear infinite',
        }}
      />
      <div
        ref={innerRef}
        style={{
          position: 'relative',
          borderRadius: 'inherit',
          zIndex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Main dashboard ─── */
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, bestScore: 0, hours: 0 });
  const [interviews, setInterviews] = useState<any[]>([]);
  const [weakAreas, setWeakAreas] = useState<{ topic: string; score: number }[]>([]);
  const { theme } = useTheme();
  const supabase = createClient();

  useEffect(() => {
    // Track guest page view
    import('@/lib/guest-tracking').then(({ trackGuestActivity }) => {
      trackGuestActivity('page_view', 'dashboard');
    });

    async function fetchDashboardData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: userData } = await supabase.from('users').select('*').eq('id', user.id).single();
      const fallbackName = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
      setUser(userData || { name: fallbackName, streak_count: 0 });

      const { data: interviewsData } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (interviewsData && interviewsData.length > 0) {
        setInterviews(interviewsData.slice(0, 5));
        const total = interviewsData.length;
        const avgScore = Math.round(interviewsData.reduce((acc, curr) => acc + (curr.total_score || 0), 0) / total);
        const bestScore = Math.max(...interviewsData.map(i => i.total_score || 0));
        setStats({ total, avgScore, bestScore, hours: Math.round(total * 0.75) });

        const skillLabels: Record<string, string> = {
          problem_solving: 'Problem Solving',
          communication: 'Communication',
          technical_knowledge: 'Technical Knowledge',
          code_quality: 'Code Quality',
          system_thinking: 'System Thinking',
          behavioural: 'Behavioral',
        };
        const skillTotals: Record<string, { total: number; count: number }> = {};
        Object.keys(skillLabels).forEach(k => { skillTotals[k] = { total: 0, count: 0 }; });

        interviewsData.forEach(i => {
          const s = typeof i.summary === 'string' ? (() => { try { return JSON.parse(i.summary); } catch { return null; } })() : i.summary;
          if (s?.skill_scores) {
            Object.keys(skillTotals).forEach(key => {
              if (s.skill_scores[key] !== undefined) {
                skillTotals[key].total += s.skill_scores[key];
                skillTotals[key].count += 1;
              }
            });
          }
        });

        const computed = Object.entries(skillTotals)
          .filter(([, v]) => v.count > 0)
          .map(([key, v]) => ({
            topic: skillLabels[key] || key,
            score: Math.round((v.total / v.count) * 10)
          }))
          .sort((a, b) => a.score - b.score)
          .slice(0, 3);

        if (computed.length > 0) setWeakAreas(computed);
      }

      setLoading(false);
    }
    fetchDashboardData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 md:col-span-2" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Interviews', value: stats.total, suffix: '', icon: Target, iconBg: 'bg-blue-500/20', iconColor: 'text-blue-400' },
    { label: 'Average Score', value: stats.avgScore, suffix: '%', icon: BarChart2, iconBg: 'bg-purple-500/20', iconColor: 'text-purple-400' },
    { label: 'Best Score', value: stats.bestScore, suffix: '%', icon: Trophy, iconBg: 'bg-amber-500/20', iconColor: 'text-amber-400' },
    { label: 'Hours Practiced', value: stats.hours, suffix: 'h', icon: Clock, iconBg: 'bg-emerald-500/20', iconColor: 'text-emerald-400' },
  ];

  const leaderboard = [
    { name: 'Alice', score: 950 },
    { name: 'Bob', score: 820 },
    { name: 'Charlie', score: 790 },
    { name: 'David', score: 650 },
    { name: 'Eve', score: 600 },
  ];

  return (
    <>
      {/* 3D Background — fixed behind all content, dimmed in light mode */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1, pointerEvents: 'none', opacity: theme === 'dark' ? 1 : 0.4, transition: 'opacity 0.3s ease' }}>
        <DashboardBackground />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-6"
        style={{ position: 'relative', zIndex: 1 }}
      >

      {/* CSS keyframes for all 3D effects */}
      <style jsx global>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes rotate-cta-border {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg); }
        }
        @keyframes golden-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes rotate-card-border {
          0% { filter: hue-rotate(0deg); }
          100% { filter: hue-rotate(360deg); }
        }

        /* Mobile: simple scale on hover instead of tilt */
        @media (max-width: 767px) {
          .tilt-card-mobile:hover {
            transform: scale(1.02) !important;
          }
        }
      `}</style>

      {/* ─── Greeting + CTA ─── */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div>
          <WelcomeGreeting name={user?.name} />
          <p style={{ color: 'var(--text-secondary)' }} className="mt-1 flex items-center">
            <Zap className="w-4 h-4 text-amber-500 mr-1 fill-amber-500" />
            <span className="text-amber-500 font-medium mr-2">{user?.streak_count || 0} day streak!</span> Keep it up.
          </p>
        </div>

        {/* 3D CTA Button */}
        <Link href="/setup">
          <div className="relative inline-block group">
            {/* Rotating gradient border */}
            <div className="absolute -inset-[2px] rounded-xl opacity-70 group-hover:opacity-100 transition-opacity overflow-hidden" style={{ zIndex: -1 }}>
              <div
                style={{
                  position: 'absolute',
                  inset: '-50%',
                  background: 'conic-gradient(from 0deg, #7C3AED, #06b6d4, #7C3AED)',
                  animation: 'rotate-cta-border 3s linear infinite',
                }}
              />
            </div>

            {/* Orbiting particles */}
            {[0, 1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full bg-purple-400 pointer-events-none hidden md:block"
                style={{
                  '--orbit-radius': `${50 + i * 8}px`,
                  animation: `orbit ${4 + i * 0.5}s linear infinite`,
                  animationDelay: `${i * 0.5}s`,
                  opacity: 0.5 - i * 0.05,
                } as React.CSSProperties}
              />
            ))}

            <button
              className="relative bg-primary text-white px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-all active:translate-y-1"
              style={{
                boxShadow: '0 1px 0 rgba(255,255,255,0.1) inset, 0 -4px 0 rgba(0,0,0,0.3), 0 4px 20px rgba(124,58,237,0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = '0 1px 0 rgba(255,255,255,0.1) inset, 0 -2px 0 rgba(0,0,0,0.3), 0 4px 20px rgba(124,58,237,0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0px)';
                e.currentTarget.style.boxShadow = '0 1px 0 rgba(255,255,255,0.1) inset, 0 -4px 0 rgba(0,0,0,0.3), 0 4px 20px rgba(124,58,237,0.5)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(4px)';
                e.currentTarget.style.boxShadow = '0 1px 0 rgba(255,255,255,0.1) inset, 0 0px 0 rgba(0,0,0,0.3), 0 4px 20px rgba(124,58,237,0.5)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.transform = 'translateY(2px)';
                e.currentTarget.style.boxShadow = '0 1px 0 rgba(255,255,255,0.1) inset, 0 -2px 0 rgba(0,0,0,0.3), 0 4px 20px rgba(124,58,237,0.5)';
              }}
            >
              <Play className="w-5 h-5 fill-white" />
              <span>Start New Interview</span>
            </button>
          </div>
        </Link>
      </motion.div>

      {/* ─── Stats Row — 3D Flip + Tilt + Shine ─── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
        {statCards.map((item) => (
          <TiltCard key={item.label} maxTilt={15} scale={1.04}>
            <Card className="group/stat">
              <CardContent className="p-4 flex items-center space-x-4">
                <motion.div
                  className={`p-3 rounded-lg ${item.iconBg} ${item.iconColor}`}
                  style={{ transform: 'translateZ(20px)' }}
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                >
                  <item.icon className="w-6 h-6" />
                </motion.div>
                <div style={{ transform: 'translateZ(10px)' }}>
                  <p
                    className="text-sm font-medium transition-all duration-200 group-hover/stat:-translate-y-0.5 group-hover/stat:brightness-125"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {item.label}
                  </p>
                  <h3 className="text-2xl font-bold">{item.value}{item.suffix}</h3>
                </div>
              </CardContent>
            </Card>
          </TiltCard>
        ))}
      </motion.div>

      {/* ─── Main content grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">

        {/* Recent Interviews — 3D Depth Cards */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="p-6 pb-2">
              <CardTitle>Recent Interviews</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {interviews.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: 'var(--bg-card)' }}>
                    <Target className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <h3 className="text-lg font-medium" style={{ color: 'var(--text-secondary)' }}>No interviews yet</h3>
                  <p className="mb-4 text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Start your first mock interview to see stats here.</p>
                </div>
              ) : (
                <div className="space-y-4 cursor-default mt-4">
                  {interviews.map(interview => (
                    <TiltCard
                      key={interview.id}
                      maxTilt={8}
                      scale={1.02}
                      className="tilt-card-mobile rounded-xl"
                      style={{
                        background: 'var(--bg-card)',
                        border: '0.5px solid var(--border-color)',
                        transition: 'all 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                      }}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl">
                        <div className="mb-3 sm:mb-0" style={{ transform: 'translateZ(8px)' }}>
                          <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{interview.role}</h4>
                          <div className="flex items-center space-x-3 mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                            <span className="capitalize">{interview.type}</span>
                            <span className="inline-block w-1 h-1 rounded-full" style={{ background: 'var(--text-muted)' }}></span>
                            <span>{new Date(interview.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end space-x-4">
                          <div className="text-right" style={{ transform: 'translateZ(15px)' }}>
                            <span className="text-2xl font-bold text-primary">{interview.total_score || 0}</span>
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>/100</span>
                          </div>
                          <Link href={`/results/${interview.id}`}>
                            <button className="px-4 py-2 rounded-lg text-sm font-medium transition-colors" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', color: 'var(--text-primary)' }}>
                              Review
                            </button>
                          </Link>
                        </div>
                      </div>
                    </TiltCard>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6 lg:flex lg:flex-col">
          {/* ─── Weak Areas — 3D Stacked Card Effect ─── */}
          <motion.div variants={itemVariants} className="relative">
            {/* Ghost cards behind */}
            <div
              className="absolute inset-0 rounded-2xl hidden md:block"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                transform: 'translateY(8px) translateX(8px)',
                opacity: 0.2,
                zIndex: -2,
              }}
            />
            <div
              className="absolute inset-0 rounded-2xl hidden md:block"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border-color)',
                transform: 'translateY(4px) translateX(4px)',
                opacity: 0.4,
                zIndex: -1,
              }}
            />

            <TiltCard maxTilt={10} scale={1.02} className="tilt-card-mobile relative z-10">
              <Card>
                <CardHeader className="p-6 pb-2">
                  <CardTitle>Areas to Improve</CardTitle>
                </CardHeader>
                <CardContent className="p-6 pt-4">
                  {weakAreas.length > 0 ? (
                    <div className="space-y-5">
                      {weakAreas.map((area, i) => (
                        <div
                          key={i}
                          className="transition-transform duration-200"
                          style={{ willChange: 'transform' }}
                          onMouseEnter={(e) => {
                            if (window.innerWidth >= 768) e.currentTarget.style.transform = 'translateZ(5px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateZ(0px)';
                          }}
                        >
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{area.topic}</span>
                            <span style={{ color: 'var(--text-muted)' }}>{area.score}%</span>
                          </div>
                          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${area.score}%` }}
                              transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                              className="h-full bg-red-400 rounded-full"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-center py-4" style={{ color: 'var(--text-muted)' }}>Complete interviews to see your weak areas here.</p>
                  )}
                </CardContent>
              </Card>
            </TiltCard>
          </motion.div>

          {/* ─── Leaderboard — 3D Podium Effect ─── */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="p-6 pb-2">
                <CardTitle>Top Users (Weekly)</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                <div className="space-y-3">
                  {leaderboard.map((lbUser, i) => {
                    // Podium offsets: 1st = -8px, 2nd = -4px, 3rd = 0
                    const elevation = i === 0 ? -8 : i === 1 ? -4 : 0;
                    const isTop3 = i < 3;

                    return (
                      <TiltCard
                        key={i}
                        maxTilt={isTop3 ? 5 : 0}
                        scale={1.02}
                        className="tilt-card-mobile rounded-lg"
                        style={{
                          transform: `translateY(${elevation}px)`,
                          transition: 'transform 0.15s ease',
                        }}
                      >
                        <div
                          className="flex items-center justify-between p-3 rounded-lg relative overflow-hidden"
                          style={{
                            background: 'var(--bg-card)',
                            border: '0.5px solid var(--border-color)',
                          }}
                        >
                          {/* Golden shimmer on 1st place */}
                          {i === 0 && (
                            <div
                              className="absolute inset-0 pointer-events-none hidden md:block"
                              style={{
                                background: 'linear-gradient(90deg, transparent, rgba(234,179,8,0.15), transparent)',
                                backgroundSize: '200% 100%',
                                animation: 'golden-shimmer 3s ease infinite',
                              }}
                            />
                          )}

                          <div className="flex items-center space-x-3 relative z-10">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              i === 0 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' :
                              i === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/20' :
                              i === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/20' :
                              ''
                            }`}>
                              {i + 1}
                            </span>
                            <span className="text-sm font-medium">{lbUser.name}</span>
                          </div>
                          <span className="text-sm font-bold text-primary relative z-10">{lbUser.score}</span>
                        </div>
                      </TiltCard>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
    </>
  );
}
