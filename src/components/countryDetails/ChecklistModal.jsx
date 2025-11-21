const ChecklistModal = ({
  open,
  loading,
  error,
  checklist,
  onClose,
}) => {
  if (!open) return null;

  const tripPurposeName = checklist?.tripPurpose?.name || "Selected purpose";
  const tripPurposeIcon = checklist?.tripPurpose?.icon;
  const items = checklist?.items || [];
  const requiredCount = items.filter(
    (item) => item.isRequired || item.defaultIsMandatory
  ).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl overflow-hidden rounded-[36px] border border-white/10 bg-white shadow-[0_40px_140px_rgba(3,9,32,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-8 text-white">
          <div className="flex flex-wrap items-start justify-between gap-6 pr-16">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/20 text-emerald-200">
                {tripPurposeIcon ? (
                  <img
                    src={tripPurposeIcon}
                    alt="purpose icon"
                    className="h-10 w-10 rounded-xl object-contain"
                    loading="lazy"
                  />
                ) : (
                  <svg
                    className="h-8 w-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.75 6.75h16.5M12 6.75v10.5m-3-10.5v10.5m6-10.5v10.5M3.75 17.25h16.5"
                    />
                  </svg>
                )}
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                  Visa checklist
                </p>
                <h3 className="mt-2 text-3xl font-semibold tracking-tight">
                  {tripPurposeName}
                </h3>
                <p className="text-sm text-white/70">
                  Review and prepare the documents before you submit.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-center">
              <div className="rounded-2xl border border-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                  Total
                </p>
                <p className="text-2xl font-semibold text-white">
                  {items.length || "—"}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.4em] text-white/60">
                  Required
                </p>
                <p className="text-2xl font-semibold text-rose-200">
                  {requiredCount || "—"}
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 h-10 w-10 rounded-full border border-white/30 bg-slate-900/80 text-lg text-white/80 shadow-lg transition hover:text-white"
            aria-label="Close checklist modal"
          >
            ✕
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto bg-white px-8 py-6">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-16">
              <span className="inline-flex h-12 w-12 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
              <p className="text-sm text-slate-500">Preparing your checklist...</p>
            </div>
          ) : error ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : items.length === 0 ? (
            <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-600">
              No checklist items were returned for this purpose.
            </p>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => {
                const isRequired = item.isRequired || item.defaultIsMandatory;
                return (
                  <div
                    key={item._id}
                    className="rounded-3xl border border-slate-100 bg-slate-50 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-sm font-semibold text-slate-500">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <p className="text-lg font-semibold text-slate-900">
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="text-sm text-slate-500">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-4 py-1 text-xs font-semibold ${
                          isRequired
                            ? "bg-rose-100 text-rose-600"
                            : "bg-emerald-100 text-emerald-600"
                        }`}
                      >
                        {isRequired ? "Required" : "Optional"}
                      </span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500">
                      {item.documentType && (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                          {item.documentType}
                        </span>
                      )}
                      {item.fileFormat && (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                          Format: {item.fileFormat}
                        </span>
                      )}
                      {item.maxFileSize && (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
                          Max {item.maxFileSize} MB
                        </span>
                      )}
                    </div>
                    {item.customInstructions && (
                      <p className="mt-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
                        {item.customInstructions}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistModal;

