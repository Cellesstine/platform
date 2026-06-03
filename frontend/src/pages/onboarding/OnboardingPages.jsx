import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import PortalSplitLayout from "../../components/layout/PortalSplitLayout";
import OnboardingStepLayout from "../../components/layout/OnboardingStepLayout";
import PendingStatusLayout from "../../components/layout/PendingStatusLayout";
import {
  Field,
  inputClass,
  PageTitle,
  AlertError,
  PrimaryButton,
} from "../../components/ui";
import { getPortal } from "../../theme/portal";
import { canSubmitAccountForm } from "../../utils/accountValidation";
import {
  saveEmailVerificationSession,
  isEmailVerified,
  getEmailVerificationSession,
} from "../../services/emailVerificationApi";
import { register as apiRegister } from "../../services/accountApi";
import { parseApiError } from "../../services/auth";
import {
  setupEnterpriseProfile,
  postEnterpriseVerification,
  getMyProfileDetails,
} from "../../services/profilesApi";

const bizBenefits = [
  "Post jobs across all 69 wilayas",
  "Browse verified professionals",
  "Commission freelancers directly",
  "Build a verified company presence",
];

const WILAYA_CHOICES = [
  { value: "adrar", label: "Adrar" },
  { value: "chlef", label: "Chlef" },
  { value: "laghouat", label: "Laghouat" },
  { value: "oum_el_bouaghi", label: "Oum El Bouaghi" },
  { value: "batna", label: "Batna" },
  { value: "bejaia", label: "Béjaïa" },
  { value: "biskra", label: "Biskra" },
  { value: "bechar", label: "Béchar" },
  { value: "blida", label: "Blida" },
  { value: "bouira", label: "Bouira" },
  { value: "tamanrasset", label: "Tamanrasset" },
  { value: "tebessa", label: "Tébessa" },
  { value: "tlemcen", label: "Tlemcen" },
  { value: "tiaret", label: "Tiaret" },
  { value: "tizi_ouzou", label: "Tizi Ouzou" },
  { value: "alger", label: "Alger" },
  { value: "djelfa", label: "Djelfa" },
  { value: "jijel", label: "Jijel" },
  { value: "setif", label: "Sétif" },
  { value: "saida", label: "Saïda" },
  { value: "skikda", label: "Skikda" },
  { value: "sidi_bel_abbes", label: "Sidi Bel Abbès" },
  { value: "annaba", label: "Annaba" },
  { value: "guelma", label: "Guelma" },
  { value: "constantine", label: "Constantine" },
  { value: "medea", label: "Médéa" },
  { value: "mostaganem", label: "Mostaganem" },
  { value: "msila", label: "M'Sila" },
  { value: "mascara", label: "Mascara" },
  { value: "ouargla", label: "Ouargla" },
  { value: "oran", label: "Oran" },
  { value: "el_bayadh", label: "El Bayadh" },
  { value: "illizi", label: "Illizi" },
  { value: "bordj_bou_arreridj", label: "Bordj Bou Arréridj" },
  { value: "boumerdes", label: "Boumerdès" },
  { value: "el_tarf", label: "El Tarf" },
  { value: "tindouf", label: "Tindouf" },
  { value: "tissemsilt", label: "Tissemsilt" },
  { value: "el_oued", label: "El Oued" },
  { value: "khenchela", label: "Khenchela" },
  { value: "souk_ahras", label: "Souk Ahras" },
  { value: "tipaza", label: "Tipaza" },
  { value: "mila", label: "Mila" },
  { value: "ain_defla", label: "Aïn Defla" },
  { value: "naama", label: "Naâma" },
  { value: "ain_temouchent", label: "Aïn Témouchent" },
  { value: "ghardaia", label: "Ghardaïa" },
  { value: "relizane", label: "Relizane" },
  { value: "el_mghair", label: "El M'Ghair" },
  { value: "el_meniaa", label: "El Meniaa" },
  { value: "ouled_djellal", label: "Ouled Djellal" },
  { value: "bordj_baji_mokhtar", label: "Bordj Baji Mokhtar" },
  { value: "beni_abbes", label: "Béni Abbès" },
  { value: "timimoun", label: "Timimoun" },
  { value: "touggourt", label: "Touggourt" },
  { value: "djanet", label: "Djanet" },
  { value: "in_salah", label: "In Salah" },
  { value: "in_guezzam", label: "In Guezzam" },
];

