import { useRef, useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import PortalSplitLayout from "../../../components/layout/PortalSplitLayout";
import OnboardingStepLayout from "../../../components/layout/OnboardingStepLayout";
import PendingStatusLayout from "../../../components/layout/PendingStatusLayout";
import {
  Field,
  inputClass,
  PageTitle,
  FormDivider,
  OAuthButtons,
  AlertError,
  PrimaryButton,
} from "../../../components/ui";
import { getPortal } from "../../../theme/portal";
import EmailVerificationPending from "../../../components/EmailVerificationPending";
import {
  saveEmailVerificationSession,
  isEmailVerified,
  getEmailVerificationSession,
} from "../../../services/emailVerificationApi";
import { register as apiRegister } from "../../../services/accountApi";
import { parseApiError } from "../../../services/auth";
import {
  setupIndividualProfile,
  postIndividualProfileSetup,
  searchSkills,
} from "../../../services/profilesApi";

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
];

const AVAILABILITY_CHOICES = [
  { value: "AVAILABLE", label: "Available Now" },
  { value: "OPEN", label: "Open to Opportunities" },
  { value: "NOT_AVAILABLE", label: "Not Available" },
];



export function ProfessionalAccountPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const canContinue = email.trim() !== "" && password !== "" && confirmPassword !== "" && agreedToTerms;

  const handleContinue = async () => {
    if (!canContinue || loading) return;
    const trimmed = email.trim();
    setLoading(true);
    setError("");
    setFieldErrors({});
    try {
      await apiRegister({
        email: trimmed,
        password,
        password_confirm: confirmPassword,
        role: "individual",
      });
      const expiresAt = saveEmailVerificationSession("professional", trimmed);
      navigate("/professional/onboarding/verify-email", {
        state: { email: trimmed, expiresAt },
      });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object" && !Array.isArray(data)) {
        setFieldErrors(data);
        if (data.non_field_errors) {
          setError(Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors);
        } else if (data.detail) {
          setError(data.detail);
        }
      } else {
        setError(parseApiError(err, "Unable to create your account. Please try again."));
      }
    } finally {
      setLoading(false);
    }
  };

  const profLeft = (
    <div className="text-left flex flex-col items-start justify-center w-full max-w-sm mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <span className="block w-8 h-[1.5px] bg-[#D4AD55]"></span>
        <p className="text-[10px] tracking-[0.25em] text-[#D4AD55] uppercase font-medium">Professional</p>
        <span className="block w-8 h-[1.5px] bg-[#D4AD55]"></span>
      </div>
      <h2 className="font-serif text-4xl font-semibold text-white leading-tight mb-3 tracking-tight">
        Position your<br /><em className="italic text-[#D4AD55]">expertise.</em>
      </h2>
      <h3 className="font-serif text-2xl font-normal text-white/80 leading-snug mb-8 italic">
        Accelerate your career.
      </h3>
      <p className="text-sm text-white/60 leading-relaxed font-light mb-8">
        Create a premium profile, showcase validated achievements, and connect with leading enterprises seeking elite talent across Algeria.
      </p>
      <div className="flex flex-col gap-3 w-full">
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AD55] shadow-[0_0_6px_rgba(212,173,85,0.5)]"></span>
          <span className="text-xs text-white/50 font-light">Verified skill profile</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AD55] shadow-[0_0_6px_rgba(212,173,85,0.5)]"></span>
          <span className="text-xs text-white/50 font-light">Smart opportunity matching</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D4AD55] shadow-[0_0_6px_rgba(212,173,85,0.5)]"></span>
          <span className="text-xs text-white/50 font-light">Reputation that grows with you</span>
        </div>
      </div>
    </div>
  );

  const theme = getPortal("professional");

  return (
    <PortalSplitLayout portal="professional" leftContent={profLeft}>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6 inline-flex items-center gap-1.5 font-medium"
      >
        ← Back
      </button>
      <PageTitle title="Create your account" subtitle={<em className="italic">Enter professional credentials.</em>} />

      {/* Sleek Floating Switcher Cards inside a rounded-rectangle wrapper */}
      <div className="bg-white/95 border border-gray-150 p-2 rounded-[24px] shadow-[0_16px_36px_rgba(27,58,92,0.12)] w-full max-w-xs mx-auto mb-8 select-none flex gap-2 hover:shadow-[0_20px_44px_rgba(27,58,92,0.16)] transition-all duration-300">
        {/* Professional Switch Card */}
        <button
          type="button"
          className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-[16px] cursor-default transition-all duration-300 border border-navy bg-navy text-white shadow-[0_4px_12px_rgba(27,58,92,0.2)] scale-[1.02] text-center"
        >
          Professional
        </button>

        {/* Business Switch Card */}
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="flex-1 py-2.5 px-4 text-xs font-semibold rounded-[16px] cursor-pointer transition-all duration-300 border border-transparent text-gray-400 hover:border-red hover:text-red hover:bg-red/[0.02]"
        >
          Business
        </button>
      </div>

      <Field label="Email Address" className="mb-4">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: null });
          }}
          className={inputClass}
        />
        {fieldErrors.email && (
          <p className="text-xs text-red-600 mt-1 font-medium select-none animate-fade-in">
            {Array.isArray(fieldErrors.email) ? fieldErrors.email[0] : fieldErrors.email}
          </p>
        )}
      </Field>

      <Field label="Password" className="mb-4">
        <input
          type="password"
          placeholder="Enter a password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: null });
          }}
          className={inputClass}
        />
        {fieldErrors.password && (
          <p className="text-xs text-red-600 mt-1 font-medium select-none animate-fade-in">
            {Array.isArray(fieldErrors.password) ? fieldErrors.password[0] : fieldErrors.password}
          </p>
        )}
      </Field>

      <Field label="Confirm Password" className="mb-4">
        <input
          type="password"
          placeholder="Confirm password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.password_confirm) setFieldErrors({ ...fieldErrors, password_confirm: null });
          }}
          className={inputClass}
        />
        {fieldErrors.password_confirm && (
          <p className="text-xs text-red-600 mt-1 font-medium select-none animate-fade-in">
            {Array.isArray(fieldErrors.password_confirm) ? fieldErrors.password_confirm[0] : fieldErrors.password_confirm}
          </p>
        )}
      </Field>

      <FormDivider />
      <OAuthButtons />

      <AlertError>{error}</AlertError>

      <label className="flex items-start gap-3 text-xs text-gray-500 mb-8 cursor-pointer">
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

      <PrimaryButton
        portal="professional"
        disabled={!canContinue}
        loading={loading}
        onClick={handleContinue}
      >
        Continue →
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

