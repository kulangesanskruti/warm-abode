import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import TrustedNumbers from "@/components/TrustedNumbers";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import ControlCenter from "@/components/ControlCenter";
import WhyStayHub from "@/components/WhyStayHub";
import Testimonial from "@/components/Testimonial";
import FAQ from "@/components/FAQ";
import FinalCTA from "@/components/FinalCTA";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-ink-50 text-ink-900 antialiased">
      <Navbar />
      <main>
        <Hero />
        <TrustedNumbers />
        <Features />
        <HowItWorks />
        <ControlCenter />
        <WhyStayHub />
        <Testimonial />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
