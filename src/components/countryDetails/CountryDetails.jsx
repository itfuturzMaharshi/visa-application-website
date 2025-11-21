import { useMemo, useState } from "react";
import HeroSection from "./HeroSection";
import OverviewSection from "./OverviewSection";
import VisaCategoriesSection from "./VisaCategoriesSection";
import DocumentsSection from "./DocumentsSection";
import FeesSection from "./FeesSection";
import StepsSection from "./StepsSection";
import FaqSection from "./FaqSection";
import CallToActionSection from "./CallToActionSection";
import DetailsFooter from "./DetailsFooter";
import MobileStickyCTA from "./MobileStickyCTA";

const CountryDetails = ({ country, onBack }) => {
  const [activeCategory, setActiveCategory] = useState(
    country?.visaCategories?.[0]?.key || ""
  );
  const [openFaq, setOpenFaq] = useState(country?.faqs?.[0]?.id || null);

  const activeCategoryData = useMemo(() => {
    return (
      country?.visaCategories?.find((cat) => cat.key === activeCategory) ||
      country?.visaCategories?.[0]
    );
  }, [activeCategory, country?.visaCategories]);

  if (!country) return null;

  return (
    <div className="relative bg-[#030920] text-white">
      <MobileStickyCTA />
      <HeroSection country={country} onBack={onBack} />
      <OverviewSection country={country} />
      <VisaCategoriesSection
        visaCategories={country.visaCategories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        activeCategoryData={activeCategoryData}
      />
      {/* <DocumentsSection documents={country.documents} /> */}
      <FeesSection fees={country.fees} />
      {/* <StepsSection steps={country.steps} /> */}
      <FaqSection
        faqs={country.faqs}
        openFaq={openFaq}
        onToggleFaq={(id) => setOpenFaq((prev) => (prev === id ? null : id))}
      />
      <CallToActionSection country={country} />
      <DetailsFooter country={country} />
    </div>
  );
};

export default CountryDetails;

