import Header from "./components/Header";
import Hero from "./components/Hero";
import AnimatedSplash from "./components/AnimatedSplash";
import About from "./components/About";
import Workflow from "./components/Workflow";
import Offers from "./components/Offers";
import EquipmentShowcase from "./components/EquipmentShowcase";
import Users from "./components/Users";
import OnboardingCTA from "./components/OnboardingCTA";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Hero />
        <AnimatedSplash />
        <About />
        <Workflow />
        <Offers />
        <EquipmentShowcase />
        <Users />
        <OnboardingCTA />
      </main>
      <Footer />
    </div>
  );
}
