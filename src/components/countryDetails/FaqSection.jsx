import Icon from "./Icon";

const FaqSection = ({ faqs, openFaq, onToggleFaq, activeCategory, onCategoryChange, categories = [] }) => (
  <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">
          FAQs
        </p>
        <h2 className="mt-4 text-3xl font-semibold text-white">
          Answers curated by visa specialists
        </h2>
      </div>
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category.key}
              type="button"
              onClick={() => onCategoryChange(category.key)}
              className={`rounded-full border px-5 py-2 text-sm font-medium transition ${
                activeCategory === category.key
                  ? "border-emerald-300 bg-emerald-300/10 text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)]"
                  : "border-white/15 text-white/70 hover:border-white/40 hover:text-white"
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      )}
    </div>

    <div className="mt-8 space-y-4">
      {faqs && faqs.length > 0 ? (
        faqs.map((faq) => {
          const isOpen = openFaq === faq._id;
          return (
            <div key={faq._id} className="rounded-3xl border border-white/10 bg-white/5">
              <button
                type="button"
                onClick={() => onToggleFaq(faq._id)}
                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-emerald-400/10 p-2 text-emerald-300">
                    <Icon name="faq" />
                  </span>
                  <p className="text-lg font-semibold text-white">
                    {faq.question}
                  </p>
                </div>
                <span className="text-2xl text-white/60">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="px-6 pb-6 text-base text-white/70">{faq.answer}</div>
              )}
            </div>
          );
        })
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center text-white/60">
          <p>No FAQs available for this category.</p>
        </div>
      )}
    </div>
  </section>
);

export default FaqSection;


