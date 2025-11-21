const TripPurposeModal = ({
  open,
  countryName,
  loading,
  error,
  options,
  onSelect,
  onClose,
  assetUrl,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-[32px] border border-white/10 bg-white/95 p-8 shadow-[0_25px_80px_rgba(3,9,32,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
              Trip Purposes
            </p>
            <h3 className="mt-2 text-2xl font-semibold text-slate-900">
              How are you visiting {countryName}?
            </h3>
            <p className="text-sm text-slate-500">
              Choose one option to continue your tailored visa guidance.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-slate-900"
            aria-label="Close purpose modal"
          >
            ✕
          </button>
        </div>

        <div className="mt-6">
          {loading ? (
            <div className="flex justify-center py-10">
              <span className="inline-flex h-11 w-11 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
            </div>
          ) : error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {options.map((purpose) => (
                <button
                  key={purpose._id || purpose.code}
                  type="button"
                  onClick={() => onSelect(purpose)}
                  className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 text-left text-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50">
                    <img
                      src={
                        assetUrl(purpose.icon) ||
                        "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Globe_icon.svg/48px-Globe_icon.svg.png"
                      }
                      alt={`${purpose.name} icon`}
                      className="h-7 w-7 object-contain"
                      loading="lazy"
                    />
                  </span>
                  <p className="text-base font-semibold tracking-tight">
                    {purpose.name}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPurposeModal;

