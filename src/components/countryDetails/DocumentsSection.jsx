import Icon from "./Icon";

const DocumentsSection = ({ documents }) => (
  <section className="bg-[#010813]">
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4">
        <p className="text-sm uppercase tracking-[0.3em] text-white/50">
          Required Documents
        </p>
        <h2 className="text-3xl font-semibold text-white">
          Embassy-approved checklist
        </h2>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {documents?.map((doc) => (
          <div
            key={doc}
            className="group flex items-start gap-4 rounded-3xl border border-white/10 bg-white/5 p-5 transition hover:-translate-y-1 hover:border-emerald-300/60 hover:bg-white/10"
          >
            <div className="rounded-2xl bg-emerald-400/10 p-3 text-emerald-300 transition group-hover:bg-emerald-400/20">
              <Icon name="document" />
            </div>
            <p className="text-base text-white/80">{doc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default DocumentsSection;


