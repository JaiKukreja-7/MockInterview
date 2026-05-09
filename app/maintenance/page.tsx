"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useEffect } from "react";

const DashboardBackground = dynamic(
  () => import("@/components/DashboardBackground"),
  { ssr: false }
);

export default function MaintenancePage() {
  useEffect(() => {
    document.title = "Maintenance — MockPrep";
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0F] px-4 text-center">
      <DashboardBackground />

      {/* Logo at the top */}
      <div className="absolute top-8 left-0 right-0 flex justify-center z-20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg border border-primary/50 bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">AI</span>
          </div>
          <span className="font-bold text-lg tracking-wide text-white">MockPrep</span>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="relative z-10 flex flex-col items-center"
      >
        <span className="text-[80px] mb-4 select-none" role="img" aria-label="wrench">
          🔧
        </span>

        <h1 className="text-[32px] font-bold text-white">
          We'll be right back
        </h1>

        <p className="mt-4 text-[#9ca3af] max-w-md">
          MockPrep is currently undergoing scheduled maintenance. We'll be back shortly.
        </p>

        {/* Pulsing dots */}
        <div className="mt-6 flex gap-1.5 justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 rounded-full bg-[#7C3AED]"
            />
          ))}
        </div>

        <div className="mt-10">
          <a
            href="#" // links to your domain - using # as placeholder for current domain
            className="px-8 py-3 rounded-xl font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all active:scale-95 border border-white/10 inline-block min-w-[200px]"
          >
            Check our status
          </a>
        </div>

        <p className="mt-12 text-sm text-[#F59E0B] font-medium">
          Expected downtime: less than 30 minutes
        </p>
      </motion.div>
    </div>
  );
}