export function ProfessionalVerifyEmailPage() {
  return <EmailVerificationPending portal="professional" />;
}

export function ProfessionalProfileSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const photoRef = useRef(null);

  // Form State
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [wilaya, setWilaya] = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [wilayaOpen, setWilayaOpen] = useState(false);
  const [wilayaSearch, setWilayaSearch] = useState("");
  const wilayaDropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wilayaDropdownRef.current && !wilayaDropdownRef.current.contains(event.target)) {
        setWilayaOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isEmailVerified("professional")) {
      const session = getEmailVerificationSession("professional");
      if (session?.email) {
        navigate("/professional/onboarding/verify-email", {
          replace: true,
          state: { email: session.email, expiresAt: session.expiresAt },
        });
      } else {
        navigate("/professional/onboarding/account", { replace: true });
      }
    }
  }, [navigate]);

  const handlePhotoClick = () => {
    photoRef.current?.click();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleContinue = async () => {
    if (loading) return;
    setError("");
    
    if (!firstName.trim()) {
      setError("First name is required.");
      return;
    }
    if (!lastName.trim()) {
      setError("Last name is required.");
      return;
    }
    if (!phone.trim()) {
      setError("Phone number is required.");
      return;
    }
    if (!wilaya) {
      setError("Please select your Wilaya.");
      return;
    }
    if (!address.trim()) {
      setError("Address is required.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      if (avatar) {
        formData.append("avatar", avatar);
      }
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("phone", phone);
      formData.append("wilaya", wilaya);
      formData.append("address", address);
      formData.append("bio", bio);

      await setupIndividualProfile(formData);
      navigate("/professional/onboarding/documents", { state: { email } });
    } catch (err) {
      setError(parseApiError(err, "Unable to save profile basic info. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingStepLayout portal="professional" steps={["Account", "Basic Info", "Professional Info"]} current={2} hideHeader={true}>
      <PageTitle
        title="Set up your profile — Basic Info"
        subtitle="This information will be visible to businesses on the platform."
      />

      {/* Profile Photo Uploader */}
      <div className="flex flex-col items-center mb-8">
        <div
          onClick={handlePhotoClick}
          className="relative w-28 h-28 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-navy hover:shadow-lg transition-all duration-300 overflow-hidden group bg-white"
        >
          {avatarPreview ? (
            <>
              <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-xs font-semibold">Change Photo</span>
              </div>
            </>
          ) : (
            <span className="text-gray-400 group-hover:text-navy transition-colors duration-300 font-sans text-sm font-semibold tracking-wider">
              Photo
            </span>
          )}
        </div>
        <input
          ref={photoRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <p className="text-[10px] text-gray-400 mt-2 tracking-wider">JPG or PNG, max 2MB</p>
      </div>

      {/* Grid Basic Info Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="First Name *">
          <input
            placeholder="first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`${inputClass} hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
          />
        </Field>
        <Field label="Last Name *">
          <input
            placeholder="last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`${inputClass} hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
          />
        </Field>
        <Field label="Phone Number *">
          <input
            placeholder="+213 655 00 00 00"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={`${inputClass} hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
          />
        </Field>
        <Field label="Wilaya *">
          <div ref={wilayaDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => {
                setWilayaOpen(!wilayaOpen);
                setWilayaSearch("");
              }}
              className={`${inputClass} w-full bg-white text-left flex justify-between items-center hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
            >
              <span className={wilaya ? "text-gray-900" : "text-gray-400"}>
                {wilaya ? WILAYA_CHOICES.find((w) => w.value === wilaya)?.label : "Select Wilaya"}
              </span>
              <span
                className="text-gray-400 text-xs transition-transform duration-300"
                style={{ transform: wilayaOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              >
                ▼
              </span>
            </button>

            {wilayaOpen && (
              <div className="absolute z-30 w-full mt-2 bg-white/95 backdrop-blur-md border border-gray-150 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
                <div className="p-2 border-b border-gray-100">
                  <input
                    type="text"
                    placeholder="Search wilaya..."
                    value={wilayaSearch}
                    onChange={(e) => setWilayaSearch(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-gray-150 rounded-xl focus:border-navy focus:outline-none bg-gray-50/50"
                    autoFocus
                  />
                </div>
                <div className="max-h-48 overflow-y-auto py-1">
                  {WILAYA_CHOICES.filter((w) =>
                    w.label.toLowerCase().includes(wilayaSearch.toLowerCase())
                  ).map((w) => (
                    <button
                      key={w.value}
                      type="button"
                      onClick={() => {
                        setWilaya(w.value);
                        setWilayaOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs flex justify-between items-center hover:bg-navy/5 transition-colors ${
                        wilaya === w.value ? "bg-navy/5 text-navy font-semibold" : "text-gray-700"
                      }`}
                    >
                      <span>{w.label}</span>
                      {wilaya === w.value && <span className="text-navy">✓</span>}
                    </button>
                  ))}
                  {WILAYA_CHOICES.filter((w) =>
                    w.label.toLowerCase().includes(wilayaSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="px-4 py-3 text-xs text-gray-400 text-center italic">
                      No results found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </Field>
        <Field label="Address *" className="md:col-span-2">
          <input
            placeholder="Enter resedential address (Didouch Mourad)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={`${inputClass} hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
          />
        </Field>
      </div>

      <Field label="About Me / Bio" className="mt-4">
        <textarea
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write a brief, professional introduction highlighting your experience and passions..."
          className={`${inputClass} resize-y hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
        />
      </Field>

      <AlertError>{error}</AlertError>

      <div className="flex justify-end mt-8">
        <PrimaryButton
          portal="professional"
          loading={loading}
          onClick={handleContinue}
          className="btn-linkio-navy px-10 py-3 rounded-full transition-colors duration-300"
        >
          Next
        </PrimaryButton>
      </div>
    </OnboardingStepLayout>
  );
}

export function ProfessionalDocumentsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  const theme = getPortal("professional");
  const fileRef = useRef(null);

  // Form State
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [yearsExperience, setYearsExperience] = useState(0);
  const [availability, setAvailability] = useState("AVAILABLE");
  
  // Interactive Skills State
  const [skillQuery, setSkillQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]); // [{ id, name }]
  
  // Education State (Optional)
  const [institution, setInstitution] = useState("");
  const [degree, setDegree] = useState("");
  const [field, setField] = useState("");

  // Experience State (Optional)
  const [companyName, setCompanyName] = useState("");
  const [jobRole, setJobRole] = useState("");

  // Portfolio State (Optional)
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Resume File State
  const [resumeFile, setResumeFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Skill search debounce
  useEffect(() => {
    if (!skillQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const results = await searchSkills(skillQuery);
        setSuggestions(results);
      } catch (err) {
        console.error("Failed to search skills", err);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [skillQuery]);

  const handleSelectSkill = (skill) => {
    if (!selectedSkills.some((s) => s.id === skill.id)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSkillQuery("");
    setSuggestions([]);
  };


  const handleRemoveSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter((s) => s.id !== skillId));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed for CV/Resume.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("CV file must be under 5MB.");
        return;
      }
      setResumeFile(file);
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (loading) return;
    setError("");

    if (!professionalTitle.trim()) {
      setError("Professional title / Job title is required.");
      return;
    }
    
    // Validate conditional fields
    if ((companyName.trim() && !jobRole.trim()) || (!companyName.trim() && jobRole.trim())) {
      setError("Please fill out both Company Name and Job Role for your work experience.");
      return;
    }

    if ((institution.trim() || degree.trim() || field.trim()) && 
        (!institution.trim() || !degree.trim() || !field.trim())) {
      setError("Please fill out all education fields (Institution, Degree, and Field) or leave them all blank.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("professional_title", professionalTitle);
      formData.append("years_experience", Number(yearsExperience));
      formData.append("availability", availability);
      
      if (resumeFile) {
        formData.append("resume_file", resumeFile);
      }
      
      if (institution.trim()) formData.append("institution", institution);
      if (degree.trim()) formData.append("degree", degree);
      if (field.trim()) formData.append("field", field);
      
      if (companyName.trim()) formData.append("company_name", companyName);
      if (jobRole.trim()) formData.append("job_role", jobRole);
      
      if (portfolioUrl.trim()) formData.append("portfolio_url", portfolioUrl);

      // Selected skill primary keys
      selectedSkills.forEach((s) => {
        formData.append("skills", s.id);
      });

      await postIndividualProfileSetup(formData);
      navigate("/professional/dashboard");
    } catch (err) {
      setError(parseApiError(err, "Unable to save professional details. Please check your inputs."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <OnboardingStepLayout portal="professional" steps={["Account", "Basic Info", "Professional Info"]} current={3} hideHeader={true}>
      <button
        type="button"
        onClick={() => navigate("/professional/onboarding/profile", { state: { email } })}
        className="text-sm text-gray-400 hover:text-gray-950 transition-colors mb-6 inline-flex items-center gap-1.5 font-medium"
      >
        ← Back
      </button>

      <PageTitle
        title="Set up your profile — Professional Details"
        subtitle="Provide your expertise and background to match with opportunities."
      />

      <div className="space-y-6">
        {/* Core Professional Fields */}
        <section className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-150 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
            <h3 className="font-semibold text-navy text-sm uppercase tracking-wider">Professional Info</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Job / Professional Title *">
              <input
                placeholder="e.g. Senior Full Stack Engineer"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                className={`${inputClass} hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
              />
            </Field>
            <Field label="Years of Experience *">
              <input
                type="number"
                min="0"
                placeholder="e.g. 5"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Math.max(0, parseInt(e.target.value) || 0))}
                className={`${inputClass} hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
              />
            </Field>
            <Field label="Availability *" className="md:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-1.5">
                {AVAILABILITY_CHOICES.map((c) => {
                  const isSelected = availability === c.value;
                  let cardStyle = "";
                  let dotColor = "";
                  
                  if (c.value === "AVAILABLE") {
                    cardStyle = isSelected
                      ? "border-emerald-500 bg-emerald-50/20 shadow-[0_8px_20px_rgba(16,185,129,0.15)] -translate-y-0.5 ring-1 ring-emerald-500/25 font-bold text-navy"
                      : "border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/5 hover:-translate-y-0.5 hover:shadow-md";
                    dotColor = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
                  } else if (c.value === "OPEN") {
                    cardStyle = isSelected
                      ? "border-blue-500 bg-blue-50/20 shadow-[0_8px_20px_rgba(59,130,246,0.15)] -translate-y-0.5 ring-1 ring-blue-500/25 font-bold text-navy"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/5 hover:-translate-y-0.5 hover:shadow-md";
                    dotColor = "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]";
                  } else {
                    cardStyle = isSelected
                      ? "border-gray-400 bg-gray-50/50 shadow-[0_8px_20px_rgba(156,163,175,0.15)] -translate-y-0.5 ring-1 ring-gray-400/25 font-bold text-navy"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/5 hover:-translate-y-0.5 hover:shadow-md";
                    dotColor = "bg-gray-400";
                  }

                  return (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setAvailability(c.value)}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${cardStyle}`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full ${dotColor} flex-shrink-0`} />
                      <span className={`text-xs font-semibold ${isSelected ? "text-navy font-bold" : "text-gray-600 font-medium"}`}>
                        {c.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Field>
          </div>
        </section>

        {/* Skills Section */}
        <section className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-150 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
            <h3 className="font-semibold text-navy text-sm uppercase tracking-wider">Skills & Expertise</h3>
          </div>
          
          <div className="relative">
            <div className={`${inputClass} flex flex-wrap gap-2 items-center min-h-[48px] py-2 px-3.5 mb-2 focus-within:border-navy focus-within:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}>
              {selectedSkills.map((s) => (
                <span
                  key={s.id}
                  className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-medium ${theme.skillTag} hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm animate-fade-in`}
                >
                  {s.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s.id)}
                    className="text-navy/60 hover:text-navy focus:outline-none font-bold text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
                placeholder={selectedSkills.length === 0 ? "Search skills..." : "Add skill..."}
                className="flex-grow bg-transparent border-0 outline-none p-0 text-xs focus:ring-0 focus:outline-none min-w-[150px] text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Suggestions dropdown */}
            {(suggestions.length > 0 || (skillQuery.trim() && suggestions.length === 0)) && (
              <div className="absolute z-25 w-full bg-white/95 backdrop-blur-md border border-gray-150 rounded-2xl shadow-xl max-h-48 overflow-y-auto mt-1 animate-fade-in">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSkill(s)}
                    className="w-full text-left px-4 py-2.5 hover:bg-navy/5 text-xs flex justify-between items-center border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <span className="font-medium text-gray-800">{s.name}</span>
                    <span className="text-[10px] text-navy bg-pro-blue/40 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">{s.category}</span>
                  </button>
                ))}
                {skillQuery.trim() && suggestions.length === 0 && (
                  <div className="px-4 py-3 text-xs text-gray-400 italic text-center">
                    No matching skills found
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Work Experience Section */}
        <section className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-150 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
            <h3 className="font-semibold text-navy text-sm uppercase tracking-wider">Work Experience (Optional)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company Name">
              <input
                placeholder="Enter last employed company (e.g. Algiers Tech Solutions)"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={`${inputClass} hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
              />
            </Field>
            <Field label="Job Role">
              <input
                placeholder="Enter job title (e.g. Frontend Engineer)"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className={`${inputClass} hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
              />
            </Field>
          </div>
        </section>

        {/* Education Section */}
        <section className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-150 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
            <h3 className="font-semibold text-navy text-sm uppercase tracking-wider">Education (Optional)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Institution">
              <input
                placeholder="Enter school or university name (e.g. USTHB)"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className={`${inputClass} hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
              />
            </Field>
            <Field label="Degree">
              <input
                placeholder="Enter degree type (e.g. Master's)"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className={`${inputClass} hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
              />
            </Field>
            <Field label="Field of Study">
              <input
                placeholder="Enter major (e.g. Software Engineering)"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className={`${inputClass} hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
              />
            </Field>
          </div>
        </section>

        {/* Portfolio & CV Section */}
        <section className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-gray-150 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-4 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-out">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-2">
            <h3 className="font-semibold text-navy text-sm uppercase tracking-wider">Links & Documents</h3>
          </div>
          <div className="space-y-4">
            <Field label="Portfolio URL (Optional)">
              <input
                type="url"
                placeholder="https://yourportfolio.dev"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className={`${inputClass} hover:border-gray-400 focus:border-navy focus:shadow-[0_0_15px_rgba(27,45,82,0.05)] transition-all duration-300`}
              />
            </Field>
            
            <div className="pt-2">
              <p className="text-sm font-semibold mb-2 text-gray-700">Upload CV / Resume (Optional)</p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-navy/15 rounded-2xl py-12 flex flex-col items-center gap-3 cursor-pointer hover:border-navy hover:bg-navy/[0.02] hover:shadow-md transition-all duration-300 bg-ivory-warm group"
              >
                {resumeFile ? (
                  <>
                    <span className="text-4xl text-emerald-500 group-hover:scale-110 transition-transform duration-300">✓</span>
                    <p className="text-sm font-semibold text-emerald-700">Resume / CV Attached</p>
                    <p className="text-xs text-gray-500 bg-white border border-gray-100 rounded-full px-3 py-1 shadow-sm font-medium">
                      {resumeFile.name} ({(resumeFile.size / 1024).toFixed(0)} KB)
                    </p>
                  </>
                ) : (
                  <>
                    <span className="text-4xl text-gray-300 group-hover:text-navy group-hover:scale-110 transition-all duration-300">📄</span>
                    <p className="text-sm font-semibold text-gray-700 group-hover:text-navy transition-colors duration-300">Click to browse your CV</p>
                    <p className="text-xs text-gray-400">PDF format accepted · Maximum size 5 MB</p>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>

      <AlertError>{error}</AlertError>

      <div className="flex justify-end mt-8">
        <PrimaryButton
          portal="professional"
          loading={loading}
          onClick={handleSubmit}
          className="btn-linkio-navy px-8 py-3 rounded-full transition-colors duration-300"
        >
          Complete Profile setup
        </PrimaryButton>
      </div>
    </OnboardingStepLayout>
  );
}

export function ProfessionalPendingPage() {
  const navigate = useNavigate();

  return (
    <PendingStatusLayout
      portal="professional"
      title={
        <>
          Profile submitted —
          <br />
          pending verification
        </>
      }
      description="Our admin team will review your profile and documents within 24–48 hours. You'll receive an email once your account is verified."
      buttonLabel="Go to dashboard →"
      onButton={() => navigate("/professional/dashboard")}
    />
  );
}
