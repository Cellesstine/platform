import { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { INDUSTRY_OPTIONS, JOB_TYPE_OPTIONS } from "../../../constants/apiChoices";
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

function Dropdown({ value, onChange, options, placeholder = "Select option" }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const clickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  const selectedOpt = options.find((o) => o.value === value);
  const displayLabel = selectedOpt ? selectedOpt.label : placeholder;

  return (
    <div className="relative min-w-[160px] flex-shrink-0" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3 rounded-2xl bg-white border border-gray-100 text-xs font-semibold text-gray-700 shadow-sm flex items-center justify-between gap-3 hover:bg-slate-50 hover:border-gray-200 active:scale-95 transition-all cursor-pointer text-left"
      >
        <span className="truncate">{displayLabel}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-400 transition-transform duration-200 flex-shrink-0 ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="absolute z-30 left-0 right-0 mt-2 bg-white border border-gray-150 rounded-2xl shadow-xl max-h-60 overflow-y-auto py-1.5 animate-slide-up">
          {options.map((opt) => {
            const active = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center justify-between
                  ${active ? "bg-[#0B1E36] text-white" : "text-gray-700 hover:bg-slate-50"}`}
              >
                <span>{opt.label}</span>
                {active && <span className="text-[10px] font-bold">✓</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function ProfessionalAnnouncementsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [wilayaFilter, setWilayaFilter] = useState("ALL");

  const categoryOptions = useMemo(() => [
    { value: "ALL", label: "All categories" },
    ...INDUSTRY_OPTIONS
  ], []);

  const typeOptions = useMemo(() => [
    { value: "ALL", label: "All types" },
    ...JOB_TYPE_OPTIONS
  ], []);

  const wilayaOptions = useMemo(() => [
    { value: "ALL", label: "All Wilayas" },
    ...WILAYA_CHOICES
  ], []);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const loadAnnouncements = async () => {
      try {
        const { data } = await api.get("/jobs/", {
          params: {
            status: "ACTIVE",
            search: search || undefined,
            industry: category !== "ALL" ? category : undefined,
            wilaya: wilayaFilter !== "ALL" ? wilayaFilter : undefined,
          },
        });
        if (cancelled) return;
        setJobs(Array.isArray(data) ? data : []);
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Unable to load announcements."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadAnnouncements();
    return () => {
      cancelled = true;
    };
  }, [search, category, wilayaFilter]);

  const filtered = useMemo(() => {
    if (type === "ALL") return jobs;
    return jobs.filter((j) => j.job_type === type);
  }, [jobs, type]);

  return (
    <div>
      <h1 className="font-serif text-4xl text-navy font-normal mb-1">Announcements</h1>
      <p className="text-sm text-gray-500 mb-6">Browse job openings and freelance opportunities</p>

      <div className="flex flex-col md:flex-row gap-3 mb-8">
        <div className="flex-1 relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search jobs, skills, companies..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-100 text-sm outline-none focus:border-navy shadow-sm"
          />
        </div>
        <Dropdown
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          placeholder="All categories"
        />
        <Dropdown
          value={type}
          onChange={setType}
          options={typeOptions}
          placeholder="All types"
        />
        <Dropdown
          value={wilayaFilter}
          onChange={setWilayaFilter}
          options={wilayaOptions}
          placeholder="All Wilayas"
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading announcements...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((job) => (
          <article
            key={job.id}
            className="bg-white rounded-3xl p-6 border border-gray-150/70 hover:border-[#0B1E36]/40 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 flex flex-col justify-between group"
          >
            <div>
              {/* Card Header: Avatar & Company Info & Job Type */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {job.enterprise_avatar ? (
                    <img
                      src={job.enterprise_avatar}
                      alt={job.enterprise_name}
                      className="w-10 h-10 object-cover rounded-xl border border-gray-100"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-sm"
                      style={{ background: "linear-gradient(135deg, #0B1E36 0%, #1d3d63 100%)" }}
                    >
                      {(job.enterprise_name || "CO").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <span className="font-bold text-sm text-gray-800 block">{job.enterprise_name}</span>
                    <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                      {job.wilaya_display || job.wilaya} · {job.industry_display || job.industry}
                    </span>
                  </div>
                </div>
                
                <span className="bg-[#0B1E36]/5 text-[#0B1E36] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#0B1E36]/10">
                  {job.job_type_display || job.job_type || "Full Time"}
                </span>
              </div>

              {/* Role Title */}
              <h2 className="font-serif font-bold text-lg text-gray-900 mb-2 group-hover:text-[#0B1E36] transition-colors">
                {job.role_display || job.role}
              </h2>

              {/* Real Description */}
              {job.description && (
                <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed font-sans bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
                  {job.description}
                </p>
              )}

              {/* Experience required */}
              {job.experience_required !== undefined && (
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <span>Experience Required:</span>
                  <span className="text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md font-sans font-medium lowercase">
                    {job.experience_required} {job.experience_required === 1 ? "year" : "years"}
                  </span>
                </div>
              )}

              {/* Required Skills tags */}
              {job.required_skills && job.required_skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {job.required_skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-blue-50/50 text-[#0B1E36] text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-blue-100/50"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Card Footer: Deadline & Applicant Stats & CTA */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                  {job.deadline ? `Deadline: ${job.deadline}` : "Open recruitment"}
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => navigate(`/professional/dashboard/announcements/${job.id}`)}
                className="px-5 py-2.5 bg-[#0B1E36] hover:bg-[#132c4d] text-white rounded-full text-xs font-bold tracking-wide transition-all shadow-sm shadow-[#0B1E36]/10 hover:shadow-md hover:shadow-[#0B1E36]/20 cursor-pointer border border-[#0B1E36] active:scale-95"
              >
                Apply Now →
              </button>
            </div>
          </article>
        ))}
      </div>
      )}
    </div>
  );
}
