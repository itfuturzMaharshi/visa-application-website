import { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import CountryListService from "../services/coutryList/countryList.services";

const assetUrl = (path) => {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;
  const base =
    import.meta.env?.VITE_MEDIA_BASE_URL ||
    import.meta.env?.VITE_API_BASE_URL ||
    import.meta.env?.VITE_BASE_URL ||
    "";
  if (!base) return path;
  const formattedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const formattedPath = path.startsWith("/") ? path.slice(1) : path;
  return `${formattedBase}/${formattedPath}`;
};

const buildEtaLabel = (index) => {
  const date = new Date();
  date.setDate(date.getDate() + (index % 5));
  date.setHours(9 + (index % 8), (index * 17) % 60);
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const buildVisaLabel = (index) => `${30 + index * 2}K+ Visas on Time`;

const placeholderImage =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80";
const placeholderIcon =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=200&q=60";

const currencies = ["USD", "EUR", "GBP", "JPY", "AED", "SGD", "CAD"];
const languages = ["English", "Spanish", "French", "Arabic", "Mandarin", "German"];
const seasons = [
  "Spring bloom",
  "Summer coastline",
  "Autumn lights",
  "Winter festivals",
  "Year-round",
];

const buildHighlightBlock = (country, index) => {
  const name = country?.name || "Destination";
  return [
    {
      label: "Capital",
      icon: "capital",
      value: country?.capital || `${name} City`,
    },
    {
      label: "Currency",
      icon: "currency",
      value: country?.currency || currencies[index % currencies.length],
    },
    {
      label: "Language",
      icon: "language",
      value: country?.language || languages[index % languages.length],
    },
    {
      label: "Travel Time",
      icon: "travel",
      value: `${7 + (index % 6)}h avg flight`,
    },
    {
      label: "Best Season",
      icon: "season",
      value: seasons[index % seasons.length],
    },
  ];
};

const buildVisaCategories = (name, index) => {
  const baseRequirements = [
    "Passport validity beyond 6 months from arrival",
    "Recent bank statements reflecting solvency",
    "Confirmed travel itinerary & accommodation proof",
    "Professional photograph aligned with ICAO standards",
  ];

  return [
    {
      key: "tourist",
      title: "Tourist",
      heading: `Experience ${name} with curated itineraries`,
      summary: `Optimized for leisure stays of up to ${14 + (index % 4) * 5} days with concierge scheduling and priority interview slots.`,
      requirements: baseRequirements,
      stats: [
        {
          label: "Processing window",
          value: "5-7 days",
          helper: "Expedite in 48h on request",
        },
        {
          label: "Approval rate",
          value: "98.4%",
          helper: "Based on 6k+ cases",
        },
      ],
    },
    {
      key: "business",
      title: "Business",
      heading: `Accelerated access for executive travel`,
      summary:
        "Includes invitation vetting, compliance review, and dedicated mission desks for C-level travelers.",
      requirements: [
        "Corporate invitation on letterhead",
        "Proof of employment or incorporation documents",
        "Travel insurance covering the full stay",
        "Last three salary slips or audited statements",
      ],
      stats: [
        {
          label: "Processing window",
          value: "3-5 days",
          helper: "Dedicated advisor",
        },
        {
          label: "Validity",
          value: "1 year multi-entry",
          helper: "Subject to profile",
        },
      ],
    },
    {
      key: "student",
      title: "Student",
      heading: "Admissions-aligned visas with guardian support",
      summary:
        "Document preparation, CAS verification, and visa interview simulations for global campuses.",
      requirements: [
        "Offer letter from accredited institution",
        "Tuition payment receipt or scholarship letter",
        "Academic transcripts & language proficiency",
        "Financial sponsorship proof / Form I-20 equivalent",
      ],
      stats: [
        {
          label: "Processing window",
          value: "10-15 days",
          helper: "Aligned to intake window",
        },
        {
          label: "Stay duration",
          value: "Course length",
          helper: "Extendable on campus",
        },
      ],
    },
    {
      key: "work",
      title: "Work",
      heading: "Global mobility for skilled professionals",
      summary:
        "End-to-end coordination with employer HR, compliance, and mobility documentation.",
      requirements: [
        "Employment contract & role description",
        "Professional credentials / license copies",
        "Background verification documents",
        "Medical certificate / biometrics confirmation",
      ],
      stats: [
        {
          label: "Processing window",
          value: "20-30 days",
          helper: "Depends on sector",
        },
        {
          label: "Validity",
          value: "2-3 years",
          helper: "Renewable in-country",
        },
      ],
    },
    {
      key: "transit",
      title: "Transit",
      heading: "Same-day approvals for short layovers",
      summary:
        "Ideal for itineraries with airport transfers exceeding 6 hours or terminal changes.",
      requirements: [
        "Confirmed onward ticket",
        "Visa for the final destination if required",
        "Airport transfer details",
        "Proof of funds for incidental expenses",
      ],
      stats: [
        {
          label: "Processing window",
          value: "24 hours",
          helper: "Digital submission",
        },
        {
          label: "Stay duration",
          value: "Up to 96 hours",
          helper: "Single-entry",
        },
      ],
    },
  ];
};

const baseDocuments = [
  "Valid passport with 6+ months remaining and three blank pages",
  "Recent biometric photograph (white background, matte print)",
  "Confirmed flights and premium accommodation reservation",
  "Comprehensive travel insurance covering medical & evacuation",
  "Employer / business letter explaining travel intent",
  "Bank statements or proof of funds for the full stay",
];

const baseFees = (index) => [
  {
    type: "Tourist",
    amount: `$${85 + index * 2}`,
    processing: "5-7 business days",
    validity: "90 days, single entry",
  },
  {
    type: "Business",
    amount: `$${140 + index * 3}`,
    processing: "3-5 business days",
    validity: "1 year, multi-entry",
  },
  {
    type: "Student",
    amount: `$${160 + index * 4}`,
    processing: "10-15 business days",
    validity: "Course duration",
  },
  {
    type: "Work",
    amount: `$${210 + index * 5}`,
    processing: "20-30 business days",
    validity: "Up to 3 years",
  },
  {
    type: "Transit",
    amount: `$${40 + index * 2}`,
    processing: "24 hours",
    validity: "96 hours",
  },
];

const baseSteps = [
  {
    stage: "Briefing",
    title: "Kick-off with senior visa concierge",
    copy: "Personalized consultation covering eligibility, timelines, and risk mitigation tailored to your itinerary.",
  },
  {
    stage: "Documents",
    title: "Curate and polish documentation",
    copy: "We audit every form, translate supporting papers, and notarize entries for embassy-ready submissions.",
  },
  {
    stage: "Submission",
    title: "Biometrics & embassy filing",
    copy: "Priority slots, escort service when available, and proactive embassy coordination with live status updates.",
  },
  {
    stage: "Delivery",
    title: "Visa issuance and travel prep",
    copy: "Receive a digital vault, compliance checklist, and arrival briefing for seamless border control.",
  },
];

const baseFaqs = (countryName, index) => [
  {
    id: `timeline-${index}`,
    question: "How early should I apply for my visa?",
    answer: `We recommend securing your ${countryName} visa 4-6 weeks ahead. This allows buffer time for biometrics, embassy capacity, and any compliance clarifications.`,
  },
  {
    id: `documents-${index}`,
    question: "Can you help with missing documents?",
    answer:
      "Yes. Our documentation desk formats financial statements, arranges translations, and issues affidavits wherever necessary.",
  },
  {
    id: `passport-${index}`,
    question: "Is my passport collected or couriered?",
    answer:
      "Whichever you prefer. We provide insured pick-up, embassy handover, and premium courier delivery with live tracking.",
  },
  {
    id: `status-${index}`,
    question: "How often will I receive status updates?",
    answer:
      "Expect milestone alerts at every event—submission, biometrics, approval, and dispatch—across email, SMS, and WhatsApp.",
  },
];

const buildCountryDetail = (country, index) => {
  const name = country?.name || "Destination";
  const heroImage = assetUrl(country?.detailBanner) || assetUrl(country?.bannerImage) || placeholderImage;
  const flag = assetUrl(country?.flag) || assetUrl(country?.icon) || placeholderIcon;
  return {
    key: country?._id || `${country?.code || "country"}-${index}`,
    country: name,
    image: heroImage,
    icon: flag,
    heroImage,
    flag,
    breadcrumb: ["Home", "Destinations", name],
    responseTime: `${4 + (index % 4)}h concierge reply`,
    serviceWindow: "24h global desk",
    overview: {
  
      description:
        country?.description ||
        `From curated itineraries to policy intelligence, our specialists orchestrate a premium ${name} journey with verified compliance and embassy alignment.`,
      highlights: buildHighlightBlock(country, index),
      mapFacts: [
        "Live mission tracking",
        "Embassy-aligned advisors",
        "Secure document vault",
      ],
    },
    visaCategories: buildVisaCategories(name, index),
    documents: baseDocuments,
    fees: baseFees(index),
    steps: baseSteps,
    faqs: baseFaqs(name, index),
  };
};

const Destinations = ({ onSelectDestination }) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const response = await CountryListService.list({ page: 1, limit: 50 });
        const docs = response?.data?.docs || response?.data || [];
        const sorted = [...docs].sort(
          (a, b) => (a?.displayOrder ?? 999) - (b?.displayOrder ?? 999)
        );
        if (active) {
          setCountries(sorted);
          setLoading(false);
        }
      } catch (err) {
        // Keep loading state true to continue showing loader
        // Don't set error or stop loading on failure
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const destinations = useMemo(() => {
    if (!countries.length) return [];
    return countries.map((country, index) => {
      const detail = buildCountryDetail(country, index);
      return {
        ...detail,
        visas: buildVisaLabel(index),
        eta: buildEtaLabel(index),
      };
    });
  }, [countries]);

  const handleDestinationSelect = (destination) => {
    if (typeof onSelectDestination === "function") {
      onSelectDestination(destination);
      window?.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section
      id="destinations"
      className="relative overflow-hidden bg-linear-to-b from-[#030b1a] via-[#05132b] to-[#071a3d]  text-white"
    >
      <div className="relative mx-auto  p-8">
        {loading && (
          <div className="mb-6 flex flex-col items-center gap-3 text-blue-100/70">
            <span
              className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-100/30 border-t-blue-100"
              aria-hidden="true"
            />
          </div>
        )}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(destinations.length ? destinations : []).map(
            (destination, index) => (
              <Reveal key={destination.key} delay={index * 60}>
                <article
                  tabIndex={0}
                  role="button"
                  onClick={() => handleDestinationSelect(destination)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      handleDestinationSelect(destination);
                    }
                  }}
                  className="group relative flex h-80 flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl shadow-slate-950/40 transition hover:-translate-y-1 hover:border-white/30 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/70"
                >
                  <img
                    src={destination.image}
                    alt={destination.country}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-b from-slate-950/10 via-slate-950/40 to-slate-950/90" />
                  <div className="relative z-10 flex flex-1 flex-col justify-between p-6">
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-blue-100/70">
                      <span>Mission Desk</span>
                      <span>{destination.eta}</span>
                    </div>
                    <div>
                      <h3 className="flex items-center gap-3 text-2xl font-semibold text-white">
                        <span className="truncate">{destination.country}</span>
                        <span className="relative flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/20 bg-white/10">
                          <img
                            src={destination.icon}
                            alt=""
                            className="block h-full w-full object-cover"
                            loading="lazy"
                          />
                        </span>
                      </h3>
                      <p className="mt-2 text-sm text-blue-100/80">
                        {destination.visas}
                      </p>
                      <div className="mt-4 flex items-center gap-3 text-xs text-blue-100/60">
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                          Concierge ready
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1">
                          Track
                          <span aria-hidden>→</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          )}
        </div>
      </div>
    </section>
  );
};

export default Destinations;
