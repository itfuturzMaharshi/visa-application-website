import Icon from "./Icon";

const FaqSection = ({ faqs, openFaq, onToggleFaq }) => (
  <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-4">
      <p className="text-sm uppercase tracking-[0.3em] text-white/50">
        FAQs
      </p>
      <h2 className="text-3xl font-semibold text-white">
        Answers curated by visa specialists
      </h2>
    </div>

    <div className="mt-8 space-y-4">
      {faqs?.map((faq) => {
        const isOpen = openFaq === faq.id;
        return (
          <div key={faq.id} className="rounded-3xl border border-white/10 bg-white/5">
            <button
              type="button"
              onClick={() => onToggleFaq(faq.id)}
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
      })}
    </div>
  </section>
);

export default FaqSection;


