"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

const freePlan = {
  title: "Free Forever",
  price: "₹0",
  period: "/ month",
  features: [
    "5 AI interviews per month",
    "Full question bank access",
    "AI resume analyser (2 per month)",
    "Performance analytics",
    "Streak tracking",
  ],
};

const proPlan = {
  title: "Pro",
  price: "₹299",
  originalPrice: "₹599",
  period: "/ month",
  features: [
    "Unlimited AI interviews",
    "Full question bank access",
    "Unlimited AI resume analyses",
    "Priority AI feedback (faster responses)",
    "Interview recording & playback",
    "Public profile & shareable scorecard",
    "Email support",
  ],
};

export default function Pricing() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      id="pricing"
      className="w-full py-20 md:py-28"
      style={{ background: "linear-gradient(180deg, rgba(10,10,15,0.85) 0%, rgba(13,13,22,0.85) 50%, rgba(10,10,15,0.85) 100%)" }}
    >
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.h2
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-white"
        >
          Simple, transparent pricing
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-3 text-white/40 text-base"
        >
          Start for free. Upgrade when you&apos;re ready.
        </motion.p>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="p-7 rounded-2xl text-left"
            style={{ background: "rgba(255,255,255,0.03)", border: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            <h3 className="text-white font-semibold text-xl">{freePlan.title}</h3>
            <div className="mt-4 flex items-end gap-1">
              <span className="text-4xl font-extrabold text-white">{freePlan.price}</span>
              <span className="text-white/40 text-sm mb-1">{freePlan.period}</span>
            </div>
            <ul className="mt-6 space-y-3">
              {freePlan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/60">
                  <Check className="w-4 h-4 text-[#7C3AED] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href="/login"
              className="mt-8 block text-center w-full py-3 rounded-xl text-sm font-semibold text-white/70 border border-white/10 hover:border-white/20 hover:text-white transition-all"
            >
              Get Started Free
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative p-7 rounded-2xl text-left"
            style={{
              background: "rgba(124,58,237,0.06)",
              border: "1px solid rgba(124,58,237,0.3)",
              boxShadow: "0 0 40px rgba(124,58,237,0.08)",
            }}
          >
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-xs font-semibold text-white bg-[#7C3AED]">
              Most Popular
            </div>
            <h3 className="text-white font-semibold text-xl">{proPlan.title}</h3>
            <div className="mt-4 flex items-end gap-2">
              <span className="text-4xl font-extrabold text-white">{proPlan.price}</span>
              <span className="text-white/40 text-sm mb-1">{proPlan.period}</span>
              <span className="text-white/30 text-sm mb-1 line-through ml-1">{proPlan.originalPrice}</span>
            </div>
            <div className="mt-2 inline-block px-2.5 py-1 rounded-full text-xs font-semibold text-amber-300 bg-amber-400/10">
              🔥 Launch offer — 50% off
            </div>
            <ul className="mt-5 space-y-3">
              {proPlan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-white/60">
                  <Check className="w-4 h-4 text-[#7C3AED] mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              disabled
              className="mt-8 block w-full text-center py-3 rounded-xl text-sm font-semibold text-white/40 cursor-not-allowed"
              style={{ background: "rgba(124,58,237,0.2)" }}
            >
              Coming Soon
            </button>
            <p className="mt-3 text-center text-xs text-white/25">
              Pro plan launching soon — get notified
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
