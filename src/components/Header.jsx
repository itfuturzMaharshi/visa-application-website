import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthService from "../services/auth/auth.services";

const navLinks = [
  { label: "Home", type: "route", to: "/" },
  { label: "Destinations", type: "section", sectionId: "destinations" },
  { label: "Pricing", type: "section", sectionId: "pricing" },
  { label: "Apply Now", type: "section", sectionId: "hero" },
  { label: "Contact", type: "section", sectionId: "contact" },
];

const HeaderUserMenu = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (storedUser && token) {
      setIsLoggedIn(true);
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed?.fullName) {
          setUserName(parsed.fullName);
        } else if (parsed?.name) {
          setUserName(parsed.name);
        }
      } catch {
        setUserName("Traveler");
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = userName
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleProfile = () => {
    setOpen(false);
    navigate("/user-details");
    onNavigate?.();
  };

  const handleLogout = async () => {
    setOpen(false);
    try {
      await AuthService.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      navigate("/login");
      onNavigate?.();
    }
  };

  if (!isLoggedIn) {
    return (
      <button
        onClick={() => navigate("/login")}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Login
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        aria-label="Open user menu"
        className="group flex items-center gap-3 rounded-full border border-white/30 bg-white/5 px-3 py-1.5 text-left text-sm text-white/90 shadow-lg shadow-slate-900/20 transition hover:border-white/60 hover:bg-white/10"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="hidden text-xs uppercase tracking-[0.3em] text-white/60 lg:inline">
          Account
        </span>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-blue-400 via-indigo-400 to-cyan-400 text-base font-semibold text-slate-900">
          {initials}
        </span>
        <svg
          className={`h-4 w-4 text-white/60 transition ${
            open ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m6 9 6 6 6-6" />
        </svg>
      </button>
      <div
        className={`absolute right-0 mt-3 w-48 origin-top-right rounded-2xl border border-white/10 bg-[#0d1a3c] p-2 text-sm text-white/90 shadow-2xl ring-1 ring-white/10 transition-all duration-200 ${
          open
            ? "pointer-events-auto scale-100 opacity-100"
            : "pointer-events-none scale-95 opacity-0"
        }`}
      >
        <p className="px-3 pb-2 text-xs uppercase tracking-[0.2em] text-white/60">
          Quick Actions
        </p>
        <button
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition hover:bg-white/10"
          onClick={handleProfile}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.5 19.5a7.5 7.5 0 0 1 15 0"
              />
            </svg>
          </span>
          Profile
        </button>
        <button
          className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-rose-200 transition hover:bg-rose-500/10"
          onClick={handleLogout}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rose-500/20 text-rose-200">
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.8}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6A2.25 2.25 0 0 0 5.25 5.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
              />
            </svg>
          </span>
          Logout
        </button>
      </div>
    </div>
  );
};

const MobileNav = ({ open, onClose, onSectionNavigate }) => (
  <>
    <div
      className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      onClick={onClose}
    />
    <aside
      className={`fixed inset-y-0 right-0 z-50 w-72 bg-white px-6 py-8 shadow-2xl transition-transform duration-300 md:hidden ${
        open ? "translate-x-0" : "translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-semibold text-slate-900">VisaFlow</span>
        <button
          aria-label="Close menu"
          className="rounded-full border border-slate-200 p-2 text-slate-600 transition hover:text-slate-900"
          onClick={onClose}
        >
          <span className="block h-3 w-3 rotate-45 border border-current border-l-0 border-t-0" />
        </button>
      </div>
      <nav className="mt-8 flex flex-col gap-4 text-base font-medium text-slate-700">
        {navLinks.map((link) =>
          link.type === "route" ? (
            <Link
              key={link.label}
              to={link.to}
              className="rounded-lg px-3 py-2 transition hover:bg-slate-100"
              onClick={onClose}
            >
              {link.label}
            </Link>
          ) : (
            <button
              key={link.label}
              type="button"
              className="text-left rounded-lg px-3 py-2 transition hover:bg-slate-100"
              onClick={() => {
                onSectionNavigate?.(link.sectionId);
                onClose();
              }}
            >
              {link.label}
            </button>
          )
        )}
      </nav>
      <div className="mt-10 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm text-slate-600">
          Ready to begin your visa journey? Our experts respond within 24 hrs.
        </p>
        <div className="mt-4 rounded-xl border border-dashed border-slate-200 p-3 text-xs font-medium text-slate-500">
          Concierge desk · 24/7 visa professionals · Multilingual support
        </div>
      </div>
    </aside>
  </>
);

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToSection = useCallback((sectionId) => {
    if (!sectionId) return;
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && location.state?.scrollTo) {
      const sectionId = location.state.scrollTo;
      requestAnimationFrame(() => {
        scrollToSection(sectionId);
        navigate(location.pathname, { replace: true, state: null });
      });
    }
  }, [location, navigate, scrollToSection]);

  const handleSectionNavigate = useCallback(
    (sectionId) => {
      if (!sectionId) return;
      if (location.pathname !== "/") {
        navigate("/", { state: { scrollTo: sectionId } });
      } else {
        scrollToSection(sectionId);
      }
    },
    [location.pathname, navigate, scrollToSection]
  );

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <header
        id="home"
        className="sticky top-0 z-50 text-white shadow-lg shadow-slate-900/30"
      >
      
        <div className="bg-linear-to-r from-[#041535] via-[#07224c] to-[#0a2f63]">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-3 font-semibold">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-lg">
                VF
              </span>
              <div>
                <p className="text-2xl tracking-tight">VisaFlow</p>
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                  Global Desk
                </p>
              </div>
            </Link>
            <nav className="hidden items-center gap-6 text-sm font-medium text-blue-100/90 md:flex">
              {navLinks.map((link) =>
                link.type === "route" ? (
                  <Link
                    key={link.label}
                    to={link.to}
                    className="relative after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-white after:transition-transform hover:text-white hover:after:scale-x-100"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => handleSectionNavigate(link.sectionId)}
                    className="relative text-left after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-white after:transition-transform hover:text-white hover:after:scale-x-100"
                  >
                    {link.label}
                  </button>
                )
              )}
            </nav>
            <div className="flex items-center gap-3">
              <HeaderUserMenu />
              <button
                aria-label="Open menu"
                className="rounded-full border border-white/30 p-2 text-white transition hover:border-white/60 md:hidden"
                onClick={() => setMenuOpen(true)}
              >
                <span className="block h-0.5 w-5 bg-current" />
                <span className="mt-1 block h-0.5 w-5 bg-current" />
                <span className="mt-1 block h-0.5 w-5 bg-current" />
              </button>
            </div>
          </div>
        </div>
      </header>
      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        onSectionNavigate={handleSectionNavigate}
      />
    </>
  );
};

export default Header;

