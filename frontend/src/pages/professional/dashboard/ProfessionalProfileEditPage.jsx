import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Field, inputClass } from "../../../components/ui";
import { getMyProfileDetails, updateProfile, searchSkills, createSkill } from "../../../services/profilesApi";
import { parseApiError } from "../../../services/auth";

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
  { value: "relizane", label: "Relizane" }
];

export default function ProfessionalProfileEditPage() {
  const navigate = useNavigate();
  const suggestionsRef = useRef(null);

  // States
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [yearsExperience, setYearsExperience] = useState(0);
  const [wilaya, setWilaya] = useState("");
  const [address, setAddress] = useState("");
  const [professionalTitle, setProfessionalTitle] = useState("");
  const [availability, setAvailability] = useState("AVAILABLE");
  const [bio, setBio] = useState("");

  // Skills
  const [selectedSkills, setSelectedSkills] = useState([]); // [{ id, name }]
  const [skillInput, setSkillInput] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Educations
  const [educations, setEducations] = useState([]); // [{ institution, degree, field }]
  const [newEduDegree, setNewEduDegree] = useState("");
  const [newEduField, setNewEduField] = useState("");
  const [newEduInstitution, setNewEduInstitution] = useState("");

  // Work Experiences
  const [workExperiences, setWorkExperiences] = useState([]); // [{ company_name, job_role }]
  const [newWorkRole, setNewWorkRole] = useState("");
  const [newWorkCompany, setNewWorkCompany] = useState("");

  // Portfolio links
  const [portfolios, setPortfolios] = useState([]); // [strings]
  const [newPortfolioUrl, setNewPortfolioUrl] = useState("");

  // File Uploads
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [cvFile, setCvFile] = useState(null);
  const [currentCvUrl, setCurrentCvUrl] = useState("");

  // Fetch real profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getMyProfileDetails();
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
        setPhone(data.phone || "");
        setYearsExperience(data.years_experience || 0);
        setWilaya(data.wilaya || "");
        setAddress(data.address || "");
        setProfessionalTitle(data.professional_title || "");
        setAvailability(data.availability || "AVAILABLE");
        setBio(data.bio || "");

        if (data.skills) {
          setSelectedSkills(
            data.skills.map((s) => ({
              id: s.skill_id,
              name: s.skill_name
            }))
          );
        }

        if (data.educations) {
          setEducations(data.educations);
        }

        if (data.work_experiences) {
          setWorkExperiences(data.work_experiences);
        }

        if (data.portfolios) {
          setPortfolios(data.portfolios.map((p) => p.url));
        }

        if (data.avatar) {
          setAvatarPreview(data.avatar);
        }

        if (data.resume_file) {
          setCurrentCvUrl(data.resume_file);
        }
      } catch (err) {
        setError(parseApiError(err, "Unable to load profile."));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Debounced skill suggestions
  useEffect(() => {
    if (!skillInput.trim()) {
      setSkillSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await searchSkills(skillInput);
        setSkillSuggestions(res);
      } catch (err) {
        console.error("Error searching skills:", err);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [skillInput]);

  // Click outside suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dynamic Profile Completion calculator
  const calculateCompletion = () => {
    let score = 0;
    let total = 0;

    const fields = [
      [firstName, 10],
      [lastName, 10],
      [phone, 10],
      [wilaya, 10],
      [address, 10],
      [professionalTitle, 10],
      [bio, 15],
      [selectedSkills.length > 0, 10],
      [educations.length > 0, 10],
      [workExperiences.length > 0, 10],
      [cvFile || currentCvUrl, 5]
    ];

    fields.forEach(([val, weight]) => {
      total += weight;
      if (val) score += weight;
    });

    return Math.round((score / total) * 100);
  };

  // Skill actions
  const handleSelectSkill = (skill) => {
    if (!selectedSkills.some((s) => s.id === skill.id)) {
      setSelectedSkills((p) => [...p, { id: skill.id, name: skill.name }]);
    }
    setSkillInput("");
    setShowSuggestions(false);
  };

  const handleCreateSkill = async () => {
    const name = skillInput.trim();
    if (!name) return;
    try {
      const newSkillObj = await createSkill({ name });
      setSelectedSkills((p) => [...p, { id: newSkillObj.id, name: newSkillObj.name }]);
      setSkillInput("");
      setShowSuggestions(false);
    } catch (err) {
      console.error("Error creating skill:", err);
    }
  };

  const handleRemoveSkill = (skillId) => {
    setSelectedSkills((p) => p.filter((x) => x.id !== skillId));
  };

  // Avatar file upload change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // CV file upload change
  const handleCvChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are allowed for CV.");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("PDF file size must be under 5MB.");
        return;
      }
      setCvFile(file);
      setError("");
    }
  };

  // Form Submit Handler
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");

    try {
      // 1. Save standard text and nested details via JSON
      const payload = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        phone: phone.replace(/\s+/g, ""),
        years_experience: parseInt(yearsExperience) || 0,
        wilaya: wilaya,
        address: address.trim(),
        professional_title: professionalTitle.trim(),
        availability: availability,
        bio: bio.trim(),
        skills: selectedSkills.map((s) => s.id),
        educations: educations.map((e) => ({
          institution: e.institution.trim(),
          degree: e.degree.trim(),
          field: e.field.trim()
        })),
        work_experiences: workExperiences.map((w) => ({
          company_name: w.company_name.trim(),
          job_role: w.job_role.trim()
        })),
        portfolio_urls: portfolios
      };

      await updateProfile(payload);

      // 2. Upload files if any were changed
      if (avatarFile || cvFile) {
        const formData = new FormData();
        if (avatarFile) {
          formData.append("avatar", avatarFile);
        }
        if (cvFile) {
          formData.append("resume_file", cvFile);
        }
        await updateProfile(formData);
      }

      setSuccessMsg("Profile updated successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });

      setTimeout(() => {
        navigate("/professional/dashboard/profile");
      }, 1500);
    } catch (err) {
      setError(parseApiError(err, "Failed to update profile. Please verify your inputs."));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-sm">Loading your profile details...</p>
      </div>
    );
  }

  const completionPct = calculateCompletion();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-4xl text-navy font-normal mb-1">Edit Profile</h1>
        <p className="text-sm text-gray-500">Update how businesses see you</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Left Card: Avatar & Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm h-fit space-y-6">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-4 group">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={`${firstName} ${lastName}`}
                  className="w-24 h-24 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-24 h-24 bg-pro-blue rounded-full flex items-center justify-center text-navy text-2xl font-semibold">
                  {`${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "YB"}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-navy rounded-full text-white text-sm flex items-center justify-center cursor-pointer shadow hover:opacity-90 transition-opacity">
                ✎
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <h2 className="font-serif text-xl text-navy mb-1">{firstName} {lastName}</h2>
            <p className="text-xs text-gray-400 capitalize">
              {professionalTitle || "Professional"} · {wilaya || "Not Set"}
            </p>
          </div>

          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Profile completion</span>
              <span>{completionPct}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-navy rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Right Content Panels */}
        <div className="bg-white rounded-2xl p-8 shadow-sm space-y-8">
          {/* Section: Personal Info */}
          <section>
            <h3 className="font-semibold text-navy mb-5 pb-3 border-b border-gray-100">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="First Name">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Last Name">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Phone Number">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 0550000000"
                  className={inputClass}
                />
              </Field>
              <Field label="Years of Experience">
                <input
                  type="number"
                  min="0"
                  required
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Wilaya">
                <select
                  required
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select Wilaya</option>
                  {WILAYA_CHOICES.map((w) => (
                    <option key={w.value} value={w.value}>
                      {w.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Availability">
                <select
                  required
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className={inputClass}
                >
                  <option value="AVAILABLE">Available Now</option>
                  <option value="OPEN">Open to Opportunities</option>
                  <option value="NOT_AVAILABLE">Not Available</option>
                </select>
              </Field>
              <Field label="Address" className="md:col-span-2">
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Job Title" className="md:col-span-2">
                <input
                  type="text"
                  required
                  value={professionalTitle}
                  onChange={(e) => setProfessionalTitle(e.target.value)}
                  placeholder="e.g. Full Stack Developer"
                  className={inputClass}
                />
              </Field>
            </div>
          </section>

          {/* Section: Skills & Autocomplete */}
          <section>
            <h3 className="font-semibold text-navy mb-4">Skills & Expertise</h3>
            <div className="flex flex-wrap gap-2 items-center min-h-[48px] py-1.5 px-3 mb-4 rounded-linkio bg-ivory-warm border border-transparent">
              {selectedSkills.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex items-center gap-1.5 text-xs bg-pro-blue/40 text-navy px-2.5 py-1 rounded-lg font-medium"
                >
                  {s.name}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(s.id)}
                    className="text-navy/60 hover:text-navy focus:outline-none font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="relative flex-1 min-w-[180px]" ref={suggestionsRef}>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => {
                    setSkillInput(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder={selectedSkills.length === 0 ? "Type skill & select or create" : "Add skill..."}
                  className="w-full bg-transparent border-0 outline-none p-0 text-xs focus:ring-0 focus:outline-none text-gray-700 placeholder-gray-400"
                />

                {showSuggestions && (
                  <div className="absolute z-10 left-0 right-0 mt-2 bg-white border border-gray-150 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {skillSuggestions
                      .filter((s) => !selectedSkills.some((sel) => sel.id === s.id))
                      .map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handleSelectSkill(s)}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-gray-50 flex justify-between items-center text-gray-700"
                        >
                          <span className="font-medium">{s.name}</span>
                          <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase">
                            {s.category}
                          </span>
                        </button>
                      ))}
                    {skillInput.trim() &&
                      !skillSuggestions.some((s) => s.name.toLowerCase() === skillInput.trim().toLowerCase()) && (
                        <button
                          type="button"
                          onClick={handleCreateSkill}
                          className="w-full text-left px-4 py-2.5 text-xs hover:bg-pro-blue/20 text-navy font-semibold flex justify-between items-center border-t border-gray-50"
                        >
                          <span>Create "{skillInput.trim()}"</span>
                          <span className="text-[10px] text-navy/70">+ Add new skill</span>
                        </button>
                      )}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Section: Work Experience */}
          <section className="space-y-4">
            <h3 className="font-semibold text-navy border-b border-gray-100 pb-3">Work Experience</h3>
            <div className="space-y-3">
              {workExperiences.map((w, index) => (
                <div key={index} className="flex justify-between items-center bg-ivory-warm/55 p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-navy-deep">{w.job_role}</p>
                    <p className="text-xs text-gray-500">{w.company_name}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setWorkExperiences((p) => p.filter((_, i) => i !== index))}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <input
                type="text"
                placeholder="Job Role (e.g. Frontend Engineer)"
                value={newWorkRole}
                onChange={(e) => setNewWorkRole(e.target.value)}
                className={`${inputClass} !py-2.5 !px-3`}
              />
              <input
                type="text"
                placeholder="Company Name"
                value={newWorkCompany}
                onChange={(e) => setNewWorkCompany(e.target.value)}
                className={`${inputClass} !py-2.5 !px-3`}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (newWorkRole.trim() && newWorkCompany.trim()) {
                  setWorkExperiences((p) => [
                    ...p,
                    { job_role: newWorkRole.trim(), company_name: newWorkCompany.trim() }
                  ]);
                  setNewWorkRole("");
                  setNewWorkCompany("");
                }
              }}
              disabled={!newWorkRole.trim() || !newWorkCompany.trim()}
              className="px-4 py-2 bg-navy text-white rounded-xl text-xs font-semibold hover:bg-navy/95 disabled:opacity-50 transition-all"
            >
              + Add Work Experience
            </button>
          </section>

          {/* Section: Education */}
          <section className="space-y-4">
            <h3 className="font-semibold text-navy border-b border-gray-100 pb-3">Education</h3>
            <div className="space-y-3">
              {educations.map((e, index) => (
                <div key={index} className="flex justify-between items-center bg-ivory-warm/55 p-4 rounded-xl border border-gray-100 shadow-sm">
                  <div>
                    <p className="text-sm font-semibold text-navy-deep">{e.degree} in {e.field}</p>
                    <p className="text-xs text-gray-500">{e.institution}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEducations((p) => p.filter((_, i) => i !== index))}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <input
                type="text"
                placeholder="Degree (e.g. Master)"
                value={newEduDegree}
                onChange={(e) => setNewEduDegree(e.target.value)}
                className={`${inputClass} !py-2.5 !px-3`}
              />
              <input
                type="text"
                placeholder="Field of Study"
                value={newEduField}
                onChange={(e) => setNewEduField(e.target.value)}
                className={`${inputClass} !py-2.5 !px-3`}
              />
              <input
                type="text"
                placeholder="Institution / University"
                value={newEduInstitution}
                onChange={(e) => setNewEduInstitution(e.target.value)}
                className={`${inputClass} !py-2.5 !px-3`}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (newEduDegree.trim() && newEduField.trim() && newEduInstitution.trim()) {
                  setEducations((p) => [
                    ...p,
                    {
                      degree: newEduDegree.trim(),
                      field: newEduField.trim(),
                      institution: newEduInstitution.trim()
                    }
                  ]);
                  setNewEduDegree("");
                  setNewEduField("");
                  setNewEduInstitution("");
                }
              }}
              disabled={!newEduDegree.trim() || !newEduField.trim() || !newEduInstitution.trim()}
              className="px-4 py-2 bg-navy text-white rounded-xl text-xs font-semibold hover:bg-navy/95 disabled:opacity-50 transition-all"
            >
              + Add Education
            </button>
          </section>

          {/* Section: Bio */}
          <section>
            <h3 className="font-semibold text-navy mb-4">About Me</h3>
            <textarea
              rows={4}
              required
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell businesses about your skills, interests and career goals..."
              className={`${inputClass} resize-y`}
            />
          </section>

          {/* Section: Portfolio links */}
          <section className="space-y-4">
            <h3 className="font-semibold text-navy border-b border-gray-100 pb-3">Portfolio Links</h3>
            <div className="space-y-3">
              {portfolios.map((p, index) => (
                <div key={index} className="flex justify-between items-center bg-ivory-warm/55 p-3 rounded-xl border border-gray-100 shadow-sm">
                  <span className="text-xs text-navy-deep font-medium truncate max-w-lg">{p}</span>
                  <button
                    type="button"
                    onClick={() => setPortfolios((prev) => prev.filter((_, i) => i !== index))}
                    className="text-xs text-red-500 hover:text-red-700 font-semibold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <input
                type="url"
                placeholder="Portfolio Link URL (e.g. https://github.com/myusername)"
                value={newPortfolioUrl}
                onChange={(e) => setNewPortfolioUrl(e.target.value)}
                className={`${inputClass} !py-2.5 !px-3 flex-1`}
              />
              <button
                type="button"
                onClick={() => {
                  if (newPortfolioUrl.trim()) {
                    setPortfolios((p) => [...p, newPortfolioUrl.trim()]);
                    setNewPortfolioUrl("");
                  }
                }}
                disabled={!newPortfolioUrl.trim()}
                className="px-4 py-2 bg-navy text-white rounded-xl text-xs font-semibold hover:bg-navy/95 disabled:opacity-50 transition-all"
              >
                + Add Link
              </button>
            </div>
          </section>

          {/* Section: CV & Documents */}
          <section>
            <h3 className="font-semibold text-navy mb-4">CV & Documents</h3>
            <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📄</span>
                <div>
                  <p className="text-sm font-medium text-navy-deep">
                    {cvFile ? cvFile.name : currentCvUrl ? "Your Uploaded CV (PDF)" : "No CV uploaded yet"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {cvFile ? `${(cvFile.size / 1024).toFixed(1)} KB` : "PDF Document · Under 5MB"}
                  </p>
                </div>
              </div>
              <label className="text-sm text-navy font-semibold hover:underline cursor-pointer">
                Replace
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleCvChange}
                  className="hidden"
                />
              </label>
            </div>
          </section>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              disabled={saving}
              onClick={() => navigate("/professional/dashboard/profile")}
              className="px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium hover:bg-gray-50 disabled:opacity-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-2.5 bg-navy text-white rounded-full text-sm font-semibold hover:bg-navy/90 disabled:opacity-50 transition-all"
            >
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
