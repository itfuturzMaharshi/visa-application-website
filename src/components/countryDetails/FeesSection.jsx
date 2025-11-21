const FeesSection = ({ fees }) => (
  <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="flex flex-col gap-4">
      <p className="text-sm uppercase tracking-[0.3em] text-white/50">
        Fees & Processing
      </p>
      <h2 className="text-3xl font-semibold text-white">
        Transparent visa pricing
      </h2>
    </div>
    <div className="mt-8 rounded-3xl border border-white/10 bg-white/5">
      <div className="grid grid-cols-2 gap-4 border-b border-white/10 px-6 py-4 text-xs uppercase tracking-[0.3em] text-white/40 sm:grid-cols-4">
        <span>Visa type</span>
        <span>Fees</span>
        <span className="hidden sm:block">Processing</span>
        <span>Validity</span>
      </div>
      <div className="divide-y divide-white/5">
        {fees?.map((fee) => (
          <div
            key={fee.type}
            className="grid grid-cols-2 gap-4 px-6 py-6 text-sm text-white/80 sm:grid-cols-4"
          >
            <span className="font-semibold text-white">{fee.type}</span>
            <span>{fee.amount}</span>
            <span className="hidden sm:block">{fee.processing}</span>
            <span>{fee.validity}</span>
          </div>
        ))}
      </div>
    </div>

    <div className="mt-8 rounded-3xl bg-linear-to-r from-emerald-400/10 to-blue-500/10 p-8 text-sm text-white/80">
      <p>
        Fees include government charges, biometric scheduling, document
        validation, and concierge handling. Express processing available on
        request.
      </p>
    </div>
  </section>
);

export default FeesSection;


