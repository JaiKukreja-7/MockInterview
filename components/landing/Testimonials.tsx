"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const testimonials = [
  {
    initials: "RK",
    bg: "#7C3AED",
    name: "Rahul Khanna",
    college: "VJTI Mumbai, 3rd Year",
    quote: "MockPrep's AI feedback is genuinely better than what I get from seniors. It told me exactly why my approach to the sliding window problem was suboptimal.",
  },
  {
    initials: "PS",
    bg: "#06b6d4",
    name: "Priya Sharma",
    college: "DTU Delhi, Final Year",
    quote: "Got my Flipkart internship offer after 3 weeks of practicing on MockPrep. The company-specific question bank is what made the difference.",
  },
  {
    initials: "AJ",
    bg: "#22c55e",
    name: "Arjun Joshi",
    college: "BITS Pilani, 2nd Year",
    quote: "The AI resume analyser found 8 missing keywords in my resume for the SDE Intern role. My response rate from companies doubled after fixing them.",
  },
];

export default function Testimonials() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="w-full py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-white"
        >
          What students are saying
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              className="p-6 rounded-2xl text-left"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                border: "0.5px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="text-yellow-400 text-sm mb-4">⭐⭐⭐⭐⭐</div>
              <p className="text-white/60 text-sm leading-relaxed italic">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: t.bg }}
                >
                  {t.initials}
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/30 text-xs">{t.college}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
