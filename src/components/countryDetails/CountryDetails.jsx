import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HeroSection from "./HeroSection";
import OverviewSection from "./OverviewSection";
import VisaCategoriesSection from "./VisaCategoriesSection";
import DocumentsSection from "./DocumentsSection";
import FeesSection from "./FeesSection";
import StepsSection from "./StepsSection";
import FaqSection from "./FaqSection";
import CountryDetailsService from "../../services/coutryList/countryDetails.services";

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

const CountryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [countryData, setCountryData] = useState(null);
  const [dataUnavailable, setDataUnavailable] = useState(false);
  const [activeCategory, setActiveCategory] = useState("");
  const [activeFaqCategory, setActiveFaqCategory] = useState("general");
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchCountryDetails = async () => {
      if (!id) {
        setDataUnavailable(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      setDataUnavailable(false);
      try {
        const response = await CountryDetailsService.getDetails(id);
        if (response?.data) {
          const data = response.data;
          
          // Transform API data to component structure
          const transformedData = {
            _id: data.country._id,
            country: data.country.name,
            heroImage: assetUrl(data.country.bannerImage),
            icon: assetUrl(data.country.icon),
            flag: assetUrl(data.country.icon),
            description: data.country.description,
            details: data.details,
            tripPurposes: data.tripPurposes,
            faqs: data.faqs,
            // Transform tripPurposes to visaCategories format
            visaCategories: data.tripPurposes.map((purpose, index) => ({
              key: purpose.code.toLowerCase(),
              title: purpose.name,
              heading: purpose.description,
              summary: purpose.description,
              requirements: [],
              stats: [
                {
                  label: "Processing window",
                  value: data.details.visaProcessingTime,
                  helper: "Standard processing",
                },
                {
                  label: "Validity",
                  value: data.details.validityPeriod,
                  helper: data.details.entryType,
                },
              ],
            })),
            // Transform fees
            fees: [
              {
                type: "Standard",
                amount: `${data.details.currency} ${data.details.visaFee}`,
                processing: data.details.visaProcessingTime,
                validity: `${data.details.validityPeriod}, ${data.details.entryType} entry`,
              },
            ],
          };

          setCountryData(transformedData);
          if (transformedData.visaCategories.length > 0) {
            setActiveCategory(transformedData.visaCategories[0].key);
          }
          if (transformedData.faqs.length > 0) {
            // Extract unique categories and set initial FAQ category to first available
            const uniqueCategories = Array.from(
              new Set(transformedData.faqs.map((faq) => faq.category).filter(Boolean))
            );
            if (uniqueCategories.length > 0) {
              const firstCategory = uniqueCategories[0];
              setActiveFaqCategory(firstCategory);
              // Set first FAQ of the selected category as open
              const firstFaqInCategory = transformedData.faqs.find(
                (faq) => faq.category === firstCategory
              );
              if (firstFaqInCategory) {
                setOpenFaq(firstFaqInCategory._id);
              }
            }
          }
        } else {
          // No data in response
          setDataUnavailable(true);
        }
      } catch (error) {
        console.error("Failed to fetch country details:", error);
        // Don't redirect, just mark as unavailable
        setDataUnavailable(true);
      } finally {
        setLoading(false);
      }
    };

    fetchCountryDetails();
  }, [id]);

  const activeCategoryData = useMemo(() => {
    return (
      countryData?.visaCategories?.find((cat) => cat.key === activeCategory) ||
      countryData?.visaCategories?.[0]
    );
  }, [activeCategory, countryData?.visaCategories]);

  const filteredFaqs = useMemo(() => {
    if (!countryData?.faqs) return [];
    return countryData.faqs.filter(
      (faq) => faq.category === activeFaqCategory
    );
  }, [countryData?.faqs, activeFaqCategory]);

  // Extract unique FAQ categories from backend data
  const faqCategories = useMemo(() => {
    if (!countryData?.faqs) return [];
    const uniqueCategories = Array.from(
      new Set(countryData.faqs.map((faq) => faq.category).filter(Boolean))
    );
    return uniqueCategories.map((category) => ({
      key: category,
      label: category.charAt(0).toUpperCase() + category.slice(1).toLowerCase(),
    }));
  }, [countryData?.faqs]);

  const handleBack = () => {
    navigate("/");
    window?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#030920] text-white">
        <div className="flex flex-col items-center gap-3">
          <span
            className="inline-block h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white"
            aria-hidden="true"
          />
          <p className="text-sm text-white/70">Loading country details...</p>
        </div>
      </div>
    );
  }

  // Show data unavailable message if data is not available
  if (dataUnavailable || !countryData) {
    return (
      <div className="relative bg-[#030920] text-white min-h-screen">
        <div className="relative isolate overflow-hidden">
          <div className="absolute inset-0 bg-[#030920]/60 backdrop-blur-sm" />
          <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-6 px-4 pb-20 pt-24 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={handleBack}
              className="group inline-flex items-center gap-2 self-start rounded-full border border-white/20 px-4 py-2 text-sm font-medium text-white/80 transition hover:border-white hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/70"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-white/5 transition group-hover:-translate-x-1">
                ←
              </span>
              Back to Home
            </button>

            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-12 max-w-2xl">
                <div className="flex flex-col items-center gap-4">
                  <div className="rounded-full bg-white/10 p-4">
                    <svg
                      className="h-12 w-12 text-white/60"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-white">
                    Data is not available
                  </h2>
                  <p className="text-base text-white/70 max-w-md">
                    The country details for this destination are currently not available. Please check back later or contact support for assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#030920] text-white">
      <HeroSection country={countryData} onBack={handleBack} />
      <OverviewSection country={countryData} />
      <VisaCategoriesSection
        visaCategories={countryData.visaCategories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activeCategoryData={activeCategoryData}
      />
      <FeesSection fees={countryData.fees} />
      <FaqSection
        faqs={filteredFaqs}
        openFaq={openFaq}
        onToggleFaq={(id) => setOpenFaq((prev) => (prev === id ? null : id))}
        activeCategory={activeFaqCategory}
        onCategoryChange={setActiveFaqCategory}
        categories={faqCategories}
      />
    </div>
  );
};

export default CountryDetails;

