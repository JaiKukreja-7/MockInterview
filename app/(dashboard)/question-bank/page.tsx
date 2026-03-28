"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/utils/supabase/client';
import { fetchQuestions, getUserBookmarks, getUserUpvotes, getAttemptedQuestionIds, getUserQuestionStats, toggleBookmark, toggleUpvote, type CompanyQuestion, type QuestionFilters, type UserQuestionStats } from '@/lib/question-bank';
import StatsBar from '@/components/question-bank/StatsBar';
import FilterSidebar from '@/components/question-bank/FilterSidebar';
import QuestionCard from '@/components/question-bank/QuestionCard';
import QuestionSkeleton from '@/components/question-bank/QuestionSkeleton';
import RecommendedSection from '@/components/question-bank/RecommendedSection';
import ProgressTab from '@/components/question-bank/ProgressTab';
import QuestionDetailModal from '@/components/question-bank/QuestionDetailModal';
import { SortAsc, SortDesc, LayoutList, Search } from 'lucide-react';

export default function QuestionBankPage() {
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<CompanyQuestion[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState<QuestionFilters>({ page: 1, pageSize: 20, sortBy: 'recent' });
  const [stats, setStats] = useState<UserQuestionStats>({ totalQuestions: 0, attempted: 0, bookmarked: 0, accuracy: 0 });
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [upvotedIds, setUpvotedIds] = useState<string[]>([]);
  const [attemptedIds, setAttemptedIds] = useState<string[]>([]);
  const [attemptScores, setAttemptScores] = useState<Record<string, number>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<CompanyQuestion | null>(null);
  const [recommended, setRecommended] = useState<CompanyQuestion[]>([]);
  const [activeView, setActiveView] = useState<'questions' | 'progress'>('questions');
  const [retrying, setRetrying] = useState(false);

  const supabase = createClient();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load questions when filters change
  useEffect(() => {
    if (!loading) loadQuestions();
  }, [filters]);

  const loadInitialData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const [bookmarks, upvotes, attempted, userStats] = await Promise.all([
          getUserBookmarks(user.id),
          getUserUpvotes(user.id),
          getAttemptedQuestionIds(user.id),
          getUserQuestionStats(user.id),
        ]);
        setBookmarkedIds(bookmarks.data);
        setUpvotedIds(upvotes.data);
        setAttemptedIds(attempted.data);
        setStats(userStats);

        // Load attempt scores
        const { data: attempts } = await supabase.from('user_question_attempts').select('question_id, ai_score').eq('user_id', user.id);
        if (attempts) {
          const scores: Record<string, number> = {};
          attempts.forEach(a => {
            if (!scores[a.question_id] || a.ai_score > scores[a.question_id]) {
              scores[a.question_id] = a.ai_score;
            }
          });
          setAttemptScores(scores);
        }
      }

      await loadQuestions();

      // Load recommendations
      const { data: recData } = await fetchQuestions({ frequencies: ['Very Common'], pageSize: 8, sortBy: 'upvotes' });
      if (recData) setRecommended(recData);
    } catch (err) {
      console.error('Failed to load question bank:', err);
      if (!retrying) {
        setRetrying(true);
        setTimeout(loadInitialData, 2000);
      }
    }
  };

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data, count, error } = await fetchQuestions(filters);
      if (error) throw error;
      setQuestions(data || []);
      setTotalCount(count || 0);
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter by status (client-side post-filter)
  const filteredQuestions = questions.filter(q => {
    if (!filters.status || filters.status === 'all') return true;
    if (filters.status === 'attempted') return attemptedIds.includes(q.id);
    if (filters.status === 'unattempted') return !attemptedIds.includes(q.id);
    if (filters.status === 'bookmarked') return bookmarkedIds.includes(q.id);
    return true;
  });

  const handleBookmark = useCallback(async (questionId: string) => {
    if (!userId) return;
    const isBookmarked = bookmarkedIds.includes(questionId);
    // Optimistic update
    setBookmarkedIds(prev => isBookmarked ? prev.filter(id => id !== questionId) : [...prev, questionId]);
    setStats(prev => ({ ...prev, bookmarked: prev.bookmarked + (isBookmarked ? -1 : 1) }));
    const { success } = await toggleBookmark(userId, questionId, isBookmarked);
    if (!success) {
      // Revert
      setBookmarkedIds(prev => isBookmarked ? [...prev, questionId] : prev.filter(id => id !== questionId));
      setStats(prev => ({ ...prev, bookmarked: prev.bookmarked + (isBookmarked ? 1 : -1) }));
    }
  }, [userId, bookmarkedIds]);

  const handleUpvote = useCallback(async (questionId: string) => {
    if (!userId) return;
    const isUpvoted = upvotedIds.includes(questionId);
    // Optimistic update
    setUpvotedIds(prev => isUpvoted ? prev.filter(id => id !== questionId) : [...prev, questionId]);
    setQuestions(prev => prev.map(q =>
      q.id === questionId ? { ...q, upvotes: q.upvotes + (isUpvoted ? -1 : 1) } : q
    ));
    const { success } = await toggleUpvote(userId, questionId, isUpvoted);
    if (!success) {
      setUpvotedIds(prev => isUpvoted ? [...prev, questionId] : prev.filter(id => id !== questionId));
      setQuestions(prev => prev.map(q =>
        q.id === questionId ? { ...q, upvotes: q.upvotes + (isUpvoted ? 1 : -1) } : q
      ));
    }
  }, [userId, upvotedIds]);

  const handleModalClose = () => {
    setSelectedQuestion(null);
    // Refresh data after practice
    loadInitialData();
  };

  const sortOptions = [
    { value: 'recent', label: 'Most Recent' },
    { value: 'upvotes', label: 'Most Upvoted' },
    { value: 'difficulty_asc', label: 'Easy First' },
    { value: 'difficulty_desc', label: 'Hard First' },
  ];

  return (
    <div className="max-w-[1400px] mx-auto space-y-6 py-4 sm:py-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Question Bank</h1>
        <p className="mt-1" style={{ color: 'var(--text-muted)' }}>Practice real interview questions from top tech companies.</p>
      </motion.div>

      {/* Stats Bar */}
      <StatsBar stats={stats} />

      {/* Tabs: Questions / Progress */}
      <div className="flex space-x-1 rounded-xl p-1 w-fit" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)' }}>
        <button onClick={() => setActiveView('questions')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeView === 'questions' ? 'bg-primary text-white' : ''}`}
          style={activeView !== 'questions' ? { color: 'var(--text-muted)' } : undefined}>
          All Questions
        </button>
        <button onClick={() => setActiveView('progress')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeView === 'progress' ? 'bg-primary text-white' : ''}`}
          style={activeView !== 'progress' ? { color: 'var(--text-muted)' } : undefined}>
          My Progress
        </button>
      </div>

      {activeView === 'progress' ? (
        <ProgressTab />
      ) : (
        <>
          {/* Recommended */}
          {recommended.length > 0 && (
            <RecommendedSection questions={recommended} onPractice={setSelectedQuestion} />
          )}

          {/* Main Layout: Filters + Questions */}
          <div className="flex gap-6 items-start">
            <FilterSidebar
              filters={filters}
              onFiltersChange={setFilters}
              filteredCount={filteredQuestions.length}
              totalCount={totalCount}
            />

            <div className="flex-1 min-w-0">
              {/* Sort + Mobile filter */}
              <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
                <div className="lg:hidden">
                  <FilterSidebar filters={filters} onFiltersChange={setFilters} filteredCount={filteredQuestions.length} totalCount={totalCount} />
                </div>
                <div className="flex items-center space-x-2 ml-auto">
                  <select
                    value={filters.sortBy || 'recent'}
                    onChange={e => setFilters({ ...filters, sortBy: e.target.value as any })}
                    className="bg-surface border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}
                  >
                    {sortOptions.map(o => <option key={o.value} value={o.value} className="bg-surface">{o.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Question List */}
              {loading ? (
                <QuestionSkeleton count={5} />
              ) : filteredQuestions.length === 0 ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-16 glass rounded-2xl" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)' }}>
                  <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: 'var(--bg-surface)' }}>
                    <Search className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>No questions match your filters</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>Try adjusting your filters or search query.</p>
                  <button onClick={() => setFilters({ page: 1, pageSize: 20, sortBy: 'recent' })}
                    className="text-sm text-primary font-medium hover:text-primary/80 transition-colors">
                    Clear all filters
                  </button>
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  <div className="space-y-3">
                    {filteredQuestions.map((q, i) => (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        isBookmarked={bookmarkedIds.includes(q.id)}
                        isUpvoted={upvotedIds.includes(q.id)}
                        isAttempted={attemptedIds.includes(q.id)}
                        attemptScore={attemptScores[q.id]}
                        onBookmark={() => handleBookmark(q.id)}
                        onUpvote={() => handleUpvote(q.id)}
                        onPractice={() => setSelectedQuestion(q)}
                        index={i}
                      />
                    ))}
                  </div>
                </AnimatePresence>
              )}

              {/* Pagination */}
              {totalCount > (filters.pageSize || 20) && (
                <div className="flex items-center justify-center space-x-3 mt-8">
                  <button
                    onClick={() => setFilters({ ...filters, page: Math.max(1, (filters.page || 1) - 1) })}
                    disabled={(filters.page || 1) <= 1}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-white/50">
                    Page {filters.page || 1} of {Math.ceil(totalCount / (filters.pageSize || 20))}
                  </span>
                  <button
                    onClick={() => setFilters({ ...filters, page: (filters.page || 1) + 1 })}
                    disabled={(filters.page || 1) >= Math.ceil(totalCount / (filters.pageSize || 20))}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60 hover:bg-white/10 disabled:opacity-30 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Question Detail Modal */}
      <AnimatePresence>
        {selectedQuestion && (
          <QuestionDetailModal question={selectedQuestion} onClose={handleModalClose} />
        )}
      </AnimatePresence>
    </div>
  );
}
