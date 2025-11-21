const CallToActionSection = ({ country }) => (
  <section className="bg-[#010813]">
    <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
      <p className="text-sm uppercase tracking-[0.3em] text-white/50">
        Apply now
      </p>
      <h2 className="text-3xl font-semibold text-white">
        Ready to start your {country.country} visa?
      </h2>
      <p className="max-w-2xl text-base text-white/70">
        Our mission desk handles every form, appointment, and submission on your
        behalf. Expect concierge updates at each milestone.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          className="rounded-full bg-linear-to-r from-emerald-400 to-blue-500 px-8 py-3 text-base font-semibold text-slate-950 shadow-[0_25px_45px_rgba(16,185,129,0.35)] transition hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
        >
          Apply for Visa Now
        </button>
        <button
          type="button"
          className="rounded-full border border-white/20 px-8 py-3 text-base font-semibold text-white transition hover:border-white hover:bg-white/5"
        >
          Talk to an expert
        </button>
      </div>
    </div>
  </section>
);

export default CallToActionSection;


