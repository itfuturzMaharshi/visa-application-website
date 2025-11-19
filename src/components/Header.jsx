import { useEffect, useState } from "react";

const navLinks = [
  { label: "Programs", href: "#destinations" },
  { label: "Pricing", href: "#pricing" },
  { label: "Guarantee", href: "#contact" },
  { label: "Support", href: "#contact" },
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
        <span className="text-lg font-semibold">VisaFlow</span>
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
        <button className="mt-4 w-full rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/20 transition hover:-translate-y-0.5 hover:bg-slate-800">
          Apply now
        </button>
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
      <header id="home" className="bg-white text-slate-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between gap-6 border-b border-slate-100">
            <a href="#home" className="flex items-center gap-2 font-semibold text-slate-900">
              <span className="text-2xl tracking-tight">VisaFlow</span>
              <span className="hidden rounded-full bg-slate-100 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-500 sm:inline-flex">
                on time
              </span>
            </a>
            <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="transition hover:text-slate-900"
                >
                  {link.label}
                </a>
              ))}
            </nav>
            <div className="hidden items-center gap-3 md:flex">
              <button className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
                Log in
              </button>
              <a
                href="#pricing"
                className="rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5"
              >
                Apply now
              </a>
            </div>
            <button
              aria-label="Open menu"
              className="rounded-full border border-slate-300 p-2 text-slate-800 transition hover:border-slate-400 md:hidden"
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

