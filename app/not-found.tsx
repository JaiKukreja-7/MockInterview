"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

const DashboardBackground = dynamic(
  () => import("@/components/DashboardBackground"),
  { ssr: false }
);

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    document.title = "404 — MockPrep";
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0F] px-4 text-center">
      <DashboardBackground />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="relative z-10 flex flex-col items-center"
      >
        <h1 
          className="font-extrabold leading-none select-none tracking-tighter"
          style={{ 
            fontSize: "120px",
            background: "linear-gradient(135deg, #7C3AED, #06b6d4)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}
        >
          404
        </h1>

        <h2 className="mt-4 text-[28px] font-bold text-white">
          Page not found
        </h2>

        <p className="mt-2 text-[#9ca3af] max-w-md">
          Looks like this page doesn't exist or was moved.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            href="/dashboard"
            className="px-8 py-3 rounded-xl font-semibold text-white transition-all hover:scale-105 active:scale-95 text-center min-w-[200px]"
            style={{
              background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
              boxShadow: "0 4px 15px rgba(124, 58, 237, 0.3)"
            }}
          >
            Go to Dashboard →
          </Link>
          
          <button
            onClick={() => router.back()}
            className="px-8 py-3 rounded-xl font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-all active:scale-95 border border-white/10 min-w-[200px]"
          >
            Go back
          </button>
        </div>

        <p className="mt-12 text-sm text-[#9ca3af]/50 italic">
          Lost in the interview void? Let's get you back on track.
        </p>
      </motion.div>
    </div>
  );
}
