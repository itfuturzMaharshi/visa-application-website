import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AuthService from "../services/auth/auth.services";
import CountryCodeSelect from "../components/CountryCodeSelect";
import Loader from "../components/Loader";

const Login = () => {
  const [countryCode, setCountryCode] = useState("+1");
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState("request");
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState({ phone: "", otp: "" });
  const [loading, setLoading] = useState(false);
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

  const handleSendOtp = async (event) => {
    event.preventDefault();
    const cleanedPhone = phone.replace(/\s|-/g, "");
    if (!/^\d{7,15}$/.test(cleanedPhone)) {
      setErrors((prev) => ({
        ...prev,
        phone: "Enter a valid phone number (7-15 digits).",
      }));
      Swal.fire({
        icon: "error",
        title: "Invalid Phone Number",
        text: "Please enter a valid phone number (7-15 digits).",
        confirmButtonColor: "#0f172a",
      });
      return;
    }
    setErrors((prev) => ({ ...prev, phone: "" }));
    setLoading(true);

    try {
      const response = await AuthService.login({
        mobile_number: cleanedPhone,
        countryCode: countryCode.replace("+", ""),
        machineId: localStorage.getItem("machineId") || "",
        fcm: localStorage.getItem("fcm") || "",
      });

      const responseData = response?.data?.data || response?.data;
      if (response?.success || responseData?.requiresOtp) {
        setStep("verify");
        setTimer(45);
        setOtpValues(["", "", "", ""]);
        otpRefs.current[0]?.focus();
        await Swal.fire({
          icon: "success",
          title: "OTP Sent!",
          text: `Secure code sent to ${countryCode} ${phone}.`,
          confirmButtonColor: "#0f172a",
        });
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to send OTP. Please try again.";
      await Swal.fire({
        icon: "error",
        title: "Failed to Send OTP",
        text: errorMessage,
        confirmButtonColor: "#0f172a",
      });
    } finally {
      setLoading(false);
    }
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

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    if (otpValues.some((digit) => !/^\d$/.test(digit))) {
      setErrors((prev) => ({
        ...prev,
        otp: "Enter all four digits from the OTP.",
      }));
      Swal.fire({
        icon: "error",
        title: "Invalid OTP",
        text: "Please enter all four digits from the OTP.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    const cleanedPhone = phone.replace(/\s|-/g, "");
    const otp = otpValues.join("");
    setLoading(true);

    try {
      const response = await AuthService.verifyOtp({
        mobile_number: cleanedPhone,
        otp,
        machineId: localStorage.getItem("machineId") || "",
        fcm: localStorage.getItem("fcm") || "",
      });

      const responseData = response?.data?.data || response?.data;
      if (response?.success && responseData?.token && responseData?.user) {
        localStorage.setItem("token", responseData.token);
        localStorage.setItem("user", JSON.stringify(responseData.user));
        
        // Dispatch custom event to notify header about auth state change
        window.dispatchEvent(new Event("storage"));
        window.dispatchEvent(new CustomEvent("authStateChanged"));
        
        await Swal.fire({
          icon: "success",
          title: "Login Successful!",
          text: "OTP verified. Redirecting to your workspace...",
          confirmButtonColor: "#0f172a",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate(returnTo || "/");
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        otp: "Invalid or expired OTP. Please try again.",
      }));
      const errorMessage =
        error?.response?.data?.message || "Invalid or expired OTP. Please try again.";
      await Swal.fire({
        icon: "error",
        title: "OTP Verification Failed",
        text: errorMessage,
        confirmButtonColor: "#0f172a",
      });
    } finally {
      setLoading(false);
    }
  };

  const canResend = timer === 0 && step === "verify";

  const handleResendOtp = async () => {
    const cleanedPhone = phone.replace(/\s|-/g, "");
    if (!/^\d{7,15}$/.test(cleanedPhone)) {
      return;
    }
    setLoading(true);

    try {
      const response = await AuthService.resendOtp({
        mobile_number: cleanedPhone,
        countryCode: countryCode.replace("+", ""),
      });

      if (response?.success) {
        setTimer(45);
        setOtpValues(["", "", "", ""]);
        otpRefs.current[0]?.focus();
        await Swal.fire({
          icon: "success",
          title: "OTP Resent!",
          text: `OTP resent to ${countryCode} ${phone}.`,
          confirmButtonColor: "#0f172a",
        });
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Failed to resend OTP. Please try again.";
      await Swal.fire({
        icon: "error",
        title: "Failed to Resend OTP",
        text: errorMessage,
        confirmButtonColor: "#0f172a",
      });
    } finally {
      setLoading(false);
    }
  };

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
              <div className="mt-2">
                <CountryCodeSelect
                  value={countryCode}
                  onChange={setCountryCode}
                />
              </div>
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
              className="relative w-full rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader size="md" className="mr-2" />
                  Sending...
                </span>
              ) : (
                "Send OTP"
              )}
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
                    className="font-semibold text-slate-900 underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                    disabled={!canResend || loading}
                    onClick={handleResendOtp}
                  >
                    Resend code
                  </button>
                )}
              </div>
              <button
                type="button"
                className="relative mt-6 w-full rounded-2xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <Loader size="md" className="mr-2" />
                    
                  </span>
                ) : (
                  "Verify & Continue"
                )}
              </button>
              {errors.otp && (
                <p className="mt-3 text-center text-xs text-rose-600">
                  {errors.otp}
                </p>
              )}
            </div>
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

