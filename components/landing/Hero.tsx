"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const avatars = [
  { initials: "RK", bg: "#7C3AED" },
  { initials: "PS", bg: "#06b6d4" },
  { initials: "AJ", bg: "#22c55e" },
  { initials: "DM", bg: "#ec4899" },
  { initials: "NK", bg: "#f59e0b" },
];

export default function Hero() {
  return (
    <section className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden">


      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto pt-16">
        {/* Pill badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 px-4 py-1.5 rounded-full border border-[#7C3AED]/40 text-sm text-white/70"
          style={{ background: "rgba(124,58,237,0.1)" }}
        >
          ✨ Powered by xAI Grok
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-extrabold leading-[1.1] tracking-tight text-[40px] md:text-[72px]"
        >
          <span className="text-white">Ace Your Next</span>
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #7C3AED, #06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Tech Interview
          </span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 text-base md:text-lg text-white/50 max-w-xl"
        >
          Practice DSA, System Design, and HR interviews with AI-powered feedback.
          Built for CS students targeting top tech companies.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 items-center"
        >
          <Link
            href="/login"
            className="flex items-center justify-center px-8 h-[52px] rounded-xl text-white font-semibold text-base transition-all hover:scale-105 active:scale-95 min-w-[220px]"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
              boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
            }}
          >
            Start Practicing Free →
          </Link>
          <Link
            href="/login"
            className="flex items-center justify-center px-8 h-[52px] rounded-xl text-white/70 hover:text-white font-semibold border border-white/10 hover:border-white/20 transition-all min-w-[220px]"
          >
            View Question Bank
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-10 flex items-center gap-3"
        >
          <div className="flex -space-x-2">
            {avatars.map((a) => (
              <div
                key={a.initials}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-[#0A0A0F]"
                style={{ background: a.bg }}
              >
                {a.initials}
              </div>
            ))}
          </div>
          <span className="text-sm text-white/40">
            Join 500+ students already practicing
          </span>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{
          opacity: { delay: 1.2 },
          y: { duration: 1.5, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute bottom-8 z-10"
      >
        <ChevronDown className="w-6 h-6 text-white/30" />
      </motion.div>
    </section>
  );
}
