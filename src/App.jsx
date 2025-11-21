import { useCallback, useState } from "react";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Destinations from "./components/Destinations";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import CountryDetails from "./components/countryDetails/CountryDetails";

function App() {
  const [selectedDestination, setSelectedDestination] = useState(null);

  const handleSelectDestination = useCallback((destination) => {
    setSelectedDestination(destination);
    window?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBackToDestinations = useCallback(() => {
    setSelectedDestination(null);
    window?.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <Header />
      {selectedDestination ? (
        <CountryDetails
          country={selectedDestination}
          onBack={handleBackToDestinations}
        />
      ) : (
        <>
          <Hero />
          <main>
            <Destinations onSelectDestination={handleSelectDestination} />
            <Pricing />
            <FAQ />
          </main>
        </>
      )}
      <Footer />
    </div>
  );
}

export default App;
