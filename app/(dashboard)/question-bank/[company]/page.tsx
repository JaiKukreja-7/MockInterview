"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { getCompanyById, type CompanyInfo } from '@/lib/companies';
import { fetchQuestions, getUserBookmarks, getUserUpvotes, getAttemptedQuestionIds, toggleBookmark, toggleUpvote, type CompanyQuestion, type QuestionFilters } from '@/lib/question-bank';
import QuestionCard from '@/components/question-bank/QuestionCard';
import QuestionSkeleton from '@/components/question-bank/QuestionSkeleton';
import QuestionDetailModal from '@/components/question-bank/QuestionDetailModal';
import { ArrowLeft, Play, Lightbulb, BarChart2, Target, Hash } from 'lucide-react';
import Link from 'next/link';

export default function CompanyPage() {
  const { company: companySlug } = useParams() as { company: string };
  const [company, setCompany] = useState<CompanyInfo | null>(null);
  const [questions, setQuestions] = useState<CompanyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);
  const [attemptedIds, setAttemptedIds] = useState<string[]>([]);
  const [attemptScores, setAttemptScores] = useState<Record<string, number>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<CompanyQuestion | null>(null);
  const [filters, setFilters] = useState<QuestionFilters>({ page: 1, pageSize: 50, sortBy: 'recent' });
  const supabase = createClient();

  useEffect(() => {
    const c = getCompanyById(companySlug);
    setCompany(c || null);
    if (c) loadData(c.name);
  }, [companySlug]);

  const loadData = async (companyName: string) => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const [bookmarks, upvotes, attempted] = await Promise.all([
        getUserBookmarks(user.id), getUserUpvotes(user.id), getAttemptedQuestionIds(user.id)
      ]);
      setBookmarkedIds(bookmarks.data); setUpvotedIds(upvotes.data); setAttemptedIds(attempted.data);
      const { data: attempts } = await supabase.from('user_question_attempts').select('question_id, ai_score').eq('user_id', user.id);
      if (attempts) {
        const scores: Record<string, number> = {};
        attempts.forEach(a => { if (!scores[a.question_id] || a.ai_score > scores[a.question_id]) scores[a.question_id] = a.ai_score; });
        setAttemptScores(scores);
      }
    }
    const { data } = await fetchQuestions({ ...filters, companies: [companyName] });
    setQuestions(data || []);
    setLoading(false);
  };

  const handleBookmark = async (qId: string) => {
    if (!userId) return;
    const isB = bookmarkedIds.includes(qId);
    setBookmarkedIds(prev => isB ? prev.filter(id => id !== qId) : [...prev, qId]);
    await toggleBookmark(userId, qId, isB);
  };

  const handleUpvote = async (qId: string) => {
    if (!userId) return;
    const isU = upvotedIds.includes(qId);
    setUpvotedIds(prev => isU ? prev.filter(id => id !== qId) : [...prev, qId]);
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, upvotes: q.upvotes + (isU ? -1 : 1) } : q));
    await toggleUpvote(userId, qId, isU);
  };

  if (!company) {
    return (
      <div className="text-center py-20">
        <p className="text-white/50 text-lg">Company not found</p>
        <Link href="/question-bank" className="text-primary text-sm mt-3 inline-block">← Back to Question Bank</Link>
      </div>
    );
  }

  // Compute stats
  const avgDifficulty = questions.length > 0
    ? (() => { const d = { Easy: 0, Medium: 0, Hard: 0 }; questions.forEach(q => d[q.difficulty as keyof typeof d]++); return Object.entries(d).sort((a, b) => b[1] - a[1])[0][0]; })()
    : 'N/A';
  const topTopics = questions.length > 0
    ? (() => { const t: Record<string, number> = {}; questions.forEach(q => { t[q.topic] = (t[q.topic] || 0) + 1; }); return Object.entries(t).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name]) => name); })()
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-4 sm:py-6">
      {/* Back button */}
      <Link href="/question-bank" className="flex items-center space-x-2 text-white/50 hover:text-white text-sm transition-colors w-fit">
        <ArrowLeft className="w-4 h-4" /><span>Back to Question Bank</span>
      </Link>

      {/* Company Header */}
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="flex items-start space-x-4">
          <img src={company.logo} alt={company.name} className="w-12 h-12 rounded-xl object-contain bg-white/10 p-2"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${company.name}&size=48&background=7C3AED&color=fff`; }} />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{company.name}</h1>
            <p className="text-sm text-white/60 mt-2 leading-relaxed">{company.description}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <Hash className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{questions.length}</p>
            <p className="text-[11px] text-white/40">Total Questions</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <BarChart2 className="w-4 h-4 text-amber-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white">{avgDifficulty}</p>
            <p className="text-[11px] text-white/40">Avg Difficulty</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
            <Target className="w-4 h-4 text-green-400 mx-auto mb-1" />
            <p className="text-lg font-bold text-white truncate">{topTopics[0] || 'N/A'}</p>
            <p className="text-[11px] text-white/40">Top Topic</p>
          </div>
        </div>

        {/* Start Company Interview */}
        <Link href="/setup" className="mt-6 w-full flex items-center justify-center space-x-2 bg-primary hover:bg-primary/90 text-white py-3 rounded-xl font-medium transition-all active:scale-[0.98] shadow-lg shadow-primary/25">
          <Play className="w-5 h-5 fill-white" />
          <span>Start a {company.name} Interview</span>
        </Link>
      </motion.div>

      {/* Interview Tips */}
      {company.interviewTips.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Interview Tips for {company.name}</h2>
          </div>
          <ul className="space-y-3">
            {company.interviewTips.map((tip, i) => (
              <li key={i} className="flex items-start space-x-3 text-sm text-white/70">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* Questions */}
      <h2 className="text-xl font-bold text-white">Questions ({questions.length})</h2>
      {loading ? (
        <QuestionSkeleton count={5} />
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="space-y-3">
            {questions.map((q, i) => (
              <QuestionCard key={q.id} question={q}
                isBookmarked={bookmarkedIds.includes(q.id)} isUpvoted={upvotedIds.includes(q.id)}
                isAttempted={attemptedIds.includes(q.id)} attemptScore={attemptScores[q.id]}
                onBookmark={() => handleBookmark(q.id)} onUpvote={() => handleUpvote(q.id)}
                onPractice={() => setSelectedQuestion(q)} index={i} />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedQuestion && (
          <QuestionDetailModal question={selectedQuestion} onClose={() => { setSelectedQuestion(null); if (company) loadData(company.name); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
