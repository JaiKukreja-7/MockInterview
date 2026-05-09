"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const features = [
  {
    icon: "🤖",
    title: "AI-Powered Feedback",
    desc: "Get scored out of 10 on every answer with detailed strengths, weaknesses, and a model answer powered by xAI Grok",
  },
  {
    icon: "🏢",
    title: "Real Company Questions",
    desc: "200+ questions from Google, Amazon, Flipkart, Zomato, Razorpay and more — curated from real interviews",
  },
  {
    icon: "💻",
    title: "In-Browser Code Editor",
    desc: "Write and run code in JavaScript, Python, Java, and C++ with the same editor that powers VS Code",
  },
  {
    icon: "📊",
    title: "Performance Analytics",
    desc: "Track your progress with score trends, skill radar charts, and a GitHub-style practice heatmap",
  },
  {
    icon: "📄",
    title: "AI Resume Analyser",
    desc: "Upload your resume and get an ATS score, missing keywords, and specific rewrite suggestions for your target role",
  },
  {
    icon: "🔥",
    title: "Streak System",
    desc: "Build a daily practice habit with streak tracking and email reminders that keep you accountable",
  },
];

export default function FeaturesGrid() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="features"
      className="w-full py-20 md:py-28"
      style={{
        background: "linear-gradient(180deg, rgba(10,10,15,0.8) 0%, rgba(13,13,22,0.8) 50%, rgba(10,10,15,0.8) 100%)",
      }}
    >
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-white"
        >
          Everything you need to crack interviews
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
              className="group p-6 rounded-2xl text-left transition-all hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                backdropFilter: "blur(12px)",
                border: "0.5px solid rgba(255,255,255,0.06)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(124,58,237,0.3)";
                e.currentTarget.style.boxShadow = "0 8px 30px rgba(124,58,237,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div className="w-11 h-11 rounded-xl bg-[#7C3AED]/15 flex items-center justify-center text-xl mb-4">
                {f.icon}
              </div>
              <h3 className="text-white font-semibold text-lg">{f.title}</h3>
              <p className="mt-2 text-white/40 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
