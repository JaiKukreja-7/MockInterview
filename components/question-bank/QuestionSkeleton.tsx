"use client";

export default function QuestionSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-md bg-white/10" />
            <div className="w-20 h-4 rounded bg-white/10" />
            <div className="w-14 h-4 rounded-full bg-white/10" />
            <div className="w-16 h-4 rounded-full bg-white/10" />
          </div>
          <div className="space-y-2 mb-3">
            <div className="w-full h-4 rounded bg-white/10" />
            <div className="w-3/4 h-4 rounded bg-white/10" />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-24 h-3 rounded bg-white/10" />
              <div className="w-16 h-3 rounded bg-white/10" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-14 h-6 rounded-lg bg-white/10" />
              <div className="w-8 h-8 rounded-lg bg-white/10" />
              <div className="w-5 h-5 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
