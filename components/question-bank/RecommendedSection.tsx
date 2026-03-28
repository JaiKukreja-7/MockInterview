"use client";

import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { CompanyQuestion } from '@/lib/question-bank';

interface RecommendedSectionProps {
  questions: CompanyQuestion[];
  onPractice: (question: CompanyQuestion) => void;
}

export default function RecommendedSection({ questions, onPractice }: RecommendedSectionProps) {
  if (questions.length === 0) return null;

  const diffColor = (d: string) =>
    d === 'Easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
    d === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
    'bg-red-500/10 text-red-400 border-red-500/20';

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-5 h-5 text-amber-400" />
        <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Recommended for You</h2>
      </div>

      <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-none -mx-1 px-1">
        {questions.slice(0, 8).map((q, i) => (
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            onClick={() => onPractice(q)}
            className="flex-shrink-0 w-72 glass rounded-xl backdrop-blur-md cursor-pointer hover:opacity-90 transition-all group p-4"
            style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)', transition: 'var(--transition)' }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <img
                src={q.company_logo_url}
                alt={q.company}
                className="w-5 h-5 rounded object-contain bg-white/10 p-0.5"
                onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${q.company}&size=20&background=7C3AED&color=fff`; }}
              />
              <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{q.company}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${diffColor(q.difficulty)}`}>
                {q.difficulty}
              </span>
            </div>
            <p className="text-sm line-clamp-2 mb-3 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{q.question_text}</p>
            <div className="flex items-center justify-between">
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{q.frequency === 'Very Common' ? '🔥 ' : ''}{q.frequency}</span>
              <span className="text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1">
                <span>Practice</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
