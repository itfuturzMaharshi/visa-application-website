import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const metricCards = [
  { label: "Active Applications", value: "02", accent: "from-cyan-400 to-blue-500" },
  { label: "Documents Verified", value: "08", accent: "from-emerald-400 to-teal-500" },
  { label: "Upcoming Trips", value: "01", accent: "from-indigo-400 to-purple-500" },
];

const UserDetails = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, []);

  const handleStart = () => navigate("/register");

  return (
    <section className="flex min-h-screen items-center bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header>
          <p className="text-sm font-semibold text-primary-600">User details</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Your profile at a glance
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review your saved contact information, current applications and
            assigned support team. Update these details anytime from your
            dashboard.
          </p>
        </header>
        {user ? (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl bg-white p-6 shadow-sm lg:col-span-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  Traveler information
                </h2>
                <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <p>
                    <span className="font-medium text-slate-900">Name:</span>{" "}
                    {user.name || "—"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Email:</span>{" "}
                    {user.email || "—"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-900">Phone:</span>{" "}
                    {user.phone || "—"}
                  </p>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase text-slate-500">Residency</p>
                    <p className="mt-1 text-base text-slate-900">
                      {user.country || "Add country"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <p className="text-xs uppercase text-slate-500">
                      Preferred embassy
                    </p>
                    <p className="mt-1 text-base text-slate-900">
                      {user.embassy || "Add embassy"}
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                  Support contact
                </h3>
                <p className="mt-2 text-sm text-slate-500">
                  Your VisaFlow specialist is available for quick questions or
                  document checks.
                </p>
                <div className="mt-4 space-y-2 text-sm text-slate-700">
                  <p className="font-medium">Anika Verma</p>
                  <p>Senior Visa Strategist</p>
                  <p>concierge@visaflow.com</p>
                  <p>+971 4 555 2388</p>
                </div>
                <button
                  type="button"
                  className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
                >
                  Request a call
                </button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {metricCards.map((card) => (
                <div key={card.label} className="rounded-2xl bg-white p-4 text-center shadow-sm">
                  <p className="text-xs uppercase text-slate-500">{card.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">
              No user found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              We couldn’t find saved details. Please log in or create an account
              to view your profile.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                to="/login"
                className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                Log in
              </Link>
              <button
                type="button"
                onClick={handleStart}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Create account
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserDetails;

