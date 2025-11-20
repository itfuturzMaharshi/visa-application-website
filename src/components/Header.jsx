import { useEffect, useState } from "react";

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Destinations", href: "#destinations" },
  { label: "Pricing", href: "#pricing" },
  { label: "Apply Now", href: "#hero" },
  { label: "Contact", href: "#contact" },
];

const MobileNav = ({ open, onClose }) => (
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
        {navLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            className="rounded-lg px-3 py-2 transition hover:bg-slate-100"
            onClick={onClose}
          >
            {link.label}
          </a>
        ))}
      </nav>
      <div className="mt-10 rounded-2xl bg-slate-50 p-4">
        <p className="text-sm text-slate-600">
          Ready to begin your visa journey? Our experts respond within 24 hrs.
        </p>
        <a
          href="#hero"
          className="mt-4 block rounded-xl bg-slate-900 px-4 py-2 text-center text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Start Application
        </a>
      </div>
    </aside>
  </>
);

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

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
            <a href="#home" className="flex items-center gap-3 font-semibold">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/30 bg-white/10 text-lg">
                VF
              </span>
              <div>
                <p className="text-2xl tracking-tight">VisaFlow</p>
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">
                  Global Desk
                </p>
              </div>
            </a>
            <nav className="hidden items-center gap-6 text-sm font-medium text-blue-100/90 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="relative after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:scale-x-0 after:bg-white after:transition-transform hover:text-white hover:after:scale-x-100"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="hidden items-center gap-4 md:flex">
              <button className="text-sm font-semibold text-blue-100 transition hover:text-white">
                Client Portal
              </button>
              <a
                href="#hero"
                className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur-lg transition hover:-translate-y-0.5 hover:bg-white/20"
              >
                Start Application
              </a>
            </div>
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
      </header>
      <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
};

export default Header;

