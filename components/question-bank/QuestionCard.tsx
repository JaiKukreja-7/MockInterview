"use client";

import { motion } from 'framer-motion';
import { Bookmark, ChevronUp, CheckCircle, Clock, Flame, ArrowRight } from 'lucide-react';
import type { CompanyQuestion } from '@/lib/question-bank';

interface QuestionCardProps {
  question: CompanyQuestion;
  isBookmarked: boolean;
  isUpvoted: boolean;
  isAttempted: boolean;
  attemptScore?: number;
  onBookmark: () => void;
  onUpvote: () => void;
  onPractice: () => void;
  index?: number;
}

export default function QuestionCard({
  question, isBookmarked, isUpvoted, isAttempted, attemptScore,
  onBookmark, onUpvote, onPractice, index = 0
}: QuestionCardProps) {
  const difficultyColor = question.difficulty === 'Easy'
    ? 'bg-green-500/10 text-green-400 border-green-500/20'
    : question.difficulty === 'Medium'
    ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    : 'bg-red-500/10 text-red-400 border-red-500/20';

  const freqIcon = question.frequency === 'Very Common' ? '🔥' : question.frequency === 'Common' ? '📊' : '💎';

  const leftBorderColor = isAttempted
    ? 'border-l-green-500'
    : isBookmarked
    ? 'border-l-primary'
    : 'border-l-transparent';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      className={`group rounded-2xl p-5 transition-all cursor-pointer border-l-[3px] ${leftBorderColor}`}
      style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', transition: 'var(--transition)' }}
      onClick={onPractice}
    >
      {/* Top row: company + difficulty + category + topic */}
      <div className="flex items-center flex-wrap gap-2 mb-3">
        <div className="flex items-center space-x-2">
          <img
            src={question.company_logo_url}
            alt={question.company}
            className="w-6 h-6 rounded-md object-contain bg-white/10 p-0.5"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${question.company}&size=24&background=7C3AED&color=fff`; }}
          />
          <span className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{question.company}</span>
        </div>
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${difficultyColor}`}>
          {question.difficulty}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
          {question.category}
        </span>
        <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          {question.topic}
        </span>
      </div>

      {/* Question text */}
      <p className="font-medium leading-relaxed line-clamp-2 mb-3  transition-colors" style={{ color: 'var(--text-primary)' }}>
        {question.question_text}
      </p>

      {/* Bottom row: frequency + last seen + upvotes + bookmark + status + practice */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-3 text-xs" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center space-x-1">
            <span>{freqIcon}</span>
            <span>{question.frequency}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{question.last_seen}</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Upvote */}
          <button
            onClick={(e) => { e.stopPropagation(); onUpvote(); }}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs transition-all ${
              isUpvoted
                ? 'bg-primary/20 text-primary border border-primary/30'
                : ''
            }`}
            style={!isUpvoted ? { background: 'var(--bg-card)', color: 'var(--text-muted)' } : undefined}
          >
            <ChevronUp className="w-3.5 h-3.5" />
            <motion.span
              key={question.upvotes}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="font-medium"
            >
              {question.upvotes}
            </motion.span>
          </button>

          {/* Bookmark */}
          <motion.button
            onClick={(e) => { e.stopPropagation(); onBookmark(); }}
            whileTap={{ scale: 1.3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className={`p-1.5 rounded-lg transition-all ${
              isBookmarked
                ? 'text-primary bg-primary/20'
                : ''
            }`}
            style={!isBookmarked ? { color: 'var(--text-muted)', background: 'var(--bg-card)' } : undefined}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-primary' : ''}`} />
          </motion.button>

          {/* Attempt status */}
          {isAttempted ? (
            <span className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-green-500/10 text-green-400 text-xs border border-green-500/20">
              <CheckCircle className="w-3.5 h-3.5" />
              {attemptScore !== undefined && <span>{attemptScore}/10</span>}
            </span>
          ) : (
            <span className="w-5 h-5 rounded-full border-2 inline-block" style={{ borderColor: 'var(--border-color)' }} />
          )}

          {/* Practice button */}
          <button
            onClick={(e) => { e.stopPropagation(); onPractice(); }}
            className="flex items-center space-x-1 px-3 py-1.5 bg-primary/20 text-primary rounded-lg text-xs font-medium hover:bg-primary/30 transition-all opacity-0 group-hover:opacity-100"
          >
            <span>Practice</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
