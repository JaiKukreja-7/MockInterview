"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const types = [
  {
    icon: "</>",
    title: "DSA & Coding",
    desc: "Arrays, trees, graphs, dynamic programming — practice the algorithms that top companies test",
    tags: ["Arrays", "Trees", "DP", "Graphs", "Strings"],
    tint: "rgba(124,58,237,0.08)",
    border: "rgba(124,58,237,0.15)",
    tagBg: "rgba(124,58,237,0.12)",
    tagColor: "#a78bfa",
  },
  {
    icon: "⚡",
    title: "System Design",
    desc: "Design scalable systems like a senior engineer — URL shorteners, chat apps, video platforms",
    tags: ["Scalability", "Databases", "Caching", "APIs"],
    tint: "rgba(6,182,212,0.08)",
    border: "rgba(6,182,212,0.15)",
    tagBg: "rgba(6,182,212,0.12)",
    tagColor: "#67e8f9",
  },
  {
    icon: "💬",
    title: "HR & Behavioural",
    desc: "Master STAR format answers for leadership, conflict, and teamwork questions",
    tags: ["STAR Format", "Leadership", "Communication"],
    tint: "rgba(236,72,153,0.08)",
    border: "rgba(236,72,153,0.15)",
    tagBg: "rgba(236,72,153,0.12)",
    tagColor: "#f9a8d4",
  },
];

export default function InterviewTypes() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="w-full py-20 md:py-28" style={{ background: "linear-gradient(180deg, rgba(10,10,15,0.8) 0%, rgba(13,13,22,0.8) 50%, rgba(10,10,15,0.8) 100%)" }}>
      <div className="max-w-6xl mx-auto px-6 text-center">
        <motion.h2
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-white"
        >
          Practice every type of interview
        </motion.h2>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {types.map((t, i) => (
            <motion.div
              key={t.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
              className="p-6 rounded-2xl text-left"
              style={{ background: t.tint, border: `0.5px solid ${t.border}` }}
            >
              <span className="text-3xl">{t.icon}</span>
              <h3 className="mt-4 text-white font-semibold text-xl">{t.title}</h3>
              <p className="mt-3 text-white/40 text-sm leading-relaxed">{t.desc}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {t.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2.5 py-1 rounded-full"
                    style={{ background: t.tagBg, color: t.tagColor }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
