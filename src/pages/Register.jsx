import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import AuthService from "../services/auth/auth.services";
import CountryCodeSelect from "../components/CountryCodeSelect";
import Loader from "../components/Loader";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    countryCode: "+1",
    phone: "",
    password: "",
  });
  const [step, setStep] = useState("register");
  const [otpValues, setOtpValues] = useState(["", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const otpRefs = useRef([]);
  const navigate = useNavigate();
  const isFormComplete = useMemo(
    () =>
      formData.name &&
      formData.email &&
      formData.phone &&
      formData.password.length >= 8,
    [formData]
  );

  useEffect(() => {
    if (step !== "verify" || timer === 0) return undefined;
    const id = setTimeout(() => setTimer((prev) => Math.max(prev - 1, 0)), 1000);
    return () => clearTimeout(id);
  }, [step, timer]);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationResult = validate();
    setErrors(validationResult);

    if (Object.keys(validationResult).length > 0) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fix the highlighted fields.",
        confirmButtonColor: "#0f172a",
      });
      return;
    }

    const cleanedPhone = formData.phone.replace(/\s|-/g, "");
    setLoading(true);

    try {
      const response = await AuthService.register({
        fullName: formData.name,
        email: formData.email,
        password: formData.password,
        mobile_number: cleanedPhone,
        countryCode: formData.countryCode.replace("+", ""),
        machineId: localStorage.getItem("machineId") || "",
        fcm: localStorage.getItem("fcm") || "",
      });

      // Registration is successful - OTP is sent, show verification step
      const responseData = response?.data?.data || response?.data;
      if (response?.success || responseData?.requiresOtp) {
        // Show success message and switch to OTP verification step
        await Swal.fire({
          icon: "success",
          title: "OTP Sent!",
          text: `Secure code sent to ${formData.countryCode} ${formData.phone}.`,
          confirmButtonColor: "#0f172a",
        });
        // Switch to OTP verification step
        setStep("verify");
        setTimer(45);
        setOtpValues(["", "", "", ""]);
        otpRefs.current[0]?.focus();
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message || "Registration failed. Please try again.";
      await Swal.fire({
        icon: "error",
        title: "Registration Failed",
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

    const cleanedPhone = formData.phone.replace(/\s|-/g, "");
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
        await Swal.fire({
          icon: "success",
          title: "Registration Complete!",
          text: "Your account has been verified successfully. Redirecting...",
          confirmButtonColor: "#0f172a",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/");
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
    const cleanedPhone = formData.phone.replace(/\s|-/g, "");
    if (!/^\d{7,15}$/.test(cleanedPhone)) {
      return;
    }
    setLoading(true);

    try {
      const response = await AuthService.resendOtp({
        mobile_number: cleanedPhone,
        countryCode: formData.countryCode.replace("+", ""),
      });

      if (response?.success) {
        setTimer(45);
        setOtpValues(["", "", "", ""]);
        otpRefs.current[0]?.focus();
        await Swal.fire({
          icon: "success",
          title: "OTP Resent!",
          text: `OTP resent to ${formData.countryCode} ${formData.phone}.`,
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
          <form className="mt-6 space-y-5" onSubmit={step === "register" ? handleSubmit : handleVerifyOtp}>
            {step === "register" && (
              <>
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
                <div className="sm:w-1/3">
                  <CountryCodeSelect
                    value={formData.countryCode}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, countryCode: value }))
                    }
                  />
                </div>
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
            <button
              type="submit"
              className="relative w-full rounded-2xl bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isFormComplete || loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Loader size="md" className="mr-2" />
                  
                </span>
              ) : (
                "Create Account"
              )}
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
              </>
            )}
            {step === "verify" && (
              <div className="rounded-2xl border border-slate-200 p-6">
                <p className="text-sm font-medium text-slate-700">
                  Enter the 4-digit OTP
                </p>
                <p className="text-xs text-slate-500">
                  Sent to {formData.countryCode} {formData.phone}
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
                  type="submit"
                  className="relative mt-6 w-full rounded-2xl bg-emerald-500 px-6 py-3 text-base font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
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
          </form>
        </div>
      </div>
    </section>
  );
};

export default Register;

