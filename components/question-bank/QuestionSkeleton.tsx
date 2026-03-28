"use client";

export default function QuestionSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl p-5 animate-pulse" style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md" style={{ background: 'var(--border-color)' }} />
            <div className="w-20 h-4 rounded" style={{ background: 'var(--border-color)' }} />
            <div className="w-14 h-4 rounded-full" style={{ background: 'var(--border-color)' }} />
            <div className="w-16 h-4 rounded-full" style={{ background: 'var(--border-color)' }} />
          </div>
          <div className="space-y-2 mb-3">
            <div className="w-full h-4 rounded" style={{ background: 'var(--border-color)' }} />
            <div className="w-3/4 h-4 rounded" style={{ background: 'var(--border-color)' }} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-24 h-3 rounded" style={{ background: 'var(--border-color)' }} />
              <div className="w-16 h-3 rounded" style={{ background: 'var(--border-color)' }} />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-14 h-6 rounded-lg" style={{ background: 'var(--border-color)' }} />
              <div className="w-8 h-8 rounded-lg" style={{ background: 'var(--border-color)' }} />
              <div className="w-5 h-5 rounded-full" style={{ background: 'var(--border-color)' }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
