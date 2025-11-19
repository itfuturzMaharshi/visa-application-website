import Header from "./components/Header";
import Destinations from "./components/Destinations";
import Pricing from "./components/Pricing";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      <main>
        <Destinations />
        <Pricing />
      </main>
      <Footer />
    </div>
  );
}

export default App;
