import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const dialCodes = [
  { code: "+1", label: "US / CA" },
  { code: "+44", label: "UK" },
  { code: "+65", label: "SG" },
  { code: "+91", label: "IN" },
  { code: "+971", label: "UAE" },
];

const Login = () => {
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("request");
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [status, setStatus] = useState(null);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState({ phone: "", otp: "" });
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("returnTo");
  }, [location.search]);

  useEffect(() => {
    if (step !== "verify" || timer === 0) return undefined;
    const id = setTimeout(() => setTimer((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearTimeout(id);
  }, [step, timer]);

  const handleSendOtp = (event) => {
    event.preventDefault();
    const cleanedPhone = phone.replace(/\s|-/g, "");
    if (!/^\d{7,15}$/.test(cleanedPhone)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Enter a valid phone number (7-15 digits).",
      }));
      setStatus({
        type: "error",
        message: "Phone number is required to send OTP.",
      });
      return;
    }
    setErrors((prev) => ({ ...prev, phone: "" }));
    setStep("verify");
    setTimer(45);
    setStatus({
      type: "success",
      message: `Secure code sent to ${countryCode} ${phone}.`,
    });
    setOtpValues(["", "", "", ""]);
    otpRefs.current[0]?.focus();
  };

  const handleOtpChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;
    const updated = [...otpValues];
    updated[index] = value;
    setOtpValues(updated);
    if (errors.otp) {
      setErrors((prev) => ({ ...prev, otp: "" }));
    }
    if (value && index < otpValues.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = (event) => {
    event.preventDefault();
    if (otpValues.some((digit) => !/^\d$/.test(digit))) {
      setErrors((prev) => ({
        ...prev,
        otp: "Enter all four digits from the OTP.",
      }));
      setStatus({
        type: "error",
        message: "OTP verification failed. Please check the digits.",
      });
      return;
    }
    localStorage.setItem("token", "demo-session-token");
    localStorage.setItem(
      "user",
      JSON.stringify({
        name: "Visa Explorer",
        phone: `${countryCode} ${phone}`,
      })
    );
    setStatus({
      type: "success",
      message: "OTP verified. Redirecting to your workspace...",
    });
    setTimeout(() => navigate(returnTo || "/"), 800);
  };

  const canResend = timer === 0 && step === "verify";

  return (
    <section className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-lg">
        <div className="text-center">
          <p className="text-sm font-semibold text-primary-600">Login</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">
            Sign in with your phone number
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            We send a 4-digit one-time password (OTP) to verify your identity.
          </p>
        </div>
        <form className="mt-10 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium text-slate-700 sm:col-span-1">
              Country code
              <select
                value={countryCode}
                onChange={(event) => setCountryCode(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 focus:border-indigo-500 focus:outline-none"
              >
                {dialCodes.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.code} · {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Phone number
              <input
                type="tel"
                value={phone}
                onChange={(event) => {
                  setPhone(event.target.value);
                  if (errors.phone) {
                    setErrors((prev) => ({ ...prev, phone: "" }));
                  }
                }}
                placeholder="Enter your registered number"
                className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
              />
              {errors.phone && (
                <span className="mt-1 block text-xs text-rose-600">
                  {errors.phone}
                </span>
              )}
            </label>
          </div>
          {step === "request" && (
            <button
              type="button"
              className="w-full rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700"
              onClick={handleSendOtp}
            >
              Send OTP
            </button>
          )}
          {step === "verify" && (
            <div className="rounded-2xl border border-slate-200 p-6">
              <p className="text-sm font-medium text-slate-700">
                Enter the 4-digit OTP
              </p>
              <p className="text-xs text-slate-500">
                Sent to {countryCode} {phone}
              </p>
              <div className="mt-4 flex justify-center gap-3">
                {otpValues.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => handleOtpChange(event.target.value, index)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    ref={(element) => (otpRefs.current[index] = element)}
                    className="h-12 w-12 rounded-2xl border border-slate-200 text-center text-xl font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none"
                  />
                ))}
              </div>
              <div className="mt-4 text-center text-sm text-slate-500">
                {timer > 0 ? (
                  <span>Resend code in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    className="font-semibold text-slate-900 underline-offset-4 hover:underline"
                    disabled={!canResend}
                    onClick={handleSendOtp}
                  >
                    Resend code
                  </button>
                )}
              </div>
              <button
                type="button"
                className="mt-6 w-full rounded-2xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-600"
                onClick={handleVerifyOtp}
              >
                Verify & Continue
              </button>
              {errors.otp && (
                <p className="mt-3 text-center text-xs text-rose-600">
                  {errors.otp}
                </p>
              )}
            </div>
          )}
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
          <p className="text-center text-sm text-slate-500">
            Need an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-slate-900 underline-offset-4 hover:underline"
            >
              Register now
            </Link>
          </p>
        </form>
      </div>
    </section>
  );
};

export default Login;

