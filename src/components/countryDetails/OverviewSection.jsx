import Icon from "./Icon";

const OverviewSection = ({ country }) => (
  <section className="relative border-y border-white/5 bg-[#020b1c]">
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.6fr,1fr] lg:items-start lg:px-8">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_80px_-40px_rgba(15,23,42,0.8)]">
        <div className="flex items-center gap-3">
          <span className="text-sm uppercase tracking-[0.3em] text-white/50">
            Country Overview
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <p className="mt-6 text-lg text-white/80">
          {country.overview?.description}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {country.overview?.highlights?.map((item) => (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-2xl bg-white/5 p-4"
            >
              <Icon name={item.icon} className="h-6 w-6 text-emerald-300" />
              <div>
                <p className="text-sm text-white/60">{item.label}</p>
                <p className="text-lg font-semibold text-white">
                  {item.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  </section>
);

export default OverviewSection;

