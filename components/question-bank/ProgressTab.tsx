"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { COMPANIES } from '@/lib/companies';
import { TrendingDown, Flame, BarChart2 } from 'lucide-react';

export default function ProgressTab() {
  const [loading, setLoading] = useState(true);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [attemptedCount, setAttemptedCount] = useState(0);
  const [companyBreakdown, setCompanyBreakdown] = useState<{ name: string; attempted: number; total: number }[]>([]);
  const [topicBreakdown, setTopicBreakdown] = useState<{ name: string; attempted: number; total: number }[]>([]);
  const [difficultyAccuracy, setDifficultyAccuracy] = useState<{ difficulty: string; accuracy: number }[]>([]);
  const [weakestTopics, setWeakestTopics] = useState<{ topic: string; avgScore: number }[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    async function loadProgress() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Total questions
      const { count: total } = await supabase.from('company_questions').select('*', { count: 'exact', head: true });
      setTotalQuestions(total || 0);

      // Company counts
      const { data: questions } = await supabase.from('company_questions').select('id, company, topic, difficulty');

      // User attempts
      const { data: attempts } = await supabase.from('user_question_attempts').select('question_id, ai_score, created_at').eq('user_id', user.id);

      const attemptedIds = new Set(attempts?.map(a => a.question_id) || []);
      setAttemptedCount(attemptedIds.size);

      if (questions) {
        // Company breakdown
        const compMap: Record<string, { attempted: number; total: number }> = {};
        questions.forEach(q => {
          if (!compMap[q.company]) compMap[q.company] = { attempted: 0, total: 0 };
          compMap[q.company].total++;
          if (attemptedIds.has(q.id)) compMap[q.company].attempted++;
        });
        setCompanyBreakdown(
          COMPANIES.map(c => ({ name: c.name, attempted: compMap[c.name]?.attempted || 0, total: compMap[c.name]?.total || 0 }))
            .filter(c => c.total > 0)
        );

        // Topic breakdown
        const topicMap: Record<string, { attempted: number; total: number }> = {};
        questions.forEach(q => {
          if (!topicMap[q.topic]) topicMap[q.topic] = { attempted: 0, total: 0 };
          topicMap[q.topic].total++;
          if (attemptedIds.has(q.id)) topicMap[q.topic].attempted++;
        });
        setTopicBreakdown(
          Object.entries(topicMap).map(([name, v]) => ({ name, ...v })).sort((a, b) => b.total - a.total).slice(0, 10)
        );

        // Difficulty accuracy
        const diffMap: Record<string, { totalScore: number; count: number }> = {};
        if (attempts) {
          const qMap = new Map(questions.map(q => [q.id, q]));
          attempts.forEach(a => {
            const q = qMap.get(a.question_id);
            if (q) {
              if (!diffMap[q.difficulty]) diffMap[q.difficulty] = { totalScore: 0, count: 0 };
              diffMap[q.difficulty].totalScore += (a.ai_score || 0);
              diffMap[q.difficulty].count++;
            }
          });
        }
        setDifficultyAccuracy(
          ['Easy', 'Medium', 'Hard'].map(d => ({
            difficulty: d,
            accuracy: diffMap[d] ? Math.round((diffMap[d].totalScore / diffMap[d].count / 10) * 100) : 0
          }))
        );

        // Weakest topics
        const topicScores: Record<string, { total: number; count: number }> = {};
        if (attempts) {
          const qMap = new Map(questions.map(q => [q.id, q]));
          attempts.forEach(a => {
            const q = qMap.get(a.question_id);
            if (q) {
              if (!topicScores[q.topic]) topicScores[q.topic] = { total: 0, count: 0 };
              topicScores[q.topic].total += (a.ai_score || 0);
              topicScores[q.topic].count++;
            }
          });
        }
        setWeakestTopics(
          Object.entries(topicScores)
            .map(([topic, v]) => ({ topic, avgScore: Math.round((v.total / v.count / 10) * 100) }))
            .sort((a, b) => a.avgScore - b.avgScore)
            .slice(0, 3)
        );
      }

      // Streak calculation
      if (attempts && attempts.length > 0) {
        const dates = [...new Set(attempts.map(a => new Date(a.created_at).toISOString().split('T')[0]))].sort().reverse();
        let s = 0;
        const today = new Date().toISOString().split('T')[0];
        let checkDate = today;
        for (const d of dates) {
          if (d === checkDate) {
            s++;
            const prev = new Date(checkDate);
            prev.setDate(prev.getDate() - 1);
            checkDate = prev.toISOString().split('T')[0];
          } else if (d < checkDate) {
            break;
          }
        }
        setStreak(s);
      }

      setLoading(false);
    }
    loadProgress();
  }, []);

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse" />)}</div>;
  }

  const overallPercent = totalQuestions > 0 ? Math.round((attemptedCount / totalQuestions) * 100) : 0;

  const diffColors: Record<string, string> = { Easy: 'bg-green-400', Medium: 'bg-amber-400', Hard: 'bg-red-400' };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Overall Progress */}
      <div className="glass rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">Overall Progress</h3>
            <p className="text-sm text-white/50">{attemptedCount} of {totalQuestions} questions attempted</p>
          </div>
          {streak > 0 && (
            <div className="flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 px-3 py-1.5 rounded-full border border-amber-500/20">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span className="text-sm font-bold">{streak} day streak</span>
            </div>
          )}
        </div>
        <div className="h-4 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallPercent}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full bg-gradient-to-r from-primary to-cyan-500 rounded-full"
          />
        </div>
        <p className="text-right text-sm text-white/60 mt-1 font-medium">{overallPercent}%</p>
      </div>

      {/* Difficulty Accuracy */}
      <div className="glass rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart2 className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-white">Accuracy by Difficulty</h3>
        </div>
        <div className="space-y-4">
          {difficultyAccuracy.map(d => (
            <div key={d.difficulty}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-white/70 font-medium">{d.difficulty}</span>
                <span className="text-white/50">{d.accuracy}%</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${d.accuracy}%` }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className={`h-full rounded-full ${diffColors[d.difficulty] || 'bg-primary'}`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Company Breakdown */}
      <div className="glass rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-4">By Company</h3>
        <div className="space-y-3">
          {companyBreakdown.map(c => (
            <div key={c.name}>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-white/70">{c.name}</span>
                <span className="text-white/50">{c.attempted}/{c.total}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-primary/80 rounded-full transition-all" style={{ width: `${c.total > 0 ? (c.attempted / c.total) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weakest Topics */}
      {weakestTopics.length > 0 && (
        <div className="glass rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingDown className="w-5 h-5 text-red-400" />
            <h3 className="text-lg font-bold text-white">Weakest Topics</h3>
          </div>
          <div className="space-y-3">
            {weakestTopics.map((t, i) => (
              <div key={t.topic} className="flex items-center space-x-3 p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                <span className="text-sm text-white/70 flex-1">{t.topic}</span>
                <span className="text-sm font-bold text-red-400">{t.avgScore}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic Breakdown */}
      <div className="glass rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h3 className="text-lg font-bold text-white mb-4">By Topic</h3>
        <div className="space-y-2.5">
          {topicBreakdown.map(t => (
            <div key={t.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/60">{t.name}</span>
                <span className="text-white/40">{t.attempted}/{t.total}</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500/70 rounded-full" style={{ width: `${t.total > 0 ? (t.attempted / t.total) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
