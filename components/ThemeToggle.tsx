"use client";

import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full overflow-hidden relative transition-colors"
      style={{
        background: theme === "dark" ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.1)",
        border: `0.5px solid ${theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(124,58,237,0.2)"}`,
      }}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ rotate: 0, scale: 1 }}
          animate={{ rotate: 360, scale: [1, 1.2, 1] }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {theme === "dark" ? (
            <Moon className="w-5 h-5" style={{ color: "#ffffff" }} />
          ) : (
            <Sun className="w-5 h-5" style={{ color: "#7C3AED" }} />
          )}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
