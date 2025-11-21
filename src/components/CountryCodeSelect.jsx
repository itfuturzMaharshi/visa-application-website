import { useState, useRef, useEffect } from "react";
import countriesData from "../data/countries.json";

const CountryCodeSelect = ({ value, onChange, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  const countries = countriesData.countries || [];

  // Normalize phone codes (handle cases like "+1-684" -> "+1")
  const normalizePhoneCode = (phoneCode) => {
    if (!phoneCode) return "";
    // Extract the main code before any dash
    const mainCode = phoneCode.split("-")[0].split(",")[0].trim();
    return mainCode;
  };

  // Filter countries based on search
  const filteredCountries = countries.filter((country) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      country.name.toLowerCase().includes(searchLower) ||
      country.phone_code.toLowerCase().includes(searchLower) ||
      country.code.toLowerCase().includes(searchLower)
    );
  });

  // Find selected country
  const selectedCountry = countries.find(
    (country) => normalizePhoneCode(country.phone_code) === value
  ) || countries.find((country) => country.phone_code === "+1"); // Default to US

  // Handle click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    // Use a small delay to avoid conflicts with click events
    const timeoutId = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSelect = (country, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    const phoneCode = normalizePhoneCode(country.phone_code);
    // Close dropdown first to ensure UI updates immediately
    setIsOpen(false);
    setSearchTerm("");
    // Then update the value
    onChange(phoneCode);
  };

  return (
    <div 
      className={`relative ${className}`} 
      ref={dropdownRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 transition hover:border-indigo-500 focus:border-indigo-500 focus:outline-none"
      >
        {selectedCountry && (
          <>
            <img
              src={selectedCountry.flag}
              alt={selectedCountry.name}
              className="h-5 w-5 shrink-0 rounded-sm object-cover"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <span className="text-sm font-medium">
              {normalizePhoneCode(selectedCountry.phone_code)}
            </span>
          </>
        )}
        <svg
          className={`ml-auto h-4 w-4 text-slate-500 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-2xl border border-slate-200 bg-white shadow-lg">
          <div className="sticky top-0 border-b border-slate-200 bg-white p-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500">
                No countries found
              </div>
            ) : (
              filteredCountries.map((country) => {
                const phoneCode = normalizePhoneCode(country.phone_code);
                const isSelected = phoneCode === value;
                return (
                  <button
                    key={`${country.code}-${country.phone_code}`}
                    type="button"
                    onClick={(e) => handleSelect(country, e)}
                    onMouseDown={(e) => e.preventDefault()}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-slate-50 ${
                      isSelected ? "bg-indigo-50 text-indigo-700" : "text-slate-900"
                    }`}
                  >
                    <img
                      src={country.flag}
                      alt={country.name}
                      className="h-5 w-5 shrink-0 rounded-sm object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <span className="flex-1 text-sm font-medium">
                      {country.name}
                    </span>
                    <span className="text-sm text-slate-500">{phoneCode}</span>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountryCodeSelect;

