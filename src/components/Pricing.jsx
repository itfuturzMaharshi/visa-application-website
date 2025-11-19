import Reveal from "./Reveal";

const tiers = [
  {
    name: "Explorer",
    price: "$79",
    description: "Self-serve toolkit for standard tourist visas.",
    perks: ["Guided checklist", "Smart document scans", "48h email support"],
    highlighted: false,
  },
  {
    name: "Priority",
    price: "$189",
    description: "Hands-on specialists accelerate complex cases.",
    perks: [
      "Dedicated visa expert",
      "Expedited reviews",
      "Same-day status alerts",
    ],
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "Custom playbooks for teams, schools, and corporates.",
    perks: [
      "Bulk applicant console",
      "Compliance reporting",
      "24/7 white-glove care",
    ],
    highlighted: false,
  },
];

const Pricing = () => (
  <section id="pricing" className="bg-white px-4 pb-16 pt-12 sm:px-6">
    <div className="mx-auto max-w-6xl">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-purple-500">
            Pricing
          </p>
          <h2 className="mt-3 text-3xl font-semibold text-slate-900 sm:text-4xl">
            Simple plans that flex with your travel goals.
          </h2>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Transparent, all-inclusive pricing backed by secure payments and
            embassy-grade compliance.
          </p>
        </Reveal>
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {tiers.map((tier, index) => (
          <Reveal key={tier.name} delay={index * 80}>
            <div
              className={`h-full rounded-[32px] border p-8 shadow-lg transition hover:-translate-y-1.5 hover:shadow-2xl ${
                tier.highlighted
                  ? "border-[#5f7cff]/30 bg-linear-to-b from-[#edf1ff] via-white to-white"
                  : "border-slate-100 bg-white"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-slate-900">
                  {tier.name}
                </h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                  {tier.highlighted ? "Most popular" : "Flexible"}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600">{tier.description}</p>
              <p className="mt-6 text-4xl font-semibold text-slate-900">
                {tier.price}
                <span className="text-base font-medium text-slate-500">
                  {tier.price === "Custom" ? "" : " / applicant"}
                </span>
              </p>
              <ul className="mt-6 space-y-3 text-sm text-slate-600">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2">
                    <span className="mt-1 h-2 w-2 rounded-full bg-[#5f7cff]" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-8 w-full rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                  tier.highlighted
                    ? "bg-[#5f7cff] text-white shadow-lg shadow-[#5f7cff]/30 hover:bg-[#4d64d5]"
                    : "border border-slate-200 text-slate-900 hover:border-slate-300"
                }`}
              >
                {tier.price === "Custom" ? "Talk to us" : "Choose plan"}
              </button>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default Pricing;

