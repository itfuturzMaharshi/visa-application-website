const StepsSection = ({ steps }) => (
  <section className="bg-[#020b1c]">
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">
          How to Apply
        </p>
        <h2 className="text-3xl font-semibold text-white">
          Curated end-to-end journey
        </h2>
      </div>
      <ol className="mt-10 space-y-6 border-l border-white/10 pl-8">
        {steps?.map((step, index) => (
          <li key={step.title} className="relative">
            <span className="absolute -left-11 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-[#040c25] text-sm font-semibold text-white">
              {index + 1}
            </span>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 transition hover:border-emerald-300/60 hover:bg-white/10">
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                {step.stage}
              </p>
              <h3 className="mt-3 text-2xl font-semibold text-white">
                {step.title}
              </h3>
              <p className="mt-2 text-base text-white/70">{step.copy}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  </section>
);

export default StepsSection;


