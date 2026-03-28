"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hash, CheckCircle, Bookmark, Target } from 'lucide-react';
import type { UserQuestionStats } from '@/lib/question-bank';

interface StatsBarProps {
  stats: UserQuestionStats;
}

function CountingNumber({ value, duration = 1500, suffix = "" }: { value: number, duration?: number, suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // easeOutQuad curve: t * (2 - t)
      const easedProgress = progress * (2 - progress);
      const currentValue = Math.floor(easedProgress * (value - startValue) + startValue);
      
      setCount(currentValue);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{count}{suffix}</>;
}

export default function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: 'Total Questions', value: stats.totalQuestions, icon: Hash, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    { label: 'Attempted', value: stats.attempted, icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20' },
    { label: 'Bookmarked', value: stats.bookmarked, icon: Bookmark, color: 'text-primary', bg: 'bg-primary/20' },
    { label: 'Accuracy', value: stats.accuracy, suffix: '%', icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/20' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          className="glass rounded-xl backdrop-blur-md flex items-center space-x-3 p-4"
          style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', transition: 'var(--transition)' }}
        >
          <div className={`p-2.5 rounded-lg ${item.bg}`}>
            <item.icon className={`w-5 h-5 ${item.color}`} />
          </div>
          <div>
            <p className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
            <motion.p
              className="text-xl font-bold"
              style={{ color: 'var(--text-primary)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <CountingNumber value={Number(item.value)} suffix={item.suffix} />
            </motion.p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
