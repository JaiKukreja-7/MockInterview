"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export default function AnalyticsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [typeAvgData, setTypeAvgData] = useState<any[]>([]);
  const [skillsData, setSkillsData] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: interviews } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (!interviews || interviews.length === 0) {
        setLoading(false);
        return;
      }

      // ---- Line Chart: Score Trend ----
      const trend = interviews.map(i => ({
        date: new Date(i.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        score: i.total_score || 0
      }));
      setTrendData(trend);

      // ---- Bar Chart: Average by Type ----
      const typeMap: Record<string, { total: number; count: number }> = {};
      interviews.forEach(i => {
        if (!typeMap[i.type]) typeMap[i.type] = { total: 0, count: 0 };
        typeMap[i.type].total += (i.total_score || 0);
        typeMap[i.type].count += 1;
      });
      const typeAvg = Object.entries(typeMap).map(([name, v]) => ({
        name,
        avg: Math.round(v.total / v.count)
      }));
      setTypeAvgData(typeAvg);

      // ---- Radar Chart: Average Skill Scores ----
      const skillTotals: Record<string, { total: number; count: number }> = {
        problem_solving: { total: 0, count: 0 },
        communication: { total: 0, count: 0 },
        technical_knowledge: { total: 0, count: 0 },
        code_quality: { total: 0, count: 0 },
        system_thinking: { total: 0, count: 0 },
        behavioural: { total: 0, count: 0 },
      };

      interviews.forEach(i => {
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

      const skillLabels: Record<string, string> = {
        problem_solving: 'Problem Solving',
        communication: 'Communication',
        technical_knowledge: 'Tech Knowledge',
        code_quality: 'Code Quality',
        system_thinking: 'System Thinking',
        behavioural: 'Behavioral',
      };

      const skills = Object.entries(skillTotals).map(([key, v]) => ({
        subject: skillLabels[key] || key,
        A: v.count > 0 ? Math.round((v.total / v.count) * 10) : 50,
        fullMark: 100
      }));
      setSkillsData(skills);

      // ---- Heatmap: interviews per day (last 365 days) ----
      const dayMap: Record<string, number> = {};
      interviews.forEach(i => {
        const day = new Date(i.created_at).toISOString().split('T')[0];
        dayMap[day] = (dayMap[day] || 0) + 1;
      });

      const days = [];
      const now = new Date();
      for (let d = 364; d >= 0; d--) {
        const date = new Date(now);
        date.setDate(date.getDate() - d);
        const key = date.toISOString().split('T')[0];
        days.push({ date: key, count: dayMap[key] || 0 });
      }
      setHeatmapData(days);

      setLoading(false);
    }
    fetchAnalytics();
  }, [supabase]);

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-white/5 border-white/5';
    if (count === 1) return 'bg-primary/30 border-primary/15';
    if (count === 2) return 'bg-primary/60 border-primary/25';
    return 'bg-primary border-primary/20 shadow-[0_0_10px_rgba(124,58,237,0.3)]';
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 py-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[350px] lg:col-span-2" />
          <Skeleton className="h-[350px]" />
          <Skeleton className="h-[350px]" />
        </div>
      </div>
    );
  }

  const hasData = trendData.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8 py-4 sm:py-8">
      <div>
        <h1 className="text-3xl font-bold">Performance Analytics</h1>
        <p className="text-white/60 mt-1">Deep dive into your interview metrics and skill progression.</p>
      </div>

      {!hasData ? (
        <Card className="p-12 text-center">
          <p className="text-white/50 text-lg">Complete your first interview to see analytics here!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Trend Line Chart */}
          <Card className="col-span-1 lg:col-span-2">
            <CardHeader>
              <CardTitle>Score Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#13131A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} 
                    itemStyle={{ color: '#7C3AED', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#7C3AED" strokeWidth={3} dot={{ r: 4, fill: '#7C3AED', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, fill: '#0A0A0F', stroke: '#7C3AED', strokeWidth: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Skill Radar */}
          <Card>
            <CardHeader>
              <CardTitle>Skill Analysis</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
                  <PolarGrid stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Score" dataKey="A" stroke="#7C3AED" fill="#7C3AED" fillOpacity={0.4} />
                  <RechartsTooltip contentStyle={{ backgroundColor: '#13131A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Type Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Average Score by Type</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={typeAvgData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: '#13131A', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }} 
                  />
                  <Bar dataKey="avg" fill="#06b6d4" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Heatmap Activity */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Activity Heatmap (Last 365 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-[3px] p-2 justify-center">
                {heatmapData.map((d, i) => (
                  <div 
                    key={i} 
                    title={`${d.date}: ${d.count} interview${d.count !== 1 ? 's' : ''}`}
                    className={`w-3 h-3 rounded-sm transition-all border outline outline-1 outline-transparent hover:outline-white/40 cursor-pointer ${getHeatmapColor(d.count)}`}
                  />
                ))}
              </div>
              <div className="mt-4 flex items-center justify-end space-x-2 text-xs text-white/40">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-white/5"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/30"></div>
                <div className="w-3 h-3 rounded-sm bg-primary/60"></div>
                <div className="w-3 h-3 rounded-sm bg-primary"></div>
                <span>More</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
