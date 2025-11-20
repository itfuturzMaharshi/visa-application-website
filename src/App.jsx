import Header from "./components/Header";
import Hero from "./components/Hero";
import Destinations from "./components/Destinations";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <Header />
      <Hero />
      <main>
        <Destinations />
        <Pricing />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}

export default App;
