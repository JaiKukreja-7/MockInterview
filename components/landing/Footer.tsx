"use client";

import Link from "next/link";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Question Bank", href: "#companies" },
  { label: "Resume Analyser", href: "#features" },
  { label: "Analytics", href: "#features" },
  { label: "Pricing", href: "#pricing" },
];

const companyLinks = [
  { label: "About", href: "#about" },
  { label: "Changelog", href: "#" },
  { label: "Privacy Policy", href: "#" },
  { label: "Terms of Service", href: "#" },
];

const connectLinks = [
  { label: "GitHub", href: "https://github.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
];

export default function Footer() {
  return (
    <footer id="about" className="w-full border-t" style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(7,7,11,0.92)" }}>
      <div className="max-w-6xl mx-auto px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#7C3AED] flex items-center justify-center">
              <span className="text-white font-bold text-sm">M</span>
            </div>
            <span className="text-white font-bold text-lg">MockPrep</span>
          </div>
          <p className="text-white/30 text-sm leading-relaxed">
            AI-powered mock interviews for CS students
          </p>
          <p className="mt-4 text-white/20 text-xs">© 2026 MockPrep</p>
        </div>

        {/* Product */}
        <div>
          <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">Product</h4>
          <ul className="space-y-2.5">
            {productLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm text-white/30 hover:text-white/60 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">Company</h4>
          <ul className="space-y-2.5">
            {companyLinks.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="text-sm text-white/30 hover:text-white/60 transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect */}
        <div>
          <h4 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4">Connect</h4>
          <ul className="space-y-2.5">
            {connectLinks.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-sm text-white/30 hover:text-white/60 transition-colors">
                  {l.label}
                </a>
              </li>
            ))}
            <li className="text-sm text-white/30">Built by MockPrep Team</li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t py-5 text-center" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
        <p className="text-xs text-white/20">Made with ❤️ in Mumbai 🇮🇳</p>
      </div>
    </footer>
  );
}
