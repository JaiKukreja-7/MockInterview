"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';
import { Trophy, Clock, Target, Play, BarChart2, Zap } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({ total: 0, avgScore: 0, bestScore: 0, hours: 0 });
  const [interviews, setInterviews] = useState<any[]>([]);
  const [weakAreas, setWeakAreas] = useState<{ topic: string; score: number }[]>([]);
  const supabase = createClient();

  useEffect(() => {
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

        // Compute weak areas from interview summaries' skill_scores
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
            score: Math.round((v.total / v.count) * 10) // scale 0-10 → 0-100
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

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      {/* Greeting */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'} 👋</h1>
          <p className="text-white/60 mt-1 flex items-center">
            <Zap className="w-4 h-4 text-amber-500 mr-1 fill-amber-500" />
            <span className="text-amber-500 font-medium mr-2">{user?.streak_count || 0} day streak!</span> Keep it up.
          </p>
        </div>
        <Link href="/setup">
          <button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-medium transition-all active:scale-[0.98] shadow-lg shadow-primary/25 flex items-center space-x-2">
            <Play className="w-5 h-5 fill-white" />
            <span>Start New Interview</span>
          </button>
        </Link>
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-blue-500/20 rounded-lg text-blue-400"><Target className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-white/60 font-medium">Total Interviews</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400"><BarChart2 className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-white/60 font-medium">Average Score</p>
              <h3 className="text-2xl font-bold">{stats.avgScore}%</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-amber-500/20 rounded-lg text-amber-400"><Trophy className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-white/60 font-medium">Best Score</p>
              <h3 className="text-2xl font-bold">{stats.bestScore}%</h3>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/20 rounded-lg text-emerald-400"><Clock className="w-6 h-6" /></div>
            <div>
              <p className="text-sm text-white/60 font-medium">Hours Practiced</p>
              <h3 className="text-2xl font-bold">{stats.hours}h</h3>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Interviews */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader className="p-6 pb-2">
              <CardTitle>Recent Interviews</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              {interviews.length === 0 ? (
                 <div className="text-center py-10">
                   <div className="w-16 h-16 rounded-full bg-white/5 mx-auto flex items-center justify-center mb-4">
                     <Target className="w-8 h-8 text-white/20" />
                   </div>
                   <h3 className="text-lg font-medium text-white/80">No interviews yet</h3>
                   <p className="text-white/40 mb-4 text-sm mt-1">Start your first mock interview to see stats here.</p>
                 </div>
              ) : (
                <div className="space-y-4 cursor-default mt-4">
                  {interviews.map(interview => (
                    <div key={interview.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="mb-3 sm:mb-0">
                        <h4 className="font-medium text-white">{interview.role}</h4>
                        <div className="flex items-center space-x-3 mt-1 text-sm text-white/50">
                          <span className="capitalize">{interview.type}</span>
                          <span className="inline-block w-1 h-1 rounded-full bg-white/20"></span>
                          <span>{new Date(interview.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end space-x-4">
                        <div className="text-right">
                          <span className="text-2xl font-bold text-primary">{interview.total_score || 0}</span>
                          <span className="text-white/40 text-sm">/100</span>
                        </div>
                        <Link href={`/results/${interview.id}`}>
                          <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                            Review
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <div className="space-y-6 lg:flex lg:flex-col">
          {/* Weak Areas */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="p-6 pb-2">
                <CardTitle>Areas to Improve</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                {weakAreas.length > 0 ? (
                <div className="space-y-5">
                  {weakAreas.map((area, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-white/80 font-medium">{area.topic}</span>
                        <span className="text-white/50">{area.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
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
                  <p className="text-white/40 text-sm text-center py-4">Complete interviews to see your weak areas here.</p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Leaderboard */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader className="p-6 pb-2">
                <CardTitle>Top Users (Weekly)</CardTitle>
              </CardHeader>
              <CardContent className="p-6 pt-4">
                <div className="space-y-3">
                  {[
                    { name: 'Alice', score: 950 },
                    { name: 'Bob', score: 820 },
                    { name: 'Charlie', score: 790 },
                    { name: 'David', score: 650 },
                    { name: 'Eve', score: 600 }
                  ].map((user, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center space-x-3">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          i === 0 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' :
                          i === 1 ? 'bg-slate-300/20 text-slate-300 border border-slate-300/20' :
                          i === 2 ? 'bg-amber-700/20 text-amber-600 border border-amber-700/20' :
                          'bg-white/5 text-white/40'
                        }`}>
                          {i + 1}
                        </span>
                        <span className="text-sm font-medium">{user.name}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{user.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
