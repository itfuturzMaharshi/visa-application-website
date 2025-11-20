import { useState } from "react";
import Reveal from "./Reveal";

const faqs = [
  {
    question: "What documents are required for a visa application?",
    answer:
      "Most embassies ask for a valid passport, recent photographs, confirmed travel plans, proof of funds, and invitation or employment letters when applicable. We provide you with a tailored checklist based on your destination and visa category.",
  },
  {
    question: "How long does visa processing take?",
    answer:
      "Processing time depends on the embassy and seasonality. Standard applications average 5–15 business days. Our dashboard shows live embassy SLAs so you always know the latest timelines.",
  },
  {
    question: "Can I apply for an urgent/express visa?",
    answer:
      "Yes. We offer priority handling with embassy walk-ins and premium appointment slots. Express availability varies by country, so we confirm eligibility before collecting payment.",
  },
  {
    question: "Is the visa fee refundable?",
    answer:
      "Government fees are typically non-refundable once submitted. Our service retainers can be credited toward a new attempt if you reschedule or switch embassies within 12 months.",
  },

];

const FAQItem = ({ question, answer, isOpen, onToggle }) => {
  const panelId = `faq-panel-${question.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-5 text-white shadow-lg shadow-slate-950/20 transition hover:border-white/30">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-6 text-left"
        aria-expanded={isOpen}
        aria-controls={panelId}
      >
        <span className="text-lg font-medium leading-snug text-white">{question}</span>
        <span
          className={`flex h-10 w-10 flex-none items-center justify-center rounded-full border border-white/20 text-white transition-transform duration-300 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 9l6 6 6-6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      </button>
      <div
        id={panelId}
        className={`grid overflow-hidden text-base text-blue-100/80 transition-all duration-300 ease-out ${
          isOpen
            ? "mt-4 grid-rows-[1fr] opacity-100"
            : "mt-0 grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="leading-relaxed">{answer}</p>
        </div>
      </div>
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-[#030b1a] px-4 py-24 text-white sm:px-6"
    >
      <div className="absolute inset-0 bg-linear-to-b from-white/5 via-transparent to-white/5 opacity-10" />
      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 lg:flex-row">
        <div className="max-w-xl">
          <Reveal>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-blue-100/70">
              FAQ
              <span className="h-1 w-1 rounded-full bg-emerald-300" />
            </p>
            <h2 className="mt-6 text-4xl font-semibold leading-tight">
              Everything you need to know before you submit.
            </h2>
            <p className="mt-4 text-base text-blue-100/80">
              We translate embassy jargon into plain language and stay with you from your
              first checklist to final approval.
            </p>
            <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-blue-100/80 backdrop-blur">
              <p className="font-semibold text-white">Need something else?</p>
              <p className="mt-2">
                Message our visa architects 24/7 inside the client workspace or email{" "}
                <a className="underline decoration-dotted decoration-emerald-300" href="mailto:support@visaflow.co">
                  support@visaflow.co
                </a>
                .
              </p>
            </div>
          </Reveal>
        </div>
        <div className="flex-1 space-y-4">
          {faqs.map((item, index) => (
            <Reveal key={item.question} delay={index * 60}>
              <FAQItem
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onToggle={() =>
                  setOpenIndex((prev) => (prev === index ? -1 : index))
                }
              />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

