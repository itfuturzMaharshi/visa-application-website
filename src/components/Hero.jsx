import { useEffect, useMemo, useRef, useState } from "react";
import CountryListService from "../services/coutryList/countryList.services";
import TripPurposeService from "../services/tripPurpose/tripPurpose.services";
import CountryChecklistService from "../services/countryCheckList/countryCheckList.services";
import ChecklistModal from "./countryDetails/ChecklistModal";

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

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [request, setRequest] = useState({
    destination: "",
    purpose: "",
  });
  const [result, setResult] = useState("");
  const [formError, setFormError] = useState("");
  const [countryList, setCountryList] = useState([]);
  const [countryLoading, setCountryLoading] = useState(false);
  const [showCountryList, setShowCountryList] = useState(false);
  const [tripPurposes, setTripPurposes] = useState([]);
  const [purposeLoading, setPurposeLoading] = useState(false);
  const [purposeError, setPurposeError] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [purposeCache, setPurposeCache] = useState({});
  const countryDropdownRef = useRef(null);
  const [checklistModalOpen, setChecklistModalOpen] = useState(false);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [checklistError, setChecklistError] = useState("");
  const [checklistData, setChecklistData] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let active = true;
    const loadPurposes = async () => {
      if (!selectedCountry?._id) {
        setTripPurposes([]);
        setPurposeError(selectedCountry ? "No trip purposes found." : "");
        setRequest((prev) => ({ ...prev, purpose: "" }));
        return;
      }

      if (purposeCache[selectedCountry._id]) {
        const cached = purposeCache[selectedCountry._id];
        if (active) {
          setTripPurposes(cached);
          setPurposeError(cached.length ? "" : "No trip purposes found.");
          setRequest((prev) => ({
            ...prev,
            purpose: cached[0]?.name || "",
          }));
        }
        return;
      }

      setPurposeLoading(true);
      setPurposeError("");
      try {
        const response = await TripPurposeService.list({
          countryId: selectedCountry._id,
        });
        if (!active) return;
        const payload = response?.data?.docs || response?.data || [];
        const normalized = Array.isArray(payload)
          ? payload
          : payload
          ? [payload]
          : [];
        setTripPurposes(normalized);
        setPurposeCache((prev) => ({
          ...prev,
          [selectedCountry._id]: normalized,
        }));
        setPurposeError(normalized.length ? "" : "No trip purposes found.");
        setRequest((prev) => ({
          ...prev,
          purpose: normalized[0]?.name || "",
        }));
      } catch (error) {
        if (active) {
          setTripPurposes([]);
          setPurposeError(
            error?.response?.data?.message ||
              "Unable to load trip purposes for this country."
          );
          setRequest((prev) => ({ ...prev, purpose: "" }));
        }
      } finally {
        if (active) {
          setPurposeLoading(false);
        }
      }
    };

    loadPurposes();
    return () => {
      active = false;
    };
  }, [selectedCountry, purposeCache]);

  const fetchCountryList = async () => {
    if (countryLoading || countryList.length) return;
    setCountryLoading(true);
    try {
      const response = await CountryListService.list({ page: 1, limit: 100 });
      const docs = response?.data?.docs || response?.data || [];
      setCountryList(docs);
    } catch (error) {
      // error toasted inside service
    } finally {
      setCountryLoading(false);
    }
  };

  const handleCountryFieldFocus = () => {
    setShowCountryList(true);
    fetchCountryList();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target)
      ) {
        setShowCountryList(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = useMemo(() => {
    if (!request.destination.trim()) return countryList;
    return countryList.filter((country) =>
      country?.name
        ?.toLowerCase()
        .includes(request.destination.trim().toLowerCase())
    );
  }, [countryList, request.destination]);

  const handleCountrySelect = (country) => {
    const selection =
      country?.name ||
      country?.country ||
      country?.title ||
      country?.displayName ||
      "";
    setSelectedCountry(country?._id ? country : null);
    setRequest((prev) => ({ ...prev, destination: selection }));
    setShowCountryList(false);
    setResult("");
    setFormError("");
  };

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
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
            <form
              className="flex flex-col gap-4 lg:flex-row"
              onSubmit={async (event) => {
                event.preventDefault();
                if (!request.destination.trim() || !request.purpose) {
                  setFormError("Please add both destination and travel purpose.");
                  setResult("");
                  return;
                }
                if (!selectedCountry?._id) {
                  setFormError("Please select a valid country from the list.");
                  setResult("");
                  return;
                }
                const selectedPurpose = tripPurposes.find(
                  (p) => p.name === request.purpose
                );
                if (!selectedPurpose?._id) {
                  setFormError("Please select a valid travel purpose.");
                  setResult("");
                  return;
                }
                setFormError("");
                setResult("");
                setChecklistError("");
                setChecklistData(null);
                setChecklistLoading(true);
                setChecklistModalOpen(true);
                try {
                  const response = await CountryChecklistService.getChecklist({
                    countryId: selectedCountry._id,
                    tripPurposeId: selectedPurpose._id,
                  });
                  if (response?.data) {
                    setChecklistData(response.data);
                  } else {
                    setChecklistError(
                      response?.message ||
                        "Checklist not available for this combination."
                    );
                  }
                } catch (error) {
                  setChecklistError(
                    error?.response?.data?.message ||
                      "Unable to load checklist right now."
                  );
                } finally {
                  setChecklistLoading(false);
                }
              }}
            >
              <div
                className="relative flex-1 text-sm text-blue-100/80"
                ref={countryDropdownRef}
              >
                <label>
                  Destination Country
                  <input
                    type="text"
                    placeholder="e.g. Canada, UAE, Schengen"
                    value={request.destination}
                    autoComplete="off"
                    onFocus={handleCountryFieldFocus}
                    onClick={handleCountryFieldFocus}
                    onChange={(event) => {
                      const value = event.target.value;
                      setRequest((prev) => ({
                        ...prev,
                        destination: value,
                      }));
                      if (
                        selectedCountry &&
                        value.trim() !==
                          (selectedCountry.name || "").trim()
                      ) {
                        setSelectedCountry(null);
                      }
                    }}
                    className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-emerald-300 focus:outline-none"
                  />
                </label>
                {showCountryList && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 max-h-64 overflow-y-auto rounded-2xl border border-white/15 bg-slate-950/90 backdrop-blur">
                    {countryLoading ? (
                      <p className="px-4 py-3 text-sm text-blue-100/80">
                        Loading destinations...
                      </p>
                    ) : filteredCountries.length ? (
                      filteredCountries.map((country) => {
                        const key =
                          country?._id || country?.code || country?.name;
                        const flagSrc =
                          assetUrl(country?.flag) ||
                          assetUrl(country?.icon) ||
                          assetUrl(country?.logo) ||
                          "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Globe_icon.svg/48px-Globe_icon.svg.png";
                        return (
                          <button
                            type="button"
                            key={key}
                            className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-white transition hover:bg-white/10"
                            onClick={() => handleCountrySelect(country)}
                          >
                            <img
                              src={flagSrc}
                              alt={country?.name || "Flag"}
                              className="h-6 w-6 rounded-full object-cover"
                              loading="lazy"
                            />
                            <span>{country?.name || "Unnamed country"}</span>
                          </button>
                        );
                      })
                    ) : (
                      <p className="px-4 py-3 text-sm text-blue-100/80">
                        No countries found.
                      </p>
                    )}
                  </div>
                )}
              </div>
              <label className="flex-1 text-sm text-blue-100/80">
                Travel Purpose
                <select
                  className="mt-2 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder:text-white/50 focus:border-emerald-300 focus:outline-none"
                  value={request.purpose}
                  onChange={(event) => {
                    setRequest((prev) => ({
                      ...prev,
                      purpose: event.target.value,
                    }));
                    setFormError("");
                    setResult("");
                  }}
                  disabled={!selectedCountry || (purposeLoading && !tripPurposes.length)}
                >
                  <option className="text-slate-900" value="" disabled>
                    {!selectedCountry
                      ? "Select a country first"
                      : purposeLoading
                      ? "Loading travel purposes..."
                      : "Select travel purpose"}
                  </option>
                  {tripPurposes.map((purpose) => (
                    <option
                      key={purpose._id || purpose.code || purpose.name}
                      value={purpose.name}
                      className="text-slate-900"
                    >
                      {purpose.name}
                    </option>
                  ))}
                </select>
                {purposeError && (
                  <p className="mt-2 text-xs text-rose-200">{purposeError}</p>
                )}
              </label>
              <button
                type="submit"
                className="mt-2 w-full rounded-xl bg-emerald-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-500/30 transition hover:-translate-y-0.5 hover:bg-emerald-300 lg:mt-8 lg:max-w-[180px]"
              >
                Apply Now
              </button>
            </form>
            {formError && (
              <p className="mt-4 text-xs text-rose-200">{formError}</p>
            )}
            {result && (
              <p className="mt-4 rounded-xl border border-emerald-300/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
                {result}
              </p>
            )}
            {!result && !formError && (
              <p className="mt-4 text-xs text-blue-100/70">
                Our concierge team replies in under 30 minutes on business days.
              </p>
            )}
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
      {checklistModalOpen && (
        <ChecklistModal
          open={checklistModalOpen}
          loading={checklistLoading}
          error={checklistError}
          checklist={checklistData}
          onClose={() => {
            setChecklistModalOpen(false);
            setChecklistData(null);
            setChecklistError("");
          }}
        />
      )}
    </section>
  );
};

export default Hero;

