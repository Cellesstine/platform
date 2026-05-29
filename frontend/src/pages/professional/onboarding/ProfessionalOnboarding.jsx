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
import { canSubmitAccountForm } from "../../../utils/accountValidation";
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
  createSkill,
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

const profBenefits = [
  "Build a verified skill profile",
  "Apply to jobs across 69 wilayas",
  "Receive freelance requests directly",
  "One profile — employee and freelancer",
];

export function ProfessionalAccountPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canContinue = canSubmitAccountForm({
    email,
    password,
    confirmPassword,
    agreedToTerms,
  });

  const handleContinue = async () => {
    if (!canContinue || loading) return;
    const trimmed = email.trim();
    setLoading(true);
    setError("");
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
      setError(parseApiError(err, "Unable to create your account. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const profLeft = (
    <>
      <p className="text-[11px] tracking-widest text-white/50 uppercase mb-1">Professional</p>
      <p className="text-[11px] tracking-widest text-gold-light uppercase mb-8">Step 1 of 3 — Account</p>
      <h2 className="font-serif text-4xl font-normal leading-snug mb-10">
        Your next opportunity starts here.
      </h2>
      <ul className="space-y-4">
        {profBenefits.map((b) => (
          <li key={b} className="flex items-start gap-3 text-sm text-white/90">
            <span className="w-5 h-5 rounded-full bg-white/15 flex items-center justify-center text-gold-light text-xs flex-shrink-0 mt-0.5">
              ✓
            </span>
            {b}
          </li>
        ))}
      </ul>
    </>
  );

  const theme = getPortal("professional");

  return (
    <PortalSplitLayout portal="professional" leftContent={profLeft} backTo="/">
      <PageTitle title="Create your account" subtitle="Your login credentials for Linkio." />

      <Field label="Email Address" className="mb-4">
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Password" className="mb-4">
        <input
          type="password"
          placeholder="Enter a password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
        <p className="text-xs text-gray-500 mt-1.5">At least 8 characters</p>
      </Field>
      <Field label="Confirm Password" className="mb-4">
        <input
          type="password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className={inputClass}
        />
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
    <OnboardingStepLayout portal="professional" steps={["Account", "Basic Info", "Professional Info"]} current={2}>
      <PageTitle
        title="Set up your profile — Basic Info"
        subtitle="This information will be visible to businesses on the platform."
      />

      <div className="flex flex-col items-center mb-8">
        <button
          type="button"
          onClick={handlePhotoClick}
          className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-navy hover:text-navy transition-colors overflow-hidden relative bg-white"
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
          ) : (
            <>
              <span className="text-2xl mb-1">👤</span>
              <span className="text-xs">Upload photo</span>
            </>
          )}
        </button>
        <input
          ref={photoRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={handlePhotoChange}
        />
        <p className="text-xs text-gray-400 mt-2">JPG or PNG, max 2MB</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="First Name *">
          <input
            placeholder="Yacine"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Last Name *">
          <input
            placeholder="Benali"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Phone Number *">
          <input
            placeholder="e.g. 0655000000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Wilaya *">
          <select
            value={wilaya}
            onChange={(e) => setWilaya(e.target.value)}
            className={`${inputClass} bg-white`}
          >
            <option value="">Select Wilaya</option>
            {WILAYA_CHOICES.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Address *" className="md:col-span-2">
          <input
            placeholder="e.g. 12 Rue Didouche Mourad"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="About Me / Bio" className="mt-4">
        <textarea
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell businesses what makes you stand out..."
          className={`${inputClass} resize-y`}
        />
      </Field>

      <AlertError>{error}</AlertError>

      <div className="flex justify-between items-center mt-8">
        <button
          type="button"
          onClick={() =>
            navigate("/professional/onboarding/verify-email", { state: email ? { email } : undefined })
          }
          className="text-sm text-gray-400 hover:text-gray-900"
        >
          ← Back
        </button>
        <PrimaryButton
          portal="professional"
          loading={loading}
          onClick={handleContinue}
          className="btn-linkio-navy px-10 py-3"
        >
          Next Step →
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

  const handleAddCustomSkill = async () => {
    const trimmed = skillQuery.trim();
    if (!trimmed) return;
    try {
      const newSkillObj = await createSkill({ name: trimmed, category: "OTHER" });
      if (!selectedSkills.some((s) => s.id === newSkillObj.id)) {
        setSelectedSkills([...selectedSkills, newSkillObj]);
      }
      setSkillQuery("");
      setSuggestions([]);
    } catch (err) {
      setError(parseApiError(err, "Failed to register custom skill."));
    }
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
    <OnboardingStepLayout portal="professional" steps={["Account", "Basic Info", "Professional Info"]} current={3}>
      <PageTitle
        title="Set up your profile — Professional Details"
        subtitle="Provide your expertise and background to match with opportunities."
      />

      <div className="space-y-6">
        {/* Core Professional Fields */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-semibold text-navy text-sm uppercase tracking-wider mb-2">Professional Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Job / Professional Title *">
              <input
                placeholder="e.g. Full Stack Developer"
                value={professionalTitle}
                onChange={(e) => setProfessionalTitle(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Years of Experience *">
              <input
                type="number"
                min="0"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(Math.max(0, parseInt(e.target.value) || 0))}
                className={inputClass}
              />
            </Field>
            <Field label="Availability *" className="md:col-span-2">
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className={`${inputClass} bg-white`}
              >
                {AVAILABILITY_CHOICES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        {/* Skills Section */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-semibold text-navy text-sm uppercase tracking-wider mb-2">Skills & Expertise</h3>
          
          <div className="relative">
            <div className={`${inputClass} flex flex-wrap gap-2 items-center min-h-[48px] py-1.5 px-3 mb-2`}>
              {selectedSkills.map((s) => (
                <span key={s.id} className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-linkio ${theme.skillTag}`}>
                  {s.name}
                  <button type="button" onClick={() => handleRemoveSkill(s.id)} className="text-navy/60 hover:text-navy focus:outline-none font-bold">
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
                placeholder={selectedSkills.length === 0 ? "Search skills or type a new one..." : "Add skill..."}
                className="flex-1 bg-transparent border-0 outline-none p-0 text-xs focus:ring-0 focus:outline-none min-w-[150px] text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Suggestions dropdown */}
            {(suggestions.length > 0 || skillQuery.trim()) && (
              <div className="absolute z-25 w-full bg-white border border-gray-150 rounded-xl shadow-lg max-h-48 overflow-y-auto mt-1">
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSkill(s)}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 text-xs flex justify-between items-center border-b border-gray-50 last:border-0"
                  >
                    <span>{s.name}</span>
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{s.category}</span>
                  </button>
                ))}
                {skillQuery.trim() && !suggestions.some(s => s.name.toLowerCase() === skillQuery.trim().toLowerCase()) && (
                  <button
                    type="button"
                    onClick={handleAddCustomSkill}
                    className="w-full text-left px-4 py-2.5 hover:bg-navy/5 text-xs text-navy font-semibold flex items-center gap-1.5 border-b border-gray-50 last:border-0"
                  >
                    <span>+ Add custom skill:</span>
                    <span className="italic text-gray-700">"{skillQuery.trim()}"</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Work Experience Section */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-semibold text-navy text-sm uppercase tracking-wider mb-2">Work Experience (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Company Name">
              <input
                placeholder="e.g. Algiers Tech Solutions"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Job Role">
              <input
                placeholder="e.g. Frontend Engineer"
                value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* Education Section */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-semibold text-navy text-sm uppercase tracking-wider mb-2">Education (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Institution">
              <input
                placeholder="e.g. USTHB"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Degree">
              <input
                placeholder="e.g. Bachelor"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Field of Study">
              <input
                placeholder="e.g. Computer Science"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
        </section>

        {/* Portfolio & CV Section */}
        <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="font-semibold text-navy text-sm uppercase tracking-wider mb-2">Links & Documents</h3>
          <div className="space-y-4">
            <Field label="Portfolio URL (Optional)">
              <input
                type="url"
                placeholder="https://myportfolio.com"
                value={portfolioUrl}
                onChange={(e) => setPortfolioUrl(e.target.value)}
                className={inputClass}
              />
            </Field>
            
            <div className="pt-2">
              <p className="text-sm font-semibold mb-2">Upload CV / Resume (Optional)</p>
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
                className="w-full border-2 border-dashed border-navy/15 rounded-linkio-lg py-10 flex flex-col items-center gap-2 hover:border-navy/40 transition-colors bg-ivory-warm"
              >
                {resumeFile ? (
                  <>
                    <span className="text-3xl text-emerald-500">✓</span>
                    <p className="text-sm font-semibold text-emerald-700">Resume Attached</p>
                    <p className="text-xs text-gray-500">{resumeFile.name} ({(resumeFile.size / 1024).toFixed(0)} KB)</p>
                  </>
                ) : (
                  <>
                    <span className="text-3xl text-gray-300">📄</span>
                    <p className="text-sm font-medium text-gray-700">Click to browse your CV</p>
                    <p className="text-xs text-gray-400">PDF accepted · Maximum size 5 MB</p>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>

      <AlertError>{error}</AlertError>

      <div className="flex justify-between items-center mt-8">
        <button
          type="button"
          onClick={() => navigate("/professional/onboarding/profile", { state: { email } })}
          className="text-sm text-gray-400 hover:text-gray-900"
        >
          ← Back
        </button>
        <PrimaryButton
          portal="professional"
          loading={loading}
          onClick={handleSubmit}
          className="btn-linkio-navy px-8 py-3"
        >
          Complete Profile setup →
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
