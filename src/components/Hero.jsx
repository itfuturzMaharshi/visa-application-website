import { useEffect, useState } from "react";

const heroSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1600&q=80",
    caption: "Trusted by diplomats, executives, and global families.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1600&q=80",
    caption: "Dedicated visa strategists in 40+ embassies worldwide.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
    caption: "Priority approvals with compliant documentation workflows.",
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-slate-950 text-white"
      aria-label="Visa application hero section"
    >
      <div className="absolute inset-0">
        {heroSlides.map((slide, index) => (
          <div
            key={slide.image}
            aria-hidden={index !== currentSlide}
            className={`absolute inset-0 transform bg-cover bg-center transition duration-2000 ${
              index === currentSlide ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="absolute inset-0 bg-linear-to-b from-slate-950/70 via-slate-950/60 to-slate-950/90" />
          </div>
        ))}
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 py-24 sm:px-6 lg:px-8 lg:flex-row lg:items-center">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/80">
            Trusted Visa Architects
            <span className="h-1 w-1 rounded-full bg-emerald-300" />
            97% Approval Rate
          </div>
          <h1 className="mt-8 text-4xl font-semibold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
            Fast &amp; Hassle-Free Visa Processing Worldwide
          </h1>
          <p className="mt-6 text-lg text-blue-100/90">
            Dedicated strategists, concierge documentation, and real-time embassy insights help you
            secure the right visa on the first submission.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <a
              href="#pricing"
              className="rounded-full bg-emerald-400 px-8 py-3 text-base font-semibold text-slate-950 shadow-xl shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300"
            >
              Apply Now
            </a>
            <a
              href="#destinations"
              className="rounded-full border border-white/30 px-8 py-3 text-base font-semibold text-white transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
            >
              Check Eligibility
            </a>
          </div>
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <form className="flex flex-col gap-4 lg:flex-row">
              <label className="flex-1 text-sm text-blue-100/80">
                Destination Country
                <input
                  type="text"
                  placeholder="e.g. Canada, UAE, Schengen"
                  className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-emerald-300 focus:outline-none"
                />
              </label>
              <label className="flex-1 text-sm text-blue-100/80">
                Travel Purpose
                <select className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-emerald-300 focus:outline-none">
                  <option className="text-slate-900">Business Visit</option>
                  <option className="text-slate-900">Tourism & Leisure</option>
                  <option className="text-slate-900">Study Program</option>
                  <option className="text-slate-900">Work Permit</option>
                </select>
              </label>
            </form>
            <p className="mt-4 text-xs text-blue-100/70">
              Our concierge team replies in under 30 minutes on business days.
            </p>
          </div>
        </div>
        <div className="flex-1 space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="rounded-2xl bg-slate-950/50 p-5 shadow-xl shadow-slate-950/40">
            <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Trusted Insight</p>
            <p className="mt-4 text-2xl font-semibold text-white">
              {heroSlides[currentSlide].caption}
            </p>
            <div className="mt-6 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full border border-white/40" />
              <div>
                <p className="text-sm font-semibold text-white">Dedicated Case Officer</p>
                <p className="text-xs text-blue-100/70">Available 24/7</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-center text-white">
            <div className="rounded-2xl border border-white/15 p-6">
              <p className="text-4xl font-semibold text-emerald-300">48h</p>
              <p className="mt-2 text-sm text-blue-100/80">average document review</p>
            </div>
            <div className="rounded-2xl border border-white/15 p-6">
              <p className="text-4xl font-semibold text-emerald-300">140+</p>
              <p className="mt-2 text-sm text-blue-100/80">countries processed</p>
            </div>
            <div className="rounded-2xl border border-white/15 p-6">
              <p className="text-4xl font-semibold text-emerald-300">24/7</p>
              <p className="mt-2 text-sm text-blue-100/80">concierge assistance</p>
            </div>
            <div className="rounded-2xl border border-white/15 p-6">
              <p className="text-4xl font-semibold text-emerald-300">4.9/5</p>
              <p className="mt-2 text-sm text-blue-100/80">client rating</p>
            </div>
          </div>
        </div>
      </div>
      <div className="relative mx-auto flex max-w-6xl flex-wrap items-center gap-6 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-blue-100/80 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          ISO 27001 secure data environment
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-blue-100/80 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          In-house immigration attorneys
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-blue-100/80 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-300" />
          Real-time embassy tracking portal
        </div>
      </div>
    </section>
  );
};

export default Hero;

