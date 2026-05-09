"use client";

import { useRef, useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";

const stats = [
  { value: 200, suffix: "+", label: "Real company questions" },
  { value: 10, suffix: "+", label: "Target companies" },
  { value: 3, suffix: "", label: "Interview types" },
  { value: 100, suffix: "%", label: "AI Powered feedback" },
];

function AnimatedNumber({ value, suffix, inView }: { value: number; suffix: string; inView: boolean }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1500;
    const increment = value / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span className="text-3xl md:text-4xl font-extrabold text-[#7C3AED]">
      {count}{suffix}
    </span>
  );
}

export default function StatsBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="w-full py-16 md:py-20"
      style={{
        background: "linear-gradient(180deg, rgba(10,10,15,0.85) 0%, rgba(15,15,24,0.85) 50%, rgba(10,10,15,0.85) 100%)",
        borderTop: "0.5px solid rgba(255,255,255,0.05)",
        borderBottom: "0.5px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center"
          >
            <AnimatedNumber value={stat.value} suffix={stat.suffix} inView={inView} />
            <p className="mt-2 text-sm text-white/40">{stat.label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
