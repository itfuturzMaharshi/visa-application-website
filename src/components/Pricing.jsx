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

const guarantees = [
  "ISO 27001 secure vault & biometric handling",
  "Dedicated success pods for every approved case",
  "Flat pricing with zero surprise embassy fees",
];

const Pricing = () => (
  <section
    id="pricing"
    className="bg-linear-to-b from-[#071a3d] via-[#05132b] to-[#030b1a] px-4 py-24 text-white sm:px-6"
  >
    <div className="relative mx-auto max-w-6xl">
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <p className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-blue-100/80">
            Pricing Suite
            <span className="h-1 w-1 rounded-full bg-emerald-300" />
          </p>
          <h2 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
            Transparent retainers. Concierge approvals.
          </h2>
          <p className="mt-4 text-base text-blue-100/80">
            Every subscription unlocks real-time embassy intelligence, secure
            document orchestration, and a dedicated visa architect focused on
            your itinerary.
          </p>
        </Reveal>
      </div>
      <div className="mt-16 grid gap-6 lg:grid-cols-3">
        {tiers.map((tier, index) => (
          <Reveal key={tier.name} delay={index * 80}>
            <div
              className={`relative flex h-full flex-col rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:-translate-y-1.5 hover:border-white/30 ${
                tier.highlighted ? "shadow-2xl shadow-emerald-500/20" : ""
              }`}
            >
              {tier.highlighted && (
                <span className="absolute -top-3 right-6 rounded-full bg-emerald-400/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">
                  Best fit
                </span>
              )}
              <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-blue-100/70">
                <span>{tier.name}</span>
                <span>{tier.highlighted ? "Priority desk" : "Flexible"}</span>
              </div>
              <h3 className="mt-4 text-4xl font-semibold text-white">
                {tier.price}
                <span className="text-base font-medium text-blue-100/70">
                  {tier.price === "Custom" ? "" : " / applicant"}
                </span>
              </h3>
              <p className="mt-3 text-sm text-blue-100/80">{tier.description}</p>
              <ul className="mt-6 space-y-3 text-sm text-blue-50/90">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
              <button
                className={`mt-10 w-full rounded-2xl px-6 py-3 text-sm font-semibold transition ${
                  tier.highlighted
                    ? "bg-emerald-400 text-slate-900 shadow-xl shadow-emerald-500/40 hover:bg-emerald-300"
                    : "border border-white/20 text-white hover:border-white/40"
                }`}
              >
                {tier.price === "Custom" ? "Book strategy call" : "Choose plan"}
              </button>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="mt-16 grid gap-6 rounded-[32px] border border-white/10 bg-white/5 p-8 text-sm text-blue-100/80 backdrop-blur md:grid-cols-3">
        {guarantees.map((item) => (
          <div key={item} className="flex items-start gap-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-emerald-300" />
            <p>{item}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Pricing;

