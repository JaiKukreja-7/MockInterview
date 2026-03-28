"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Share2, RefreshCw, Play, ChevronDown, ChevronUp, CheckCircle, XCircle, Sparkles, Lightbulb, BookOpen, Loader2, TrendingUp, TrendingDown, SkipForward } from 'lucide-react';
import Link from 'next/link';

export default function ResultsScreen() {
  const { id } = useParams() as { id: string };
  const supabase = createClient();
  const router = useRouter();
  const [interview, setInterview] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      // Fetch interview with summary
      const { data: interviewData } = await supabase.from('interviews').select('*').eq('id', id).single();
      if (interviewData) {
        setInterview(interviewData);
        if (interviewData.summary) {
          setSummary(typeof interviewData.summary === 'string' ? JSON.parse(interviewData.summary) : interviewData.summary);
        }
      }

      // Fetch questions with feedback
      const { data: questionsData } = await supabase
        .from('questions')
        .select('*')
        .eq('interview_id', id)
        .order('order_index');

      if (questionsData) {
        setQuestions(questionsData);
      }

      setLoading(false);
    }
    load();
  }, [id, supabase]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const answeredQuestions = questions.filter(q => q.user_answer !== null);
  const skippedCount = questions.length - answeredQuestions.length;
  // Compute final score only from answered questions to exclude skipped ones
  const computedTotalScore = answeredQuestions.length > 0 
    ? Math.round(answeredQuestions.reduce((acc, q) => acc + (q.score || 0), 0) / answeredQuestions.length * 10)
    : 0;

  const totalScore = summary?.total_score || computedTotalScore;
  const overallFeedback = summary?.overall_feedback || 'Summary not available yet.';

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'bg-green-500/20 text-green-400 border-green-500/30';
    if (score >= 4) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    return 'bg-red-500/20 text-red-400 border-red-500/30';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Interview Results</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Role: {interview?.role} • Type: {interview?.type}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Score Ring */}
        <Card className="flex flex-col items-center justify-center p-8 border-primary/20 shadow-[0_0_30px_rgba(124,58,237,0.1)]">
          <div className="relative w-48 h-48 flex items-center justify-center">
            <svg className="absolute w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="88" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
              <motion.circle 
                cx="96" cy="96" r="88" fill="transparent" stroke="#7C3AED" strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray="552.9"
                initial={{ strokeDashoffset: 552.9 }}
                animate={{ strokeDashoffset: 552.9 - (552.9 * totalScore / 100) }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
              />
            </svg>
            <div className="text-center">
              <span className="text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-white to-white/60">
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                  {totalScore}
                </motion.span>
              </span>
              <span className="text-xl" style={{ color: 'var(--text-muted)' }}>/100</span>
            </div>
          </div>
          <h3 className="mt-6 text-xl font-semibold flex items-center text-primary/90">
            <Trophy className="w-5 h-5 mr-2 text-amber-500" />
            {totalScore >= 80 ? 'Excellent!' : totalScore >= 60 ? 'Great Job!' : totalScore >= 40 ? 'Good Effort!' : 'Keep Practicing!'}
          </h3>
          {skippedCount > 0 && (
            <p className="mt-3 text-sm text-white/50 bg-white/5 py-1 px-3 rounded-full border border-white/10">
              {skippedCount} question{skippedCount !== 1 ? 's' : ''} skipped
            </p>
          )}
        </Card>

        {/* AI Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>AI Analysis Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-5 rounded-xl leading-relaxed font-medium" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', color: 'var(--text-secondary)' }}>
              {overallFeedback}
            </div>

            {/* Top Strength & Weakness */}
            {(summary?.top_strength || summary?.top_weakness) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {summary.top_strength && (
                  <div className="bg-green-500/5 border border-green-500/15 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-green-400" />
                      <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Top Strength</span>
                    </div>
                    <p className="text-green-300/80 text-sm">{summary.top_strength}</p>
                  </div>
                )}
                {summary.top_weakness && (
                  <div className="bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <TrendingDown className="w-4 h-4 text-red-400" />
                      <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Top Weakness</span>
                    </div>
                    <p className="text-red-300/80 text-sm">{summary.top_weakness}</p>
                  </div>
                )}
              </div>
            )}

            {/* Improvement Areas */}
            {summary?.improvement_areas?.length > 0 && (
              <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4">
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Areas to Work On</span>
                <ol className="mt-2 space-y-1.5">
                  {summary.improvement_areas.map((area: string, i: number) => (
                    <li key={i} className="text-purple-300/80 text-sm flex items-start space-x-2">
                      <span className="text-purple-400 font-bold shrink-0">{i + 1}.</span>
                      <span>{area}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-medium transition-colors" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <Share2 className="w-5 h-5" />
                <span>Share Results</span>
              </button>
              <button onClick={() => router.push(`/interview/${id}`)} className="flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl font-medium transition-colors" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', color: 'var(--text-primary)' }}>
                <RefreshCw className="w-5 h-5" />
                <span>Retake</span>
              </button>
              <Link href="/setup" className="flex-1">
                <button className="w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium transition-colors">
                  <Play className="w-5 h-5 fill-white" />
                  <span>New Setup</span>
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Question Breakdown */}
      <h2 className="text-2xl font-bold mt-12 mb-6" style={{ color: 'var(--text-primary)' }}>Detailed Breakdown</h2>
      
      <div className="space-y-4">
        {questions.map((q, i) => {
          const fb = q.ai_feedback || {};
          const score = q.score || 0;
          return (
            <Card key={q.id} className="overflow-hidden border-white/10 transition-colors hover:border-white/20">
              <div 
                className="p-4 sm:p-6 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedQ(expandedQ === i ? null : i)}
              >
                <div className="flex items-center space-x-4 max-w-[80%]">
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${score >= 7 ? 'bg-green-500/20 text-green-400' : score >= 4 ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-400'}`}>
                    {score >= 7 ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                  </div>
                  <h3 className="font-medium text-base sm:text-lg truncate flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                    <span>Q{i + 1}: {q.question_text}</span>
                    {q.user_answer === null && (
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-white/10 text-white/60 px-2 py-0.5 rounded-full border border-white/10">
                        Skipped
                      </span>
                    )}
                  </h3>
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4 shrink-0">
                  {q.user_answer !== null ? (
                    <span className={`font-bold px-2 py-0.5 rounded-lg border ${getScoreColor(score)}`}>{score}/10</span>
                  ) : (
                    <span className="font-bold px-2 py-0.5 rounded-lg border bg-white/5 text-white/40 border-white/10 shrink-0">0/10</span>
                  )}
                  <div className="p-1 bg-white/5 rounded-full">
                    {expandedQ === i ? <ChevronUp className="w-5 h-5 text-white/60" /> : <ChevronDown className="w-5 h-5 text-white/60" />}
                  </div>
                </div>
              </div>
              
              <AnimatePresence>
                {expandedQ === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-[#050508]"
                    style={{ borderTop: '1px solid var(--border-color)', background: 'var(--bg-surface)' }}
                  >
                    <div className="p-6 space-y-4">
                      {/* Your Answer */}
                      <div>
                        <span className="text-xs text-white/40 font-bold uppercase tracking-wider">Your Answer</span>
                        {q.user_answer === null ? (
                          <div className="mt-1.5 bg-white/5 p-4 rounded-lg border border-white/5 flex items-center space-x-2 text-white/40">
                            <SkipForward className="w-4 h-4" />
                            <span className="text-sm font-medium">Question was skipped</span>
                          </div>
                        ) : (
                          <p className="mt-1.5 text-white/80 leading-relaxed bg-white/5 p-4 rounded-lg border border-white/5">{q.user_answer || 'No answer provided'}</p>
                        )}
                      </div>

                      {/* Strengths */}
                      {fb.strengths?.length > 0 && (
                        <div className="bg-green-500/5 border border-green-500/15 rounded-lg p-4">
                          <h4 className="text-xs font-bold text-green-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Strengths</span>
                          </h4>
                          <ul className="space-y-1">
                            {fb.strengths.map((s: string, j: number) => (
                              <li key={j} className="text-green-300/80 text-sm">✓ {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Weaknesses */}
                      {fb.weaknesses?.length > 0 && (
                        <div className="bg-red-500/5 border border-red-500/15 rounded-lg p-4">
                          <h4 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Weaknesses</span>
                          </h4>
                          <ul className="space-y-1">
                            {fb.weaknesses.map((w: string, j: number) => (
                              <li key={j} className="text-red-300/80 text-sm">✗ {w}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Model Answer */}
                      {fb.model_answer && (
                        <div className="bg-blue-500/5 border border-blue-500/15 rounded-lg p-4">
                          <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Model Answer</span>
                          </h4>
                          <p className="text-blue-200/80 text-sm leading-relaxed">{fb.model_answer}</p>
                        </div>
                      )}

                      {/* Tips */}
                      {fb.tips?.length > 0 && (
                        <div className="bg-purple-500/5 border border-purple-500/15 rounded-lg p-4">
                          <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                            <Lightbulb className="w-3.5 h-3.5" />
                            <span>Tips</span>
                          </h4>
                          <ul className="space-y-1">
                            {fb.tips.map((t: string, j: number) => (
                              <li key={j} className="text-purple-300/80 text-sm">💡 {t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
      
    </div>
  );
}
