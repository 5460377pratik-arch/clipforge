import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TransformShowcase from "@/components/TransformShowcase";
import FeaturesSection from "@/components/FeaturesSection";
import HowItWorks from "@/components/HowItWorks";
import PricingSection from "@/components/PricingSection";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <TransformShowcase />
        <FeaturesSection />
        <HowItWorks />
        <PricingSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
