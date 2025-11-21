const VisaCategoriesSection = ({
  visaCategories,
  activeCategory,
  onCategoryChange,
  activeCategoryData,
}) => (
  <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">
          Visa Categories
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-white">
          Tailored visa pathways
        </h2>
      </div>
      <div className="flex flex-wrap gap-3">
        {visaCategories?.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => onCategoryChange(category.key)}
            className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
              activeCategory === category.key
                ? "border-emerald-300 bg-emerald-300/10 text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)]"
                : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
            }`}
          >
            {category.title}
          </button>
        ))}
      </div>
    </div>

    {activeCategoryData && (
      <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr,1fr]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-white/50">
            {activeCategoryData.title} Visa
          </p>
          <h3 className="mt-4 text-2xl font-semibold text-white">
            {activeCategoryData.heading}
          </h3>
          <p className="mt-4 text-base text-white/70">
            {activeCategoryData.summary}
          </p>
          <ul className="mt-6 space-y-4 text-white/80">
            {activeCategoryData.requirements?.map((req) => (
              <li
                key={req}
                className="flex gap-3 rounded-2xl bg-white/5 p-4 text-sm"
              >
                <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-200">
                  ✓
                </span>
                {req}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-4">
          {activeCategoryData.stats?.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-white/10 bg-[#040c25] p-6 shadow-inner shadow-white/5"
            >
              <p className="text-sm text-white/60">{stat.label}</p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {stat.value}
              </p>
              <p className="text-sm text-emerald-200/80">{stat.helper}</p>
            </div>
          ))}
        </div>
      </div>
    )}
  </section>
);

export default VisaCategoriesSection;


