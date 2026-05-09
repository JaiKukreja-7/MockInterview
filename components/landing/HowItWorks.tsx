"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Target, MessageSquare, BarChart3, Zap } from "lucide-react";

const steps = [
  {
    num: "01",
    icon: Target,
    title: "Choose your role",
    desc: "Pick SDE, Frontend, Backend, or Data Analyst",
  },
  {
    num: "02",
    icon: MessageSquare,
    title: "Answer real questions",
    desc: "DSA, System Design, or HR interview rounds",
  },
  {
    num: "03",
    icon: Zap,
    title: "Get AI feedback",
    desc: "Instant scoring, strengths, weaknesses, and model answers",
  },
  {
    num: "04",
    icon: BarChart3,
    title: "Track your progress",
    desc: "Analytics dashboard, skill radar, and streak system",
  },
];

export default function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="how-it-works" className="w-full py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-white"
        >
          How MockPrep works
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-3 text-white/40 text-base"
        >
          From zero to interview-ready in 4 simple steps
        </motion.p>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-full bg-[#7C3AED] flex items-center justify-center text-white font-bold text-sm mb-5">
                {step.num}
              </div>
              <step.icon className="w-7 h-7 text-[#7C3AED] mb-3" />
              <h3 className="text-white font-semibold text-lg">{step.title}</h3>
              <p className="mt-2 text-white/40 text-sm leading-relaxed max-w-[200px]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
