const HeroSection = ({ country, onBack, onApply, applyLoading }) => (
  <section className="relative isolate overflow-hidden">
    <img
      src={country.heroImage}
      alt={country.country}
      className="absolute inset-0 h-full w-full object-cover"
    />
    <div className="absolute inset-0 bg-[#030920]/60 backdrop-blur-sm" />
    <div className="absolute left-1/2 top-10 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-500/20 blur-3xl" />
    <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-3xl space-y-6">
          <p className="text-sm uppercase tracking-[0.4em] text-emerald-200/80">
            Visa Requirements & Travel Information
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-white sm:text-5xl">
            {country.country}
          </h1>
          <button
            type="button"
            onClick={onApply}
            disabled={applyLoading}
            className="inline-flex h-12 w-56 items-center justify-center rounded-full bg-linear-to-r from-emerald-400 to-blue-500 px-8 py-3 text-base font-semibold text-slate-950 shadow-[0_25px_45px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {applyLoading ? (
              <span className="inline-flex h-5 w-5 animate-spin rounded-full border-2 border-slate-950/40 border-t-slate-950" />
            ) : (
              "Apply for Visa Now"
            )}
          </button>
        </div>
      </div>
    </div>
  </section>
);

export default HeroSection;


