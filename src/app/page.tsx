import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import DataSection from "@/components/landing/DataSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import FooterCTA from "@/components/landing/FooterCTA";

export default function LandingPage() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <DataSection />
      <HowItWorksSection />
      <FooterCTA />
    </main>
  );
}
