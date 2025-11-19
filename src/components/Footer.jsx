const footerLinks = {
  quick: ["Services", "Pricing", "Resources", "Blog"],
  support: ["Help center", "Embassy updates", "Live chat"],
  social: ["LinkedIn", "Instagram", "X / Twitter"],
};

const Footer = () => (
  <footer id="contact" className="mt-12 border-t border-white/10 bg-[#050913] text-slate-200">
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            About
          </h4>
          <h3 className="text-lg font-semibold text-white">VisaFlow</h3>
          <p className="text-sm text-slate-400">
            Intelligent visa infrastructure for modern travelers, inspired by
            Atlys’ craft, tailored for you.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Quick Links
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {footerLinks.quick.map((item) => (
              <li key={item}>
                <a className="transition hover:text-white" href="#services">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div id="support">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Support
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {footerLinks.support.map((item) => (
              <li key={item}>
                <a className="transition hover:text-white" href="#support">
                  {item}
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-6">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Say hello
            </p>
            <a
              className="text-sm font-semibold text-white"
              href="mailto:care@viasonway.com"
            >
              care@viasonway.com
            </a>
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            Social Media
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {footerLinks.social.map((item) => (
              <li key={item}>
                <a className="transition hover:text-white" href="#home">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-slate-500 sm:flex-row">
        <p>© {new Date().getFullYear()} VisaFlow. All rights reserved.</p>
        <div className="flex gap-4">
          <a className="transition hover:text-white" href="#privacy">
            Privacy
          </a>
          <a className="transition hover:text-white" href="#terms">
            Terms
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;

