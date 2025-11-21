import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

const dialCodes = [
  { code: "+1", label: "United States / Canada" },
  { code: "+44", label: "United Kingdom" },
  { code: "+61", label: "Australia" },
  { code: "+65", label: "Singapore" },
  { code: "+91", label: "India" },
  { code: "+971", label: "United Arab Emirates" },
];

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+1",
    phone: "",
    password: "",
  });
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const isFormComplete = useMemo(
    () =>
      formData.name &&
      formData.email &&
      formData.phone &&
      formData.password.length >= 8,
    [formData]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = (fieldValues = formData) => {
    const nextErrors = {};
    if (!fieldValues.name.trim()) {
      nextErrors.name = "Enter your full name.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fieldValues.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    if (!/^\d{7,15}$/.test(fieldValues.phone.replace(/\s|-/g, ""))) {
      nextErrors.phone = "Phone number should be 7-15 digits.";
    }
    if (fieldValues.password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    }
    return nextErrors;
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    const fieldErrors = validate({ ...formData, [name]: formData[name] });
    setErrors((prev) => ({ ...prev, [name]: fieldErrors[name] }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const validationResult = validate();
    setErrors(validationResult);

    if (Object.keys(validationResult).length > 0) {
      setStatus({
        type: "error",
        message: "Please fix the highlighted fields.",
      });
      return;
    }
    setStatus({
      type: "success",
      message:
        "Registration details captured. A concierge will reach out within 24 hours.",
    });
  };

  return (
    <section className="flex min-h-screen items-center bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col justify-center gap-10 lg:flex-row">
        <div className="space-y-4 lg:w-1/2">
          <p className="text-sm font-semibold text-primary-600">Register</p>
          <h1 className="text-3xl font-semibold leading-snug text-slate-900">
            Create your VisaFlow account in four quick steps.
          </h1>
          <p className="text-base text-slate-600">
            Provide your contact details and a strong password. Once you submit
            the form we will help you pick the right visa category and start the
            application process.
          </p>
          <ul className="space-y-3 rounded-2xl bg-white p-6 shadow-sm">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              <p>Use your legal name so it matches your travel documents.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              <p>Phone number helps us send OTP updates and concierge alerts.</p>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500" />
              <p>Passwords must be at least 8 characters with letters + numbers.</p>
            </li>
          </ul>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-lg lg:w-1/2">
          <h2 className="text-xl font-semibold text-slate-900">Account details</h2>
          <p className="text-sm text-slate-500">
            All fields are required unless stated otherwise.
          </p>
          <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-slate-700">
              User Name
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="E.g. Elena Carter"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
              {errors.name && (
                <span className="mt-1 block text-xs text-rose-600">
                  {errors.name}
                </span>
              )}
            </label>
            <label className="block text-sm font-medium text-slate-700">
              Email ID
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@company.com"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
              {errors.email && (
                <span className="mt-1 block text-xs text-rose-600">
                  {errors.email}
                </span>
              )}
            </label>
            <div>
              <span className="block text-sm font-medium text-slate-700">
                Country code & phone number
              </span>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none sm:w-1/3"
                >
                  {dialCodes.map((option) => (
                    <option key={option.code} value={option.code}>
                      {option.code} · {option.label}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="91234 56789"
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none sm:flex-1"
                />
              </div>
              {errors.phone && (
                <span className="mt-1 block text-xs text-rose-600">
                  {errors.phone}
                </span>
              )}
            </div>
            <label className="block text-sm font-medium text-slate-700">
              Password
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                minLength={8}
                placeholder="Minimum 8 characters"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
              <span className="mt-1 block text-xs text-slate-500">
                {formData.password.length} / 16 characters used
              </span>
              {errors.password && (
                <span className="mt-1 block text-xs text-rose-600">
                  {errors.password}
                </span>
              )}
            </label>
            {status && (
              <p
                className={`rounded-2xl border px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {status.message}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isFormComplete}
            >
              Create Account
            </button>
            <p className="text-center text-sm text-slate-500">
              Already registered?{" "}
              <Link
                to="/login"
                className="font-semibold text-slate-900 underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;

