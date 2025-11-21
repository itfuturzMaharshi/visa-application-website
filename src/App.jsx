import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Hero from "./components/Hero";
import Destinations from "./components/Destinations";
import Pricing from "./components/Pricing";
import FAQ from "./components/FAQ";
import Footer from "./components/Footer";
import CountryDetails from "./components/countryDetails/CountryDetails";
import Register from "./pages/Register";
import Login from "./pages/Login";
import UserDetails from "./pages/UserDetails";

function App() {
  return (
    <div className="min-h-screen bg-[#f5f7fb] text-slate-900">
      <Header />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <main>
                <Destinations />
                <Pricing />
                <FAQ />
              </main>
            </>
          }
        />
        <Route path="/country-details/:id" element={<CountryDetails />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-details" element={<UserDetails />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
