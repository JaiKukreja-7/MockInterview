"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const row1 = ["Google", "Amazon", "Microsoft", "Meta", "Adobe", "Flipkart", "Zomato"];
const row2 = ["Swiggy", "CRED", "Razorpay", "Paytm", "Infosys", "TCS", "Wipro"];

function CompanyPill({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2.5 px-5 py-3 rounded-xl mx-3 shrink-0 group" style={{ background: "rgba(255,255,255,0.04)", border: "0.5px solid rgba(255,255,255,0.06)" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${name.toLowerCase()}.com&sz=32`}
        alt={name}
        width={20}
        height={20}
        className="rounded grayscale group-hover:grayscale-0 transition-all duration-300"
        loading="lazy"
      />
      <span className="text-sm text-white/50 group-hover:text-white/80 transition-colors whitespace-nowrap">{name}</span>
    </div>
  );
}

function MarqueeRow({ companies, direction }: { companies: string[]; direction: "left" | "right" }) {
  const doubled = [...companies, ...companies];
  return (
    <div className="overflow-hidden w-full">
      <div
        className="flex"
        style={{
          animation: `marquee-${direction} 35s linear infinite`,
          willChange: "transform",
        }}
      >
        {doubled.map((c, i) => (
          <CompanyPill key={`${c}-${i}`} name={c} />
        ))}
      </div>
    </div>
  );
}

export default function Companies() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="companies" className="w-full py-20 md:py-28 overflow-hidden">
      <style jsx global>{`
        @keyframes marquee-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>

      <div className="max-w-6xl mx-auto px-6 text-center mb-12">
        <motion.h2
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-white"
        >
          Practice questions from top companies
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-3 text-white/40 text-base"
        >
          Real questions sourced from actual interview experiences
        </motion.p>
      </div>

      <div className="flex flex-col gap-4">
        <MarqueeRow companies={row1} direction="left" />
        <MarqueeRow companies={row2} direction="right" />
      </div>
    </section>
  );
}
