"use client";

import dynamic from "next/dynamic";
import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import StatsBar from "@/components/landing/StatsBar";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturesGrid from "@/components/landing/FeaturesGrid";
import Companies from "@/components/landing/Companies";
import InterviewTypes from "@/components/landing/InterviewTypes";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FinalCTA from "@/components/landing/FinalCTA";
import Footer from "@/components/landing/Footer";
import { useEffect } from "react";

const LandingBackground = dynamic(
  () => import("@/components/LandingBackground"),
  { ssr: false }
);

export default function Home() {
  useEffect(() => {
    document.title = "MockPrep — AI Mock Interviews for CS Students";
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "";
    };
  }, []);

  return (
    <main className="min-h-screen overflow-x-hidden" style={{ background: "transparent" }}>
      <LandingBackground />
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <FeaturesGrid />
      <Companies />
      <InterviewTypes />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </main>
  );
}
