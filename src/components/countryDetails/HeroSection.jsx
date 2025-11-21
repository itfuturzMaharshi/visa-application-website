const HeroSection = ({ country, onBack }) => (
  <section className="relative isolate overflow-hidden">
    <img
      src={country.heroImage}
      alt={country.country}
      className="absolute inset-0 h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-[#030920]/60 backdrop-blur-sm" />
    <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
    <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onBack}
        className="group inline-flex items-center gap-2 self-start rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/5 transition group-hover:-translate-x-1">
          ←
        </span>
        Back to destinations
      </button>



      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-200/80">
            Visa Requirements & Travel Information
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {country.country}
          </h1>
          <p className="mt-6 text-lg text-white/80">
            {country.overview?.heroCopy}
          </p>
        </div>
        <div className="flex items-center gap-4 rounded-3xl border border-white/15 bg-white/5 p-4 backdrop-blur">
          <div className="relative h-16 w-16 overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-2">
            <div className="absolute inset-0 animate-pulse rounded-2xl bg-white/5" />
            <img
              src={country.flag}
              alt={`${country.country} flag`}
              className="relative z-10 h-full w-full rounded-xl object-cover"
            />
          </div>
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/50">
              Embassy-grade care
            </p>
            <p className="text-2xl font-semibold text-white">
              {country.responseTime}
            </p>
            <p className="text-sm text-white/70">Dedicated visa concierge</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;