const INDUSTRY_CHOICES = [
  { value: "TECH", label: "Technology" },
  { value: "FINANCE", label: "Finance & Banking" },
  { value: "WATER", label: "Water Industry" },
  { value: "CONSTRUCTION", label: "Construction & BTP" },
  { value: "HEALTHCARE", label: "Healthcare" },
  { value: "EDUCATION", label: "Education" },
  { value: "RETAIL", label: "Retail & Commerce" },
  { value: "ENERGY", label: "Energy & Oil" },
  { value: "AGRICULTURE", label: "Agriculture" },
  { value: "TRANSPORT", label: "Transport & Logistics" },
  { value: "OTHER", label: "Other" },
];

const COMPANY_SIZE_CHOICES = [
  { value: "STARTUP", label: "Start-Up (1-10)" },
  { value: "SMALL", label: "Small (11-50)" },
  { value: "MEDIUM", label: "Medium (51-200)" },
  { value: "LARGE", label: "Large (200+)" },
];

function OnboardingSearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full text-left" ref={containerRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-linkio bg-ivory-warm border border-transparent text-sm text-navy cursor-pointer hover:bg-white hover:border-navy/20 focus:border-navy focus:bg-white transition-all min-h-[48px] select-none"
      >
        <span className={selectedOption ? "text-navy font-medium" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-navy/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white rounded-linkio-lg border border-navy/10 shadow-[0_12px_40px_rgba(27,58,92,0.12)] p-2 flex flex-col overflow-hidden max-h-72">
          <div className="relative mb-2">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-transparent bg-ivory-warm focus:bg-white focus:border-navy/20 rounded-linkio outline-none pl-8 text-navy transition-all"
            />
            <span className="absolute left-2.5 top-2.5 text-navy/40 text-xs">🔍</span>
          </div>

          <div className="overflow-y-auto flex-1 max-h-48 pr-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.value}
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`px-3 py-2 text-xs rounded-linkio cursor-pointer transition-all flex items-center mb-0.5 last:mb-0 ${
                    opt.value === value
                      ? "bg-red text-white font-semibold"
                      : "text-navy/80 hover:bg-ivory-warm"
                  }`}
                >
                  <span>{opt.label}</span>
                </div>
              ))
            ) : (
              <div className="text-center text-xs text-gray-400 py-3">No results found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OnboardingCardSelector({ options, value, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full py-1">
      {options.map((opt) => {
        const isSelected = opt.value === value;
        return (
          <div
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-linkio-lg py-5 px-4 flex flex-col items-center justify-center cursor-pointer select-none text-center transition-all duration-300 transform ${
              isSelected
                ? "bg-white shadow-[0_16px_36px_rgba(27,58,92,0.12)] -translate-y-1 scale-[1.03] border border-transparent"
                : "bg-white border border-gray-100/80 shadow-[0_4px_12px_rgba(27,58,92,0.03)] hover:shadow-[0_8px_20px_rgba(27,58,92,0.06)] hover:-translate-y-0.5"
            }`}
          >
            <span className={`text-xs font-bold transition-colors duration-300 ${isSelected ? "text-navy font-extrabold" : "text-navy/60"}`}>
              {opt.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Account Setup ──────────────────────────────────
export function OnboardingAccount() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = getPortal("business");

  const canContinue =
    canSubmitAccountForm({ email, password, confirmPassword }) && agreedToTerms;

  const handleContinue = async (e) => {
    e.preventDefault();
    if (!canContinue || loading) return;

    setLoading(true);
    setError("");
    try {
      await apiRegister({
        email: email.trim(),
        password,
        role: "enterprise",
      });

      const expiresAt = saveEmailVerificationSession("business", email.trim());
      navigate("/verify-email", {
        state: { email: email.trim(), expiresAt },
      });
    } catch (err) {
      setError(parseApiError(err, "Unable to create account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PortalSplitLayout
      portal="business"
      title="Scale your business operations."
      subtitle="Find, contract, and coordinate with top-tier verified professionals in Algeria."
      bullets={bizBenefits}
    >
      <PageTitle
        title="Create your business account"
        subtitle="Set up your primary corporate access."
      />

      {error && <AlertError>{error}</AlertError>}

      <Field label="Work Email Address *">
        <input
          type="email"
          placeholder="name@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
          required
        />
      </Field>

      <Field label="Password *">
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
          required
        />
      </Field>

      <Field label="Confirm Password *">
        <input
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
          required
        />
      </Field>

      <label className="flex items-start gap-3 text-xs text-gray-500 mb-8 cursor-pointer leading-tight">
        <input
          type="checkbox"
          checked={agreedToTerms}
          onChange={(e) => setAgreedToTerms(e.target.checked)}
          className={`w-4 h-4 mt-0.5 ${theme.checkbox}`}
        />
        <span>
          I agree to the <span className={`${theme.textAccent} font-semibold underline`}>Terms of Service</span> and{" "}
          <span className={`${theme.textAccent} font-semibold underline`}>Privacy Policy</span>
        </span>
      </label>

      <PrimaryButton portal="business" disabled={!canContinue} loading={loading} onClick={handleContinue}>
        Continue
      </PrimaryButton>

      <p className="text-sm text-gray-500 text-center mt-6">
        Already have an account?{" "}
        <Link to="/sign-in" className={`${theme.textAccent} font-semibold hover:underline`}>
          Sign in
        </Link>
      </p>
    </PortalSplitLayout>
  );
}

// ── Step 2: Company Setup ──────────────────────────────────
export function OnboardingCompany() {
  const navigate = useNavigate();
  const photoRef = useRef(null);

  // Form State
  const [avatar, setAvatar] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEmailVerified("business")) {
      const session = getEmailVerificationSession("business");
      if (session?.email) {
        navigate("/verify-email", {
          replace: true,
          state: { email: session.email, expiresAt: session.expiresAt },
        });
      } else {
        navigate("/register", { replace: true });
      }
    }
  }, [navigate]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await getMyProfileDetails();
        if (data) {
          if (data.company_name) setCompanyName(data.company_name);
          if (data.wilaya) setWilaya(data.wilaya);
          if (data.address) setAddress(data.address);
          if (data.industry) setIndustry(data.industry);
          if (data.company_size) setCompanySize(data.company_size);
          if (data.phone) {
            // Strip the +213 prefix for display if it's already there
            const localPhone = data.phone.startsWith("+213") ? data.phone.substring(4) : data.phone;
            setPhone(localPhone);
          }
        }
      } catch (err) {
        console.log("No existing profile details to pre-fill:", err);
      }
    };
    fetchProfileData();
  }, []);

  const handlePhotoClick = () => {
    photoRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
    }
  };

  const handleContinue = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      if (avatar) {
        formData.append("avatar", avatar);
      }
      const fullPhone = phone.trim().startsWith("+213") ? phone.trim() : `+213${phone.trim()}`;
      formData.append("company_name", companyName.trim());
      formData.append("wilaya", wilaya);
      formData.append("address", address.trim());
      formData.append("phone", fullPhone);
      formData.append("industry", industry);
      formData.append("company_size", companySize);

      await setupEnterpriseProfile(formData);
      navigate("/onboarding/documents");
    } catch (err) {
      setError(parseApiError(err, "Unable to save company profile. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingStepLayout portal="business" steps={["Account", "Company", "Documents"]} current={2} hideHeader={true}>
      <PageTitle title="Set up your company" subtitle="Tell professionals about your business." />

      {error && <AlertError>{error}</AlertError>}

      <form onSubmit={handleContinue} className="space-y-5 text-left">
        {/* Company Logo Uploader */}
        <div className="flex flex-col items-center mb-6">
          <div
            onClick={handlePhotoClick}
            className="relative w-28 h-28 rounded-[2.2rem] border-2 border-dashed border-[#3C0713]/40 hover:border-[#3C0713] flex flex-col items-center justify-center cursor-pointer hover:shadow-lg hover:shadow-[#3C0713]/10 hover:bg-[#3C0713]/5 transition-all duration-300 overflow-hidden bg-white"
          >
            <span className="text-[#3C0713] font-sans text-sm font-bold tracking-wider">
              Logo
            </span>
          </div>
          {avatar ? (
            <p className="text-[10px] text-emerald-600 font-bold mt-2">✓ {avatar.name} selected</p>
          ) : (
            <p className="text-[10px] text-[#3C0713]/70 mt-2 font-medium tracking-wide">JPG or PNG. Max 2MB.</p>
          )}
          <input
            type="file"
            ref={photoRef}
            onChange={handlePhotoChange}
            accept="image/*"
            className="hidden"
          />
        </div>

        <Field label="Company Name *">
          <input
            type="text"
            placeholder="TechCorp Algérie SARL"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className={inputClass}
            required
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Wilaya *">
            <OnboardingSearchableSelect
              value={wilaya}
              onChange={setWilaya}
              options={WILAYA_CHOICES}
              placeholder="Select Wilaya"
            />
          </Field>

          <Field label="Industry *">
            <OnboardingSearchableSelect
              value={industry}
              onChange={setIndustry}
              options={INDUSTRY_CHOICES}
              placeholder="Select Industry"
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Field label="Business Address *">
            <input
              type="text"
              placeholder="05 Rue Didouche Mourad, Alger"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className={inputClass}
              required
            />
          </Field>

          <Field label="Phone Number *">
            <div className="flex items-center rounded-linkio bg-ivory-warm border border-transparent focus-within:border-navy focus-within:bg-white transition-colors overflow-hidden min-h-[48px]">
              <span className="pl-4 pr-3 text-sm text-navy/50 font-bold border-r border-navy/10 select-none">
                +213
              </span>
              <input
                type="tel"
                placeholder="555 12 34 56"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-transparent text-sm text-navy outline-none"
                required
              />
            </div>
          </Field>
        </div>

        <Field label="Company Size *">
          <OnboardingCardSelector
            options={COMPANY_SIZE_CHOICES}
            value={companySize}
            onChange={setCompanySize}
          />
        </Field>

        <div className="flex justify-end items-center pt-6">
          <button
            type="submit"
            disabled={loading}
            className="btn-linkio-crimson px-10 py-3 rounded-linkio text-sm font-semibold text-white transition-all disabled:opacity-40"
          >
            {loading ? "Saving…" : "Next"}
          </button>
        </div>
      </form>
    </OnboardingStepLayout>
  );
}

// ── Step 3: Verification Documents ─────────────────────────
export function OnboardingDocuments() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [registerFile, setRegisterFile] = useState(null);
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchWebsiteData = async () => {
      try {
        const data = await getMyProfileDetails();
        if (data && data.website) {
          setWebsite(data.website);
        }
      } catch (err) {
        console.log("No existing website URL to pre-fill:", err);
      }
    };
    fetchWebsiteData();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setRegisterFile(file);
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      if (registerFile) {
        formData.append("register", registerFile);
      }
      if (website.trim()) {
        formData.append("website", website.trim());
      }
      await postEnterpriseVerification(formData);
      navigate("/onboarding/pending");
    } catch (err) {
      setError(parseApiError(err, "Unable to submit verification documents."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingStepLayout portal="business" steps={["Account", "Company", "Documents"]} current={3} maxWidth="max-w-lg" hideHeader={true}>
      <PageTitle
        title="Verification documents"
        subtitle="Upload official documents to verify your business identity."
      />

      {error && <AlertError>{error}</AlertError>}

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,image/*"
        />

        <div
          onClick={handleUploadClick}
          className={`border-2 border-dashed border-navy/15 rounded-linkio-lg py-12 flex flex-col items-center gap-3 cursor-pointer hover:border-red/40 transition-all bg-ivory-warm mb-4 ${
            registerFile ? "border-green-400 bg-green-50/10" : ""
          }`}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={registerFile ? "#10b981" : "#9ca3af"} strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <p className={`text-sm ${registerFile ? "text-green-600 font-semibold" : "text-gray-500"}`}>
            {registerFile ? `Selected: ${registerFile.name}` : "Upload Commercial Register *"}
          </p>
          <span className="text-xs text-gray-400">PDF or Image, max 2MB</span>
        </div>

        <Field label="Website URL (Optional)">
          <input
            type="url"
            placeholder="https://yourcompany.dz"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="bg-amber-light border border-amber/30 rounded-linkio px-4 py-3 flex gap-3 text-sm text-amber-900 mb-6">
          <span>⚠</span>
          <span>
            Your account must be <strong>verified by our admin team</strong> before you can post announcements.
            Verification takes 24–48 hours.
          </span>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => navigate("/onboarding/company")}
            className="text-sm text-gray-400 hover:text-gray-900"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-linkio-crimson px-7 py-3 rounded-linkio text-sm font-semibold text-white transition-all disabled:opacity-40"
          >
            {loading ? "Submitting…" : "Submit"}
          </button>
        </div>
      </form>
    </OnboardingStepLayout>
  );
}

// ── Pending Verification ──────────────────────────────────
export function PendingVerificationPage() {
  const navigate = useNavigate();
  return (
    <PendingStatusLayout
      portal="business"
      title={
        <>
          Profile submitted —
          <br />
          pending verification
        </>
      }
      description="Our admin team will review your profile and documents within 24–48 hours. You'll receive an email once your account is verified."
      buttonLabel="Preview my profile"
      onButton={() => navigate("/dashboard")}
    />
  );
}
