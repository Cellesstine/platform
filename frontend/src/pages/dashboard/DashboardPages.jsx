import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  listAnnouncements,
  createAnnouncement,
  publishAnnouncement,
  closeAnnouncement,
  deleteAnnouncement,
} from "../../services/jobsApi";
import { parseApiError } from "../../services/auth";
import { getMyProfileDetails, updateProfile, searchSkills } from "../../services/profilesApi";
import { listApplications, reviewApplication, acceptApplication, rejectApplication } from "../../services/applicationsApi";
import { getMediaUrl } from "../../utils/media";

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



// ── Dashboard Home ────────────────────────────────────────
// ── Dashboard Home ────────────────────────────────────────
export function DashboardHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [companyBio, setCompanyBio] = useState("");
  const [stats, setStats] = useState({ activeCount: 0, totalApplicants: 0 });
  const [verified, setVerified] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      try {
        const [dashboardRes, profileRes] = await Promise.all([
          api.get("/dashboard/"),
          getMyProfileDetails().catch(() => null)
        ]);

        if (cancelled) return;
        setRecentAnnouncements(dashboardRes.data?.recent_announcements || []);

        if (profileRes) {
          setCompanyName(profileRes.company_name || "");
          setCompanyBio(profileRes.bio || "");
          setVerified(profileRes.verified || false);
          
          if (profileRes.id) {
            try {
              const announcementsData = await listAnnouncements({ enterprise: profileRes.id });
              const activeCount = announcementsData.filter(a => a.status === "ACTIVE").length;
              const totalApplicants = announcementsData.reduce((acc, ann) => acc + (ann.applicant_count || 0), 0);
              setStats({ activeCount, totalApplicants });
            } catch (err) {
              console.error("Failed to load statistics:", err);
            }
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Unable to load dashboard data."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Premium Red Cherry Welcome Card */}
      <div className="bg-[#3C0713] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-red-400/10 rounded-full -ml-16 -mb-16 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-grow">
            <i className="text-2xl font-serif text-white tracking-wide block mb-2">Business</i>
            <h1 className="font-serif text-3xl md:text-4xl font-normal leading-tight flex items-center gap-2.5">
              <span className="italic text-slate-100">{companyName || "TechCorp Algérie"}</span>
              {verified && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#0095f6] inline-block align-middle select-none shrink-0" title="Verified Account">
                  <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 0 0-1.06-1.061l-3.8 3.8-1.48-1.48a.75.75 0 1 0-1.06 1.06l2.01 2.01a.75.75 0 0 0 1.06 0l4.33-4.33Z" clipRule="evenodd" />
                </svg>
              )}
            </h1>
            {companyBio && (
              <p className="text-slate-200/90 text-sm leading-relaxed max-w-2xl mt-3 font-serif italic border-l-2 border-white/20 pl-4">
                "{companyBio}"
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => navigate("/dashboard/company-profile")}
            className="flex-shrink-0 bg-white text-[#3C0713] hover:bg-slate-100 active:scale-95 transition-all px-6 py-3 rounded-full text-sm font-semibold shadow-md cursor-pointer"
          >
            View Company Profile
          </button>
        </div>
      </div>

      {!verified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex gap-3 text-sm text-yellow-800">
          <span>⚠</span>
          <span>Account pending verification. You cannot post announcements until approved by admin.</span>
        </div>
      )}

      {/* Dynamic Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { l: "Active announcements", v: String(stats.activeCount) },
          { l: "Total applicants", v: String(stats.totalApplicants) }
        ].map((s) => (
          <div key={s.l} className="linkio-panel px-6 py-5 border border-gray-150/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <p className="text-xs text-gray-400 mb-2 font-medium">{s.l}</p>
            <p className="font-serif text-4xl text-[#3C0713] font-bold">{s.v}</p>
          </div>
        ))}
      </div>

      {/* Real Recent Announcements Card list */}
      <div className="linkio-panel p-6 border border-gray-150/50 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold text-gray-900">Recent announcements</h2>
          <button
            onClick={() => navigate("/dashboard/announcements")}
            className="px-4 py-1.5 bg-[#3C0713] hover:bg-[#5c0b1e] text-white rounded-full text-xs font-bold tracking-wide transition-all shadow-sm shadow-[#3C0713]/10 hover:shadow-md hover:shadow-[#3C0713]/20 cursor-pointer"
          >
            Manage jobs
          </button>
        </div>
        {loading ? (
          <p className="text-center text-sm text-gray-300 py-12">Loading announcements...</p>
        ) : error ? (
          <p className="text-center text-sm text-red-500 py-12">{error}</p>
        ) : recentAnnouncements.length === 0 ? (
          <p className="text-center text-sm text-gray-300 py-12">Post your first announcement to get started.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentAnnouncements.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate("/dashboard/announcements")}
                className="p-5 border border-gray-150 rounded-2xl bg-white hover:border-[#3C0713]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer group"
              >
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <span className="bg-[#3C0713]/5 text-[#3C0713] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#3C0713]/10">
                      {item.job_type || "Full Time"}
                    </span>
                    <span className={`text-[9px] font-bold px-2.5 py-0.5 rounded-full border ${
                      item.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                        : item.status === "CLOSED"
                        ? "bg-red-50 text-red-700 border-red-100"
                        : "bg-gray-50 text-gray-600 border-gray-100"
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold text-gray-900 text-base mb-1.5 group-hover:text-[#3C0713] transition-colors">
                    {item.role_display || ROLE_DISPLAY[item.role] || (item.role ? item.role.replace("_", " ").toLowerCase().replace(/\b\w/g, c => c.toUpperCase()) : "Web Developer")}
                  </h3>
                  <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-gray-500 font-sans">
                    <span>{item.wilaya_display || WILAYA_DISPLAY[item.wilaya] || (item.wilaya ? item.wilaya.charAt(0).toUpperCase() + item.wilaya.slice(1) : "Alger")}</span>
                    <span>·</span>
                    <span>{item.industry_display || INDUSTRY_DISPLAY[item.industry] || item.industry}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Announcements ─────────────────────────────────────────
const badgeClass = {
  ACTIVE: "bg-green-100 text-green-700",
  CLOSED: "bg-red/10 text-red",
  DRAFT: "bg-gray-100 text-gray-500",
};

const INDUSTRY_DISPLAY = {
  TECH: "Technology",
  FINANCE: "Finance & Banking",
  WATER: "Water Industry",
  CONSTRUCTION: "Construction & BTP",
  HEALTHCARE: "Healthcare",
  EDUCATION: "Education",
  RETAIL: "Retail & Commerce",
  ENERGY: "Energy & Oil",
  AGRICULTURE: "Agriculture",
  TRANSPORT: "Transport & Logistics",
  OTHER: "Other"
};
const INDUSTRY_OPTIONS = Object.keys(INDUSTRY_DISPLAY);

const JOB_TYPE_DISPLAY = {
  FULL_TIME: "Full-Time",
  PART_TIME: "Part-Time",
  CONTRACT: "Contract",
  REMOTE: "Remote",
  HYBRID: "Hybrid"
};
const JOB_TYPE_OPTIONS = Object.keys(JOB_TYPE_DISPLAY);

const ROLE_DISPLAY = {
  GENERAL_PRACTITIONER: "General Practitioner",
  SPECIALIST_DOCTOR: "Specialist Doctor",
  NURSE: "Nurse",
  PHARMACIST: "Pharmacist",
  WEB_DEVELOPER: "Web Developer",
  MOBILE_DEVELOPER: "Mobile Developer",
  DATA_SCIENTIST: "Data Scientist",
  IT_PROJECT_MANAGER: "IT Project Manager",
  SYSTEM_ADMINISTRATOR: "System Administrator",
  SALES_REPRESENTATIVE: "Sales Representative",
  SALES_DIRECTOR: "Sales Director",
  PRODUCT_MANAGER: "Product Manager",
  PRIMARY_TEACHER: "Primary School Teacher",
  HIGH_SCHOOL_TEACHER: "High School Teacher",
  TRAINER: "Trainer / Instructor",
  CIVIL_ENGINEER: "Civil Engineer",
  MECHANICAL_ENGINEER: "Mechanical Engineer",
  ARCHITECT: "Architect",
  ACCOUNTANT: "Accountant",
  FINANCIAL_ANALYST: "Financial Analyst",
  AUDITOR: "Auditor",
  COMMUNICATIONS_OFFICER: "Communications Officer",
  COMMUNITY_MANAGER: "Community Manager",
  ADMINISTRATIVE_ASSISTANT: "Administrative Assistant",
  HR_MANAGER: "HR Manager",
  GRAPHIC_DESIGNER: "Graphic Designer",
  UX_UI_DESIGNER: "UX/UI Designer",
  VIDEO_EDITOR: "Video Editor",
  OTHER: "Other"
};
const ROLE_OPTIONS = Object.keys(ROLE_DISPLAY);

const WILAYA_DISPLAY = {
  adrar: 'Adrar',
  chlef: 'Chlef',
  laghouat: 'Laghouat',
  oum_el_bouaghi: 'Oum El Bouaghi',
  batna: 'Batna',
  bejaia: 'Béjaïa',
  biskra: 'Biskra',
  bechar: 'Béchar',
  blida: 'Blida',
  bouira: 'Bouira',
  tamanrasset: 'Tamanrasset',
  tebessa: 'Tébessa',
  tlemcen: 'Tlemcen',
  tiaret: 'Tiaret',
  tizi_ouzou: 'Tizi Ouzou',
  alger: 'Alger',
  djelfa: 'Djelfa',
  jijel: 'Jijel',
  setif: 'Sétif',
  saida: 'Saïda',
  skikda: 'Skikda',
  sidi_bel_abbes: 'Sidi Bel Abbès',
  annaba: 'Annaba',
  guelma: 'Guelma',
  constantine: 'Constantine',
  medea: 'Médéa',
  mostaganem: 'Mostaganem',
  msila: "M'Sila",
  mascara: 'Mascara',
  ouargla: 'Ouargla',
  oran: 'Oran',
  el_bayadh: 'El Bayadh',
  illizi: 'Illizi',
  bordj_bou_arreridj: 'Bordj Bou Arréridj',
  boumerdes: 'Boumerdès',
  el_tarf: 'El Tarf',
  tindouf: 'Tindouf',
  tissemsilt: 'Tissemsilt',
  el_oued: 'El Oued',
  khenchela: 'Khenchela',
  souk_ahras: 'Souk Ahras',
  tipaza: 'Tipaza',
  mila: 'Mila',
  ain_defla: 'Aïn Defla',
  naama: 'Naâma',
  ain_temouchent: 'Aïn Témouchent',
  ghardaia: 'Ghardaïa',
  relizane: 'Relizane'
};
const WILAYA_OPTIONS = Object.keys(WILAYA_DISPLAY);

export function AnnouncementsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [verified, setVerified] = useState(true);

  const loadAnnouncements = async () => {
    const statusFilter = filter === "All" ? "ALL" : filter.toUpperCase();
    const data = await listAnnouncements({
      status: statusFilter,
      search: search || undefined,
    });
    setJobs(data);
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const statusFilter = filter === "All" ? "ALL" : filter.toUpperCase();
        const data = await listAnnouncements({
          status: statusFilter,
          search: search || undefined,
        });
        if (cancelled) return;
        setJobs(data);
        setError("");
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Unable to load announcements."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [filter, search]);

  useEffect(() => {
    let cancelled = false;
    const checkVerification = async () => {
      try {
        const profileRes = await getMyProfileDetails();
        if (!cancelled && profileRes) {
          setVerified(profileRes.verified || false);
        }
      } catch (err) {
        console.error("Failed to load profile for verification check:", err);
      }
    };
    checkVerification();
    return () => {
      cancelled = true;
    };
  }, []);

  const runAction = async (id, action) => {
    setActionLoadingId(id);
    try {
      await action();
      await loadAnnouncements();
      setError("");
    } catch (err) {
      setError(parseApiError(err, "Action failed."));
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-serif text-3xl font-normal mb-1">Manage Jobs</h1>
          <p className="text-sm text-gray-400">Track your announcements, edit listings, and manage applicants.</p>
        </div>
        <button
          disabled={!verified}
          onClick={() => {
            if (verified) navigate("/dashboard/announcements/new");
          }}
          className={`px-5 py-2.5 rounded-full text-xs font-bold tracking-wide transition-all ${
            verified
              ? "bg-[#3C0713] hover:bg-[#5c0b1e] text-white shadow-sm shadow-[#3C0713]/10 hover:shadow-md hover:shadow-[#3C0713]/20 cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
          }`}
        >
          + New Announcement
        </button>
      </div>

      {!verified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex gap-3 text-sm text-yellow-800 mb-6">
          <span>⚠</span>
          <span>Account pending verification. You cannot post announcements until approved by admin.</span>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ l: "Total Listings", v: String(jobs.length) }, { l: "Active", v: String(jobs.filter((j) => j.status === "ACTIVE").length) }, { l: "Total Applications", v: String(jobs.reduce((sum, j) => sum + (j.applicant_count || 0), 0)) }].map((s) => (
          <div key={s.l} className="linkio-panel px-6 py-5">
            <p className="text-xs text-gray-400 mb-2">{s.l}</p>
            <p className="font-serif text-4xl">{s.v}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="linkio-panel p-6 mb-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold">All Announcements</h2>
          <div className="flex gap-3 items-center">
            <div className="flex bg-cream rounded-full p-1 border border-gray-200">
              {["All", "Active", "Draft", "Closed"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all ${filter === f ? "bg-white font-medium text-gray-900" : "text-gray-400"}`}>
                  {f}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none w-44"
              placeholder="Search listings..."
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading announcements...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
        <table className="w-full">
          <thead>
            <tr>{["JOB", "STATUS", "APPLICATIONS", "DEADLINE", "ACTIONS"].map((h) => (
              <th key={h} className="text-left text-[11px] tracking-widest text-gray-300 py-2 px-3 border-b border-gray-100 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="hover:bg-gray-50">
                <td className="py-4 px-3 border-b border-gray-100">
                  <p className="text-sm font-medium">{j.role_display || ROLE_DISPLAY[j.role] || j.role}</p>
                  <p className="text-xs text-gray-400">
                    {j.wilaya_display || WILAYA_DISPLAY[j.wilaya] || j.wilaya} · {j.job_type_display || JOB_TYPE_DISPLAY[j.job_type] || j.job_type} · {j.enterprise_name}
                  </p>
                </td>
                <td className="py-4 px-3 border-b border-gray-100">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeClass[j.status] || "bg-gray-100 text-gray-600"}`}>
                    {j.status}
                  </span>
                </td>
                <td className="py-4 px-3 border-b border-gray-100 text-sm">{j.applicant_count ?? 0}</td>
                <td className="py-4 px-3 border-b border-gray-100 text-sm">{j.deadline || "—"}</td>
                <td className="py-4 px-3 border-b border-gray-100">
                  <div className="flex gap-2">
                    {j.status === "DRAFT" ? (
                      <button
                        onClick={() => {
                          if (verified) {
                            runAction(j.id, () => publishAnnouncement(j.id));
                          }
                        }}
                        disabled={actionLoadingId === j.id || !verified}
                        className={`px-3 py-1.5 text-white rounded-full text-xs disabled:opacity-60 ${
                          verified
                            ? "bg-red hover:bg-red/95 cursor-pointer"
                            : "bg-gray-300 text-gray-500 cursor-not-allowed opacity-60"
                        }`}
                      >
                        Publish
                      </button>
                    ) : null}
                    {j.status === "ACTIVE" ? (
                      <button
                        onClick={() => runAction(j.id, () => closeAnnouncement(j.id))}
                        disabled={actionLoadingId === j.id}
                        className="px-3 py-1.5 border border-gray-200 rounded-full text-xs hover:bg-gray-50 disabled:opacity-60"
                      >
                        Close
                      </button>
                    ) : null}
                    <button
                      onClick={() => runAction(j.id, () => deleteAnnouncement(j.id))}
                      disabled={actionLoadingId === j.id}
                      className="px-3 py-1.5 border border-red/30 text-red rounded-full text-xs hover:bg-red/5 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

// ── New Announcement ──────────────────────────────────────
// ── New Announcement ──────────────────────────────────────
export function NewAnnouncementPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "GENERAL_PRACTITIONER",
    industry: "TECH",
    job_type: "FULL_TIME",
    wilaya: "adrar",
    address: "",
    description: "",
    experience_required: 0,
    deadline: "",
  });
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(true);

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  useEffect(() => {
    let cancelled = false;
    const loadPageData = async () => {
      try {
        const [skillsData, profileRes] = await Promise.all([
          searchSkills("").catch(() => []),
          getMyProfileDetails().catch(() => null)
        ]);
        if (!cancelled) {
          setAllSkills(Array.isArray(skillsData) ? skillsData : []);
          if (profileRes) {
            setVerified(profileRes.verified || false);
          }
        }
      } catch (err) {
        console.error("Failed to load page data:", err);
      }
    };
    loadPageData();
    return () => {
      cancelled = true;
    };
  }, []);

  const submitAnnouncement = async (publishNow) => {
    if (!verified) {
      setError("Account pending verification. You cannot post announcements until approved by admin.");
      return;
    }
    if (!form.address.trim() || !form.description.trim()) {
      setError("Address and description are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const created = await createAnnouncement({
        ...form,
        address: form.address.trim(),
        description: form.description.trim(),
        experience_required: Number(form.experience_required || 0),
        deadline: form.deadline || null,
        required_skills: selectedSkills,
      });
      if (publishNow && created?.id) {
        await publishAnnouncement(created.id);
      }
      navigate("/dashboard/announcements");
    } catch (err) {
      const data = err.response?.data;
      if (typeof data?.error === "string") {
        setError(data.error);
      } else {
        const firstKey = data && typeof data === "object" ? Object.keys(data)[0] : "";
        const message = firstKey ? (Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]) : null;
        setError(message || "Unable to save announcement.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-serif text-3xl font-normal mb-1">New Announcement</h1>
          <p className="text-sm text-gray-400">Post a job opening or freelance mission</p>
        </div>
        <button
          onClick={() => navigate("/dashboard/announcements")}
          className="px-4 py-2 border border-gray-200 rounded-full text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
        >
          ← Back to Announcements
        </button>
      </div>

      {!verified && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex gap-3 text-sm text-yellow-800 mb-6">
          <span>⚠</span>
          <span>Account pending verification. You cannot post announcements until approved by admin.</span>
        </div>
      )}

      {[
        {
          title: "Basic Information",
          content: (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-sm font-medium text-gray-700">Job Role</label>
                  <select disabled={!verified} className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full disabled:opacity-60 disabled:cursor-not-allowed" value={form.role} onChange={(e) => setField("role", e.target.value)}>
                    {ROLE_OPTIONS.map((opt) => <option key={opt} value={opt}>{ROLE_DISPLAY[opt] || opt}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-sm font-medium text-gray-700">Category</label>
                  <select disabled={!verified} className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full disabled:opacity-60 disabled:cursor-not-allowed" value={form.industry} onChange={(e) => setField("industry", e.target.value)}>
                    {INDUSTRY_OPTIONS.map((opt) => <option key={opt} value={opt}>{INDUSTRY_DISPLAY[opt] || opt}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-sm font-medium text-gray-700">Contract Type</label>
                  <select disabled={!verified} className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full disabled:opacity-60 disabled:cursor-not-allowed" value={form.job_type} onChange={(e) => setField("job_type", e.target.value)}>
                    {JOB_TYPE_OPTIONS.map((opt) => <option key={opt} value={opt}>{JOB_TYPE_DISPLAY[opt] || opt}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-sm font-medium text-gray-700">Wilaya</label>
                  <select disabled={!verified} className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full disabled:opacity-60 disabled:cursor-not-allowed" value={form.wilaya} onChange={(e) => setField("wilaya", e.target.value)}>
                    {WILAYA_OPTIONS.map((opt) => <option key={opt} value={opt}>{WILAYA_DISPLAY[opt] || opt}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-sm font-medium text-gray-700">Address</label>
                  <input disabled={!verified} value={form.address} onChange={(e) => setField("address", e.target.value)} placeholder="Exact work address" className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full disabled:opacity-60 disabled:cursor-not-allowed" />
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-sm font-medium text-gray-700">Experience Required (Years)</label>
                  <input disabled={!verified} type="number" min="0" value={form.experience_required} onChange={(e) => setField("experience_required", e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full disabled:opacity-60 disabled:cursor-not-allowed" />
                </div>
              </div>
            </>
          ),
        },
        {
          title: "Required Skills",
          content: (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-gray-500 block mb-2">Select the skills required for this role:</label>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 bg-slate-50 border border-gray-200 rounded-xl">
                {allSkills.length === 0 ? (
                  <p className="text-xs text-gray-400">Loading skills...</p>
                ) : (
                  allSkills.map((skill) => {
                    const isSelected = selectedSkills.includes(skill.id);
                    return (
                      <button
                        key={skill.id}
                        type="button"
                        disabled={!verified}
                        onClick={() => {
                          if (!verified) return;
                          if (isSelected) {
                            setSelectedSkills(selectedSkills.filter(id => id !== skill.id));
                          } else {
                            setSelectedSkills([...selectedSkills, skill.id]);
                          }
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                          !verified
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-60"
                            : isSelected
                            ? "bg-[#3C0713] border-[#3C0713] text-white shadow-sm cursor-pointer"
                            : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 cursor-pointer"
                        }`}
                      >
                        {skill.name}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          ),
        },
        {
          title: "Job Description & Settings",
          content: (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Description <span className="text-red">*</span></label>
              <textarea disabled={!verified} rows={5} value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Describe the role, your team, and responsibilities..."
                className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white resize-y disabled:opacity-60 disabled:cursor-not-allowed" />
              <div className="mt-3">
                <label className="text-sm font-medium block mb-1 text-gray-700">Deadline</label>
                <input disabled={!verified} type="date" value={form.deadline} onChange={(e) => setField("deadline", e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full disabled:opacity-60 disabled:cursor-not-allowed" />
              </div>
            </div>
          ),
        },
      ].map((section) => (
        <div key={section.title} className="linkio-panel p-6 mb-4">
          <h2 className="font-semibold mb-5 pb-3 border-b border-gray-100">{section.title}</h2>
          {section.content}
        </div>
      ))}

      {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
      <div className="flex justify-end gap-3 pb-8">
        <button
          disabled={submitting || !verified}
          className="px-5 py-2.5 border border-[#3C0713] text-[#3C0713] rounded-full text-xs font-bold hover:bg-[#3C0713]/5 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => submitAnnouncement(false)}
        >
          Save as Draft
        </button>
        <button
          disabled={submitting || !verified}
          className="px-7 py-2.5 bg-[#3C0713] hover:bg-[#5c0b1e] text-white rounded-full text-xs font-bold tracking-wide transition-all shadow-sm shadow-[#3C0713]/10 hover:shadow-md hover:shadow-[#3C0713]/20 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={() => submitAnnouncement(true)}
        >
          {submitting ? "Saving..." : "Publish →"}
        </button>
      </div>
    </div>
  );
}

// ── Find Workers ──────────────────────────────────────────
const AVATAR_COLORS = ["#fde68a", "#bfdbfe", "#d1fae5", "#e0e7ff", "#fce7f3", "#fef3c7"];

export function FindWorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [myProfile, setMyProfile] = useState(null);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [selectedWorkerDetails, setSelectedWorkerDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [profilesRes, profileRes] = await Promise.all([
          api.get("/profile/"),
          api.get("/profile/me/").catch(() => null),
        ]);
        if (cancelled) return;
        setWorkers(profilesRes.data || []);
        if (profileRes?.data) {
          setMyProfile(profileRes.data);
        }
        setError("");
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Unable to load professionals."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleViewProfile = async (worker) => {
    setSelectedWorker(worker);
    setSelectedWorkerDetails(null);
    setDetailsLoading(true);
    try {
      if (worker.uidb64) {
        const { data } = await api.get(`/profile/${worker.uidb64}/`);
        setSelectedWorkerDetails(data);
      } else {
        setSelectedWorkerDetails(worker);
      }
    } catch (err) {
      console.error("Error fetching profile details:", err);
      setSelectedWorkerDetails(worker);
    } finally {
      setDetailsLoading(false);
    }
  };

  const filtered = workers.filter((w) => {
    // Exclude current user's profile from the list of workers
    if (myProfile && (w.uidb64 === myProfile.uidb64 || w.id === myProfile.id)) {
      return false;
    }
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      w.full_name?.toLowerCase().includes(q) ||
      w.professional_title?.toLowerCase().includes(q) ||
      w.wilaya?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-normal mb-1">Find Professionals</h1>
      <p className="text-sm text-gray-400 mb-6">Browse verified professionals across Algeria</p>

      <div className="flex gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-navy"
          placeholder="Search by name, skill, title..."
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading professionals...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400">No professional profiles found yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((w, index) => {
            const ini = (w.full_name || "??")
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            
            const displayWilaya = w.wilaya 
              ? w.wilaya.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")
              : "Alger";

            return (
              <div key={w.id} className="bg-white border border-gray-100 rounded-3xl p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between shadow-sm">
                <div>
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold mb-3.5 text-[#0B1E36] shadow-sm"
                    style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                  >
                    {ini}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{w.full_name}</p>
                  <p className="text-xs text-gray-400 mb-3.5">
                    {w.professional_title} · {displayWilaya}
                  </p>
                  <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 bg-green-50 text-green-700 border border-green-200/50 rounded-full inline-block mb-4 font-bold">
                    {w.years_experience ?? 0} yrs experience
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleViewProfile(w)}
                  className="w-full py-2.5 bg-[#0B1E36] hover:bg-[#132c4d] rounded-2xl text-xs text-white font-semibold active:scale-95 transition-all cursor-pointer mt-2 shadow-sm"
                >
                  View Profile
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Premium Profile Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-deep/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl relative animate-slide-up flex flex-col font-sans">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-[#0B1E36] p-6 text-white flex justify-between items-start z-10 rounded-t-3xl">
              <div>
                <span className="text-[10px] tracking-wider text-white/60 uppercase block mb-1">Professional Profile</span>
                <h2 className="font-serif text-2xl font-normal">
                  {selectedWorker.full_name}
                </h2>
                <p className="text-xs text-white/80 mt-1">
                  {selectedWorker.professional_title} · {selectedWorker.wilaya}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedWorker(null);
                  setSelectedWorkerDetails(null);
                }}
                className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1 text-left">
              {detailsLoading ? (
                <div className="py-12 text-center text-gray-500 text-sm">
                  <div className="inline-block w-6 h-6 border-2 border-[#0B1E36] border-t-transparent rounded-full animate-spin mb-3" />
                  <p>Loading full profile details...</p>
                </div>
              ) : (
                (() => {
                  const p = selectedWorkerDetails || selectedWorker;
                  const initials = (p.full_name || "??")
                    .split(" ")
                    .map((part) => part[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase();
                  
                  return (
                    <div className="space-y-6">
                      {/* Quick Overview */}
                      <div className="flex items-center gap-4 border-b border-gray-150 pb-5">
                        {p.avatar ? (
                          <img
                            src={p.avatar}
                            alt={p.full_name}
                            className="w-16 h-16 rounded-full object-cover flex-shrink-0 border border-gray-100"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-[#0B1E36]/10 text-[#0B1E36] rounded-full flex items-center justify-center font-semibold text-lg flex-shrink-0">
                            {initials}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900 text-lg">{p.full_name}</p>
                          <p className="text-sm text-gray-500">{p.professional_title}</p>
                          <span className="text-xs px-2.5 py-1 bg-green-50 text-green-700 border border-green-150 rounded-full inline-block mt-2 font-medium">
                            {p.years_experience ?? 0} years experience
                          </span>
                        </div>
                      </div>

                      {/* Main Grid Details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Info Block */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Contact & Location</h4>
                          <div className="space-y-2 text-sm text-gray-700">
                            <p><span className="text-gray-400 font-medium">Email:</span> {p.email || "Not provided"}</p>
                            <p><span className="text-gray-400 font-medium">Phone:</span> {p.phone || "Not provided"}</p>
                            <p><span className="text-gray-400 font-medium">Wilaya:</span> {p.wilaya ? p.wilaya.split("_").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ") : "Not provided"}</p>
                            <p><span className="text-gray-400 font-medium">Address:</span> {p.address || "Not provided"}</p>
                            <p><span className="text-gray-400 font-medium">Availability:</span> {p.availability === "AVAILABLE" ? "Available Now" : p.availability === "OPEN" ? "Open to Opportunities" : "Not Available"}</p>
                          </div>
                        </div>

                        {/* Skills Block */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Skills</h4>
                          {p.skills && p.skills.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {p.skills.map((s, idx) => (
                                <span key={idx} className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                                  {s.skill_name || s.name || s}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-400">No skills listed yet.</p>
                          )}
                        </div>
                      </div>

                      {/* Bio / About */}
                      <div className="space-y-2 border-t border-gray-150 pt-5">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">About Me</h4>
                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                          {p.bio || "No biography provided yet."}
                        </p>
                      </div>

                      {/* Work Experience */}
                      {p.work_experiences && p.work_experiences.length > 0 && (
                        <div className="space-y-3 border-t border-gray-150 pt-5">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Work Experience</h4>
                          <div className="space-y-3">
                            {p.work_experiences.map((exp, idx) => (
                              <div key={idx} className="text-sm pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                                <p className="font-semibold text-gray-900">{exp.job_role}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{exp.company_name}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Education */}
                      {p.educations && p.educations.length > 0 && (
                        <div className="space-y-3 border-t border-gray-150 pt-5">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Education</h4>
                          <div className="space-y-3">
                            {p.educations.map((edu, idx) => (
                              <div key={idx} className="text-sm pb-2 border-b border-gray-50 last:border-0 last:pb-0">
                                <p className="font-semibold text-gray-900">{edu.degree} in {edu.field}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{edu.institution}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Portfolio Links */}
                      {p.portfolios && p.portfolios.length > 0 && (
                        <div className="space-y-3 border-t border-gray-150 pt-5">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Portfolio Links</h4>
                          <div className="space-y-2">
                            {p.portfolios.map((port, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                                <span className="text-xs text-gray-600 truncate max-w-[280px]">{port.url || port}</span>
                                <a
                                  href={port.url || port}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-navy font-semibold hover:underline"
                                >
                                  Visit Link →
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Resume / CV Document */}
                      {p.resume_file && (
                        <div className="space-y-3 border-t border-gray-150 pt-5">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Resume / CV</h4>
                          <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">📄</span>
                              <span className="text-xs font-medium text-gray-700">CV Document (PDF)</span>
                            </div>
                            <a
                              href={p.resume_file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-navy font-semibold hover:underline"
                            >
                              View Document →
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-4 border-t border-gray-100 flex justify-end gap-3 rounded-b-3xl">
              <button
                type="button"
                onClick={() => {
                  setSelectedWorker(null);
                  setSelectedWorkerDetails(null);
                }}
                className="px-6 py-2.5 bg-[#0B1E36] hover:bg-[#132c4d] text-white rounded-full text-xs font-semibold active:scale-95 transition-all cursor-pointer shadow-md"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

// ── Company Profile Edit ──────────────────────────────────
export function CompanyProfileEditPage() {
  const navigate = useNavigate();
  
  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("OTHER");
  const [companySize, setCompanySize] = useState("STARTUP");
  const [wilaya, setWilaya] = useState("alger");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [verified, setVerified] = useState(false);

  const fileInputRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const data = await getMyProfileDetails();
        if (cancelled) return;
        if (data) {
          setCompanyName(data.company_name || "");
          setIndustry(data.industry || "OTHER");
          setCompanySize(data.company_size || "STARTUP");
          setWilaya(data.wilaya || "alger");
          setAddress(data.address || "");
          setPhone(data.phone || "");
          setWebsite(data.website || "");
          setBio(data.bio || "");
          setVerified(data.verified || false);
          
          if (data.avatar) {
            setAvatarPreview(getMediaUrl(data.avatar));
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Unable to load company profile."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("Logo image size cannot exceed 2MB.");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
      setError("");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      setError("Company Name is required.");
      return;
    }
    if (!address.trim()) {
      setError("Address is required.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      // 1. Update text fields (partial update)
      const payload = {
        company_name: companyName.trim(),
        industry,
        company_size: companySize,
        wilaya,
        address: address.trim(),
        phone: phone.trim(),
        website: website.trim(),
        bio: bio.trim(),
      };
      
      await updateProfile(payload);

      // 2. Update avatar if a new one is selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        await updateProfile(formData);
      }

      setSuccess("Company profile updated successfully!");
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => {
        navigate("/dashboard/company-profile");
      }, 1500);
    } catch (err) {
      setError(parseApiError(err, "Unable to save company profile changes."));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-sm animate-pulse">Loading company profile...</p>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "TC";
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "TC";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || "")).toUpperCase();
  };

  const initials = getInitials(companyName);

  return (
    <form onSubmit={handleSave}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-serif text-3xl font-normal mb-1">Edit Company Profile</h1>
          <p className="text-sm text-gray-400">Changes are visible to all users on the platform.</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => navigate("/dashboard/company-profile")}
            className="px-4 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-full text-sm font-medium transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 bg-[#3C0713] hover:bg-[#5c0b1e] text-white rounded-full text-sm font-medium transition-all disabled:opacity-50 shadow-sm cursor-pointer"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium shadow-sm flex items-center gap-3 animate-fade-in">
          <span>⚠</span>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm font-medium shadow-sm flex items-center gap-3 animate-fade-in">
          <span className="text-lg">✓</span>
          <p>{success}</p>
        </div>
      )}

      {/* Cover */}
      <div className="linkio-panel overflow-hidden mb-5">
        <div className="h-36 bg-gradient-to-br from-[#3C0713] to-[#25040c] flex items-end justify-end p-3 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#3C0713]/80 to-navy/40 mix-blend-multiply" />
        </div>
        <div className="px-6 pb-5 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="flex gap-4 items-end -mt-8 relative z-10">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="w-20 h-20 bg-white border-2 border-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-md relative overflow-hidden group cursor-pointer hover:border-[#3C0713] hover:shadow-lg transition-all duration-300"
            >
              {avatarPreview ? (
                <img src={getMediaUrl(avatarPreview)} alt="Company Logo" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <span className="text-gray-700">{initials}</span>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-white text-[10px] font-semibold">Edit Logo</span>
              </div>
              {verified && (
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#3C0713] rounded-full flex items-center justify-center text-white text-[9px] shadow-sm font-bold">
                  ✓
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-lg">{companyName || "TechCorp Algérie"}</p>
              <p className="text-sm text-gray-400">
                {verified ? "Verified Company Profile" : "Unverified Company Profile"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-xs bg-[#3C0713] hover:bg-[#5c0b1e] text-white px-4 py-2 rounded-full font-medium transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            ✏ Edit Logo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Form */}
      <div className="linkio-panel p-6 space-y-6">
        <div>
          <h2 className="font-semibold text-navy text-sm uppercase tracking-wider pb-3 border-b border-gray-100">
            Basic Information
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 mb-2">
            <label className="text-sm font-medium">Company Name *</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full transition-all duration-300"
            />
          </div>

          <div className="flex flex-col gap-1 mb-2">
            <label className="text-sm font-medium">Industry / Sector *</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full transition-all duration-300"
            >
              {INDUSTRY_CHOICES.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 mb-2">
            <label className="text-sm font-medium">Company Size *</label>
            <select
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full transition-all duration-300"
            >
              {COMPANY_SIZE_CHOICES.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 mb-2">
            <label className="text-sm font-medium">Headquarters Wilaya *</label>
            <select
              value={wilaya}
              onChange={(e) => setWilaya(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full transition-all duration-300"
            >
              {WILAYA_CHOICES.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 mb-2">
            <label className="text-sm font-medium">Address *</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full transition-all duration-300"
            />
          </div>

          <div className="flex flex-col gap-1 mb-2">
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +213555123456"
              className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full transition-all duration-300"
            />
          </div>

          <div className="flex flex-col gap-1 mb-2 md:col-span-2">
            <label className="text-sm font-medium">Website URL</label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourcompany.dz"
              className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full transition-all duration-300"
            />
          </div>

          <div className="flex flex-col gap-1 mb-2 md:col-span-2">
            <label className="text-sm font-medium">Company Biography / About</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your company's mission, values, products or services..."
              rows={4}
              className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full transition-all duration-300 resize-y"
            />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
          <button
            type="button"
            disabled={saving}
            onClick={() => navigate("/dashboard/company-profile")}
            className="px-5 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 rounded-full text-sm font-medium transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-2.5 bg-[#3C0713] hover:bg-[#5c0b1e] text-white rounded-full text-sm font-semibold disabled:opacity-50 transition-all cursor-pointer shadow-sm"
          >
            {saving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>

      </div>
    </form>
  );
}

// ── Company Profile View ──────────────────────────────────
export function CompanyProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [company, setCompany] = useState(null);
  const [stats, setStats] = useState({ announcementsCount: 0, applicantsCount: 0 });
  const [applicantIncrease, setApplicantIncrease] = useState(12);
  const [monthlyStats, setMonthlyStats] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const profileData = await getMyProfileDetails();
        if (cancelled) return;
        setCompany(profileData);

        let announcementsCount = 0;
        let applicantsCount = 0;

        try {
          const announcementsData = await listAnnouncements();
          announcementsCount = announcementsData.length;
        } catch (err) {
          console.error("Failed to load announcements count:", err);
        }

        try {
          const applicationsData = await listApplications();
          applicantsCount = applicationsData.length;

          if (applicationsData.length > 0) {
            // 1. Applicant Increase Percent: Dynamic comparison of current 30 days vs previous 30 days
            const now = new Date();
            const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

            const currentMonthApps = applicationsData.filter(app => new Date(app.created_at) >= thirtyDaysAgo);
            const previousMonthApps = applicationsData.filter(app => {
              const date = new Date(app.created_at);
              return date >= sixtyDaysAgo && date < thirtyDaysAgo;
            });

            const currentCount = currentMonthApps.length;
            const previousCount = previousMonthApps.length;

            if (previousCount > 0) {
              const pct = Math.round(((currentCount - previousCount) / previousCount) * 100);
              setApplicantIncrease(pct);
            } else if (currentCount > 0) {
              setApplicantIncrease(100);
            } else {
              setApplicantIncrease(0);
            }

            // 2. Calculate dynamic applicant stats for the past 12 months
            const monthsData = [];
            
            // Generate list of past 12 months (e.g. { name: "Jan", month: 0, year: 2026, count: 0 })
            for (let i = 11; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              monthsData.push({
                name: d.toLocaleDateString("en-US", { month: "short" }),
                month: d.getMonth(),
                year: d.getFullYear(),
                count: 0
              });
            }

            // Group applications by month
            applicationsData.forEach(app => {
              const appDate = new Date(app.created_at);
              const m = appDate.getMonth();
              const y = appDate.getFullYear();
              
              const found = monthsData.find(item => item.month === m && item.year === y);
              if (found) {
                found.count += 1;
              }
            });

            setMonthlyStats(monthsData);
          } else {
            // Generate empty past 12 months
            const monthsData = [];
            const now = new Date();
            for (let i = 11; i >= 0; i--) {
              const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
              monthsData.push({
                name: d.toLocaleDateString("en-US", { month: "short" }),
                month: d.getMonth(),
                year: d.getFullYear(),
                count: 0
              });
            }
            setMonthlyStats(monthsData);
          }
        } catch (err) {
          console.error("Failed to load applications count & calculate stats:", err);
        }

        if (cancelled) return;
        setStats({
          announcementsCount,
          applicantsCount
        });
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Unable to load company profile."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500 text-sm animate-pulse">Loading company profile...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-150 text-center shadow-sm max-w-xl mx-auto">
        <p className="text-[#3C0713] font-semibold text-lg mb-2">Error</p>
        <p className="text-sm text-gray-500 mb-6">{error || "Company profile not found."}</p>
        <button onClick={() => navigate("/dashboard")} className="px-6 py-2 bg-[#3C0713] text-white rounded-full text-sm cursor-pointer hover:bg-[#5c0b1e] transition-all">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return "TC";
    const words = name.trim().split(/\s+/).filter(Boolean);
    if (words.length === 0) return "TC";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + (words[1]?.[0] || "")).toUpperCase();
  };

  const initials = getInitials(company.company_name);

  // Path calculations for 12 months curve
  let pathD = "M 30,130 L 470,130";
  let fillD = "M 30,130 L 470,130 L 470,140 L 30,140 Z";
  let currentY = 130;
  let maxCount = 0;

  if (monthlyStats.length > 0) {
    maxCount = Math.max(...monthlyStats.map(m => m.count), 0);
    const points = monthlyStats.map((item, i) => {
      const x = 30 + i * 40;
      const y = maxCount > 0 ? 130 - (item.count / maxCount) * 110 : 130;
      return { x, y };
    });
    
    pathD = `M ${points.map(p => `${p.x},${p.y}`).join(" L ")}`;
    fillD = `${pathD} L 470,140 L 30,140 Z`;
    currentY = points[11].y;
  }

  const getIndustryLabel = (ind) => {
    const choices = {
      TECH: "Technology",
      FINANCE: "Finance & Banking",
      WATER: "Water Industry",
      CONSTRUCTION: "Construction & BTP",
      HEALTHCARE: "Healthcare",
      EDUCATION: "Education",
      RETAIL: "Retail & Commerce",
      ENERGY: "Energy & Oil",
      AGRICULTURE: "Agriculture",
      TRANSPORT: "Transport & Logistics",
      OTHER: "Other"
    };
    return choices[ind] || ind || "Other";
  };

  const getCompanySizeLabel = (size) => {
    const choices = {
      STARTUP: "Start-Up (1-10)",
      SMALL: "Small (11-50)",
      MEDIUM: "Medium (51-200)",
      LARGE: "Large (200+)"
    };
    return choices[size] || size || "Medium";
  };

  const getWilayaLabel = (w) => {
    if (!w) return "Alger";
    return WILAYA_DISPLAY[w] || (w.charAt(0).toUpperCase() + w.slice(1).replace("_", " "));
  };

  return (
    <div className="space-y-6 w-full pb-12 animate-fade-in">
      {/* Upper Title Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
        <div>
          <h1 className="font-serif text-4xl font-bold text-gray-900 tracking-tight">Company Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Manage and preview how your business appears to job seekers and partners.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/dashboard/company-profile/edit")}
            className="px-3.5 py-1.5 bg-[#3C0713] hover:bg-[#5c0b1e] text-white rounded-full text-[11px] font-bold tracking-wide transition-all duration-300 shadow-sm shadow-[#3C0713]/10 hover:shadow-md hover:shadow-[#3C0713]/20 cursor-pointer hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-1"
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
            </svg>
            Edit Profile
          </button>
        </div>
      </div>

      {/* Magnificent Hero Banner & Identity Header */}
      <div className="bg-white rounded-[2.5rem] border border-gray-150 overflow-hidden shadow-xl shadow-gray-100/50 transition-all duration-300 hover:shadow-2xl hover:shadow-gray-200/50">
        {/* Banner with modern abstract shapes & ambient gradients */}
        <div className="h-48 md:h-56 bg-gradient-to-tr from-[#3C0713] via-[#5c0b1e] to-[#25040c] relative flex items-start justify-end p-6 overflow-hidden">
          {/* Ambient light effects */}
          <div className="absolute top-[-50%] left-[-10%] w-96 h-96 bg-red-400/20 blur-3xl rounded-full mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[-50%] right-[-10%] w-80 h-80 bg-rose-300/10 blur-3xl rounded-full mix-blend-screen" />
          <div className="absolute inset-0 bg-black/10 backdrop-brightness-[0.95]" />
          
          {/* Elegant Status Badge */}
          {company.verified ? (
            <span className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs px-4 py-2 rounded-full font-semibold shadow-lg flex items-center gap-2">
              <span className="inline-flex w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-ping" />
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
              Verified Company
            </span>
          ) : (
            <span className="relative z-10 bg-black/35 backdrop-blur-md border border-white/15 text-white text-xs px-4 py-2 rounded-full font-medium shadow-md flex items-center gap-2">
              <span className="inline-flex w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              Verification Pending
            </span>
          )}
        </div>

        {/* Identity Details Overlap */}
        <div className="px-8 pb-8">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-6 -mt-20 md:-mt-24 relative z-10 mb-2">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-6 text-center md:text-left">
              {/* Premium rounded Logo container */}
              <div className="w-36 h-36 bg-white p-2 border-4 border-white rounded-[2.5rem] flex items-center justify-center font-bold text-4xl shadow-xl overflow-hidden hover:scale-105 transition-transform duration-500">
                {company.avatar ? (
                  <img src={getMediaUrl(company.avatar)} alt="Company Logo" className="w-full h-full object-cover rounded-[2rem]" />
                ) : (
                  <div className="w-full h-full rounded-[2rem] bg-gradient-to-br from-[#3C0713]/10 to-[#5c0b1e]/5 flex items-center justify-center">
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#3C0713] to-[#5c0b1e] font-black tracking-tight">{initials}</span>
                  </div>
                )}
              </div>
              <div className="mb-2">
                <h2 className="font-serif text-3xl md:text-4xl text-gray-900 font-extrabold tracking-tight mb-3 flex items-center justify-center md:justify-start gap-2.5">
                  {company.company_name}
                  {company.verified && (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#0095f6] inline-block align-middle select-none shrink-0" title="Verified Account">
                      <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 0 0-1.06-1.061l-3.8 3.8-1.48-1.48a.75.75 0 1 0-1.06 1.06l2.01 2.01a.75.75 0 0 0 1.06 0l4.33-4.33Z" clipRule="evenodd" />
                    </svg>
                  )}
                </h2>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="bg-[#3C0713]/5 text-[#3C0713] border border-[#3C0713]/10 px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide flex items-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    {getIndustryLabel(company.industry)}
                  </span>
                  <span className="bg-slate-50 text-gray-600 border border-slate-100 px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    {getCompanySizeLabel(company.company_size)} Employees
                  </span>
                  <span className="bg-slate-50 text-gray-600 border border-slate-100 px-3 py-1 rounded-full text-[11px] font-semibold flex items-center gap-1.5">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-60">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    {getWilayaLabel(company.wilaya)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: About & Highlights Panel */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Biography Panel */}
          <div className="bg-white rounded-[2rem] border border-gray-150 p-6 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
            {/* Top decorative accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3C0713] to-[#5c0b1e]" />
            
            {/* Elegant SVG Quote Mark in background */}
            <div className="absolute right-6 top-8 text-[#3C0713]/5 select-none pointer-events-none">
              <svg width="60" height="60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v8h-9.988zm-12 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v8h-9.983z" />
              </svg>
            </div>

            <h3 className="font-serif text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              About the Company
            </h3>
            
            <div className="border-l-4 border-[#3C0713]/40 pl-5 my-3">
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-serif italic">
                {company.bio || "No company description provided yet."}
              </p>
            </div>
          </div>

          {/* Real Enterprise Performance & Statistics Card */}
          <div className="bg-white rounded-[2rem] border border-gray-150 p-6 md:p-8 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
            {/* Ambient subtle light gradient at the top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3C0713] via-[#5c0b1e] to-emerald-500" />
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b border-gray-100">
              <div>
                <h3 className="font-serif text-xl font-bold text-gray-900 flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#3C0713]">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                  Enterprise Statistics
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Real-time performance metrics and pipeline indicators.</p>
              </div>
              <span className="bg-[#3C0713]/5 text-[#3C0713] border border-[#3C0713]/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                Live Connection
              </span>
            </div>

            {/* Grid display of metrics & the beautiful curve */}
            <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6 md:gap-8 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
              
              {/* Left Side: Real Metrics */}
              <div className="space-y-8 pr-2 flex flex-col justify-center">
                {/* Stat 1: Active Announcements */}
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-80">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                    Job Announcements
                  </div>
                  <div className="font-serif text-3xl font-black text-gray-900 tracking-tight flex items-baseline gap-1.5">
                    {stats.announcementsCount}
                    <span className="text-xs text-gray-400 font-sans font-medium">Published</span>
                  </div>
                </div>

                {/* Stat 2: Applicants count */}
                <div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-80">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Total Applicants
                  </div>
                  <div className="font-serif text-3xl font-black text-gray-900 tracking-tight flex items-baseline gap-1.5">
                    {stats.applicantsCount}
                    <span className={`text-xs font-sans font-medium flex items-center gap-0.5 ${
                      applicantIncrease >= 0 ? "text-emerald-500" : "text-amber-600"
                    }`}>
                      {applicantIncrease >= 0 ? "▲" : "▼"} {Math.abs(applicantIncrease)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Side: Magnificent SVG Application Curve */}
              <div className="pt-6 lg:pt-0 lg:pl-8 flex flex-col justify-between">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-500 font-bold tracking-wide uppercase">Application Curve (Past 12 Months)</span>
                  <span className="text-[11px] text-gray-400 font-medium">Updated just now</span>
                </div>
                
                {/* Responsive SVG Container */}
                <div className="w-full bg-slate-50/50 rounded-2xl p-3 border border-slate-100">
                  <svg className="w-full h-auto" viewBox="0 0 500 150" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3C0713" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#3C0713" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Horizontal Grid lines */}
                    <line x1="30" y1="20" x2="470" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="60" x2="470" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="100" x2="470" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                    <line x1="30" y1="140" x2="470" y2="140" stroke="#e2e8f0" strokeWidth="1.5" />

                    {/* Gradient Fill under the Curve */}
                    <path
                      d={fillD}
                      fill="url(#chart-gradient)"
                    />
                    
                    {/* Smooth glowing curve stroke */}
                    <path
                      d={pathD}
                      stroke="#3C0713"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />

                    {/* Active Glowing Dot at current peak */}
                    {monthlyStats.length > 0 && (
                      <>
                        <circle cx="470" cy={currentY} r="5" fill="#3C0713" stroke="white" strokeWidth="2" />
                        <circle cx="470" cy={currentY} r="10" fill="#3C0713" fillOpacity="0.15" />
                      </>
                    )}

                    {/* Chart axis labels */}
                    {monthlyStats.map((item, i) => {
                      const x = 30 + i * 40;
                      const isCurrent = i === 11;
                      return (
                        <text
                          key={i}
                          x={x}
                          y="152"
                          fill={isCurrent ? "#3C0713" : "#94a3b8"}
                          fontSize="9"
                          fontFamily="sans-serif"
                          textAnchor="middle"
                          fontWeight={isCurrent ? "bold" : "medium"}
                        >
                          {item.name}
                        </text>
                      );
                    })}
                  </svg>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Side: Interactive Business Registry Card & Public Page Callout */}
        <div className="lg:col-span-5 space-y-6">
          {/* Elegant Business Registry Panel */}
          <div className="bg-white rounded-[2rem] border border-gray-150 p-6 shadow-lg shadow-gray-100/50 hover:shadow-xl transition-shadow duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#3C0713]/20" />
            <h4 className="font-serif text-base font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#3C0713]">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
              </svg>
              Business Registry
            </h4>

            <div className="space-y-3.5">
              {[
                { 
                  l: "Industry Sector", 
                  v: getIndustryLabel(company.industry),
                  icon: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
                      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                    </svg>
                  )
                },
                { 
                  l: "Staff Size", 
                  v: getCompanySizeLabel(company.company_size),
                  icon: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  )
                },
                { 
                  l: "HQ Location", 
                  v: `${getWilayaLabel(company.wilaya)}, Algeria`,
                  icon: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  )
                },
                company.phone && { 
                  l: "Phone Number", 
                  v: company.phone,
                  icon: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.5 19.5 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  )
                },
                company.website && { 
                  l: "Website", 
                  v: company.website, 
                  href: company.website.startsWith("http") ? company.website : `https://${company.website}`,
                  icon: (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                  )
                },
              ].filter(Boolean).map((r) => (
                <div key={r.l} className="flex flex-col gap-1 py-2.5 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {r.icon}
                    {r.l}
                  </div>
                  {r.href ? (
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#3C0713] font-bold text-xs hover:underline hover:text-[#5c0b1e] transition-colors duration-200 truncate flex items-center gap-1"
                    >
                      {r.v}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-80">
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>
                  ) : (
                    <span className="font-semibold text-gray-800 text-xs truncate">{r.v}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Premium Callout: Public Exposure Card */}
          <div className="bg-gradient-to-br from-[#3C0713] to-[#25040c] text-white p-5 rounded-[2rem] shadow-xl relative overflow-hidden group">
            {/* Ambient visual decorations */}
            <div className="absolute top-[-30%] right-[-30%] w-48 h-48 bg-white/5 blur-2xl rounded-full" />
            <div className="absolute bottom-[-10%] left-[-20%] w-36 h-36 bg-red-500/10 blur-xl rounded-full" />

            <div className="relative z-10 space-y-3.5">
              <span className="bg-white/10 border border-white/10 px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-widest uppercase inline-block">
                Public Reach
              </span>
              <h5 className="font-serif text-lg font-bold leading-snug">
                Your profile is active on the Algerian job market.
              </h5>
              <p className="text-white/70 text-[11px] leading-relaxed">
                Job seekers can find your organization, read your credentials, and submit applications directly to your listings.
              </p>
              <button
                onClick={() => navigate(`/companies/${company.id}`)}
                className="w-full py-2 bg-white text-[#3C0713] font-bold text-xs rounded-full hover:bg-gray-100 hover:scale-[1.02] transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Launch Public Preview
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export function ApplicantsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncementId, setSelectedAnnouncementId] = useState("");
  const [applications, setApplications] = useState([]);
  const [filteredApps, setFilteredApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const tabs = ["All", "Pending", "Reviewed", "Accepted", "Rejected"];

  useEffect(() => {
    let cancelled = false;
    const fetchAnnouncements = async () => {
      try {
        const data = await listAnnouncements({ status: "ALL" });
        if (cancelled) return;
        setAnnouncements(data);
        if (data.length > 0) {
          setSelectedAnnouncementId(data[0].id);
        } else {
          setLoading(false);
        }
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Failed to load announcements."));
        setLoading(false);
      }
    };
    fetchAnnouncements();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedAnnouncementId) return;
    let cancelled = false;
    const fetchApplications = async () => {
      setLoading(true);
      setError("");
      try {
        const apps = await listApplications({ announcement: selectedAnnouncementId });
        if (cancelled) return;
        setApplications(apps);
        // Automatically select the first candidate in the fetched list
        setSelectedApp(apps.length > 0 ? apps[0] : null);
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Failed to load applications."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchApplications();
    return () => {
      cancelled = true;
    };
  }, [selectedAnnouncementId]);

  useEffect(() => {
    let filtered = applications;

    // Filter by status
    if (statusFilter !== "All") {
      filtered = filtered.filter(app => app.status === statusFilter.toUpperCase());
    }

    // Filter by search term
    if (searchTerm.trim() !== "") {
      const query = searchTerm.toLowerCase();
      filtered = filtered.filter(app => 
        (app.applicant_name && app.applicant_name.toLowerCase().includes(query)) ||
        (app.applicant_title && app.applicant_title.toLowerCase().includes(query)) ||
        (app.applicant_skills && app.applicant_skills.some(s => s.toLowerCase().includes(query)))
      );
    }

    setFilteredApps(filtered);
  }, [applications, statusFilter, searchTerm]);

  const handleStatusUpdate = async (appId, actionFn) => {
    setActionLoading(true);
    setError("");
    try {
      const updated = await actionFn(appId);
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: updated.status } : a));
      setSelectedApp(prev => prev && prev.id === appId ? { ...prev, status: updated.status } : prev);
    } catch (err) {
      setError(parseApiError(err, "Status transition failed. Be sure you are moving to an allowed next state."));
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200/50";
      case "REVIEWED":
        return "bg-blue-50 text-blue-700 border-blue-200/50";
      case "ACCEPTED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/50";
      case "REJECTED":
        return "bg-rose-50 text-rose-700 border-rose-200/50";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200/50";
    }
  };

  const getCount = (status) => {
    if (status === "All") return applications.length;
    return applications.filter(a => a.status === status.toUpperCase()).length;
  };

  const renderEmptyState = () => {
    const hasApps = applications.length > 0;
    return (
      <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-slate-50/20">
        <div className="w-16 h-16 rounded-full bg-[#3C0713]/5 border border-dashed border-[#3C0713]/20 flex items-center justify-center mb-5 shadow-sm relative overflow-hidden animate-pulse">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3C0713" strokeWidth="1.5" className="opacity-80">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h3 className="font-serif text-lg font-bold text-gray-800 mb-1.5">Candidate Dossier Portal</h3>
        <p className="text-xs text-gray-400 max-w-sm leading-relaxed mb-6 font-medium">
          {hasApps 
            ? "Select a candidate profile from the list to review their details, professional bio, and status credentials."
            : "No candidates have applied to this job listing yet. Share the listing link to attract talent!"}
        </p>
        
        {hasApps && (
          <div className="grid grid-cols-3 gap-4 w-full max-w-md mt-2">
            <div className="bg-white p-3 rounded-2xl border border-gray-150/40 shadow-sm text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Pending</span>
              <span className="font-serif text-base font-bold text-amber-600">{applications.filter(a => a.status === "PENDING").length}</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-gray-150/40 shadow-sm text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Reviewed</span>
              <span className="font-serif text-base font-bold text-blue-600">{applications.filter(a => a.status === "REVIEWED").length}</span>
            </div>
            <div className="bg-white p-3 rounded-2xl border border-gray-150/40 shadow-sm text-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Accepted</span>
              <span className="font-serif text-base font-bold text-emerald-600">{applications.filter(a => a.status === "ACCEPTED").length}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDetailView = () => {
    const initials = selectedApp.applicant_name ? selectedApp.applicant_name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() : "?";
    const isPending = selectedApp.status === "PENDING";
    const isReviewed = selectedApp.status === "REVIEWED";
    const isAccepted = selectedApp.status === "ACCEPTED";
    const isRejected = selectedApp.status === "REJECTED";

    return (
      <div className="flex flex-col h-full bg-white overflow-hidden p-6 md:p-8 space-y-6">
        
        {/* Profile Card Header */}
        <div className="flex items-center justify-between gap-4 pb-5 border-b border-gray-100 flex-shrink-0">
          <div className="flex gap-4 items-center min-w-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#3C0713] to-[#881337] text-white font-serif font-black text-sm flex items-center justify-center shadow-sm flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900 leading-tight truncate">{selectedApp.applicant_name}</h2>
              <p className="text-xs text-gray-500 truncate mt-0.5">{selectedApp.applicant_title || "Professional Candidate"}</p>
              <p className="text-[10px] text-gray-400 mt-1 font-medium font-sans">
                📍 {selectedApp.applicant_wilaya_display || WILAYA_DISPLAY[selectedApp.applicant_wilaya] || selectedApp.applicant_wilaya} · 💼 {selectedApp.applicant_years_exp} Yrs Experience
              </p>
            </div>
          </div>
          <span className={`text-[8px] px-2.5 py-0.5 rounded-full font-bold border uppercase tracking-wider font-sans self-start ${getStatusBadge(selectedApp.status)}`}>
            {selectedApp.status}
          </span>
        </div>

        {/* Status Actions */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-gray-150/40 flex flex-col sm:flex-row justify-between items-center gap-3 flex-shrink-0">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Recruitment Status</span>
          <div className="flex gap-2">
            {isPending && (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusUpdate(selectedApp.id, reviewApplication)}
                className="px-4 py-2 bg-[#3C0713] hover:bg-[#52091a] text-white rounded-xl text-[10px] font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-95"
              >
                Mark Reviewed
              </button>
            )}
            
            {isReviewed && (
              <>
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusUpdate(selectedApp.id, acceptApplication)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  Accept Candidate
                </button>
                <button
                  disabled={actionLoading}
                  onClick={() => handleStatusUpdate(selectedApp.id, rejectApplication)}
                  className="px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-[10px] font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-95"
                >
                  Reject Candidate
                </button>
              </>
            )}
            
            {isAccepted && (
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                ✓ Ready for Interview
              </span>
            )}
            
            {isRejected && (
              <span className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                ✕ Application Closed
              </span>
            )}
          </div>
        </div>

        {/* Cover Letter */}
        <div className="flex-grow overflow-y-auto space-y-2 pr-1">
          <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Candidate Cover Letter</h4>
          <p className="text-xs text-gray-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-gray-150/30">
            {selectedApp.cover_letter || "No cover letter was submitted for this role."}
          </p>
        </div>

        {/* Resume CV Section */}
        <div className="pt-4 border-t border-gray-100 flex-shrink-0">
          {selectedApp.resume_file ? (
            <div className="flex items-center justify-between bg-slate-50/50 p-3.5 rounded-2xl border border-gray-150/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#3C0713]/5 text-[#3C0713] flex items-center justify-center shadow-inner">
                  📄
                </div>
                <div>
                  <p className="text-[11px] font-bold text-gray-700">Resume Dossier</p>
                  <p className="text-[9px] text-gray-400 font-medium">Uploaded PDF Document</p>
                </div>
              </div>
              
              <a
                href={selectedApp.resume_file}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#3C0713] hover:bg-[#52091a] text-white rounded-xl text-[10px] font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1 active:scale-95"
              >
                View CV File
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </a>
            </div>
          ) : (
            <div className="p-3.5 bg-slate-50 border border-gray-150/40 rounded-2xl text-[10px] text-gray-400 italic text-center font-medium">
              No custom CV file was uploaded by this candidate.
            </div>
          )}
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 h-[calc(100vh-140px)] min-h-[700px] flex flex-col">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-shrink-0">
        <div>
          <h1 className="font-serif text-3xl font-normal mb-1">Applications Dossier</h1>
          <p className="text-sm text-gray-400">Review candidates, examine cover letters, and manage your Algerian talent recruitment pipeline.</p>
        </div>
      </div>

      {announcements.length === 0 ? (
        loading ? (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-150/50 shadow-sm animate-pulse flex-grow flex items-center justify-center">
            Loading your listings...
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-150/50 shadow-sm flex-grow flex items-center justify-center">
            You haven't posted any announcements yet. Please check back later.
          </div>
        )
      ) : (
        <div className="flex flex-col gap-6 flex-grow overflow-hidden">
          
          {/* Active Job Selector Card */}
          <div className="bg-white rounded-3xl p-5 border border-gray-150/50 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#3C0713]/10 text-[#3C0713] flex items-center justify-center shadow-sm">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                  <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
              </div>
              <div>
                <label className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block mb-0.5">Selected Position</label>
                <h3 className="font-serif text-base font-bold text-gray-900">Active Job Pipeline</h3>
              </div>
            </div>
            
            <div className="relative w-full md:w-80">
              <select
                value={selectedAnnouncementId}
                onChange={(e) => {
                  setSelectedAnnouncementId(e.target.value);
                  setStatusFilter("All");
                  setSearchTerm("");
                }}
                className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-slate-50/50 hover:bg-slate-50 text-sm font-semibold text-gray-800 outline-none border border-gray-150 focus:border-[#3C0713] transition-all cursor-pointer appearance-none shadow-inner"
              >
                {announcements.map((a) => (
                  <option key={a.id} value={a.id}>
                    {ROLE_DISPLAY[a.role] || a.role} · {a.wilaya_display || WILAYA_DISPLAY[a.wilaya] || a.wilaya}
                  </option>
                ))}
              </select>
              <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="bg-red-50 border border-red-150 text-red-700 text-xs px-4 py-2.5 rounded-2xl flex justify-between items-center animate-fade-in shadow-sm flex-shrink-0">
              <span>{error}</span>
              <button onClick={() => setError("")} className="font-bold cursor-pointer hover:text-red-900 transition-colors text-lg">×</button>
            </div>
          )}

          {/* Core Dashboard: Split-Screen Layout */}
          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center text-gray-400 border border-gray-150/50 shadow-sm animate-pulse flex-grow flex items-center justify-center">
              Loading pipeline data...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-grow overflow-hidden items-stretch">
              
              {/* Left Column: Candidate Roster */}
              <div className="lg:col-span-5 flex flex-col bg-white rounded-3xl border border-gray-150/50 shadow-sm overflow-hidden min-h-[480px]">
                
                {/* Search & Tabs Header Bar */}
                <div className="p-4 bg-slate-50/40 border-b border-gray-100 space-y-3.5 flex-shrink-0">
                  
                  {/* Search Box */}
                  <div className="relative w-full">
                    <input
                      type="text"
                      placeholder="Search by candidate name or skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50/80 hover:bg-slate-50 text-gray-800 outline-none border border-gray-150 focus:border-[#3C0713] focus:bg-white transition-all shadow-inner"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                    </div>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xs"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Horizontal Scrollable Tabs */}
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {tabs.map(tab => {
                      const isActive = statusFilter === tab;
                      const count = getCount(tab);
                      return (
                        <button
                          key={tab}
                          onClick={() => setStatusFilter(tab)}
                          className={`text-[9px] font-bold px-2.5 py-1.5 rounded-full transition-all duration-200 cursor-pointer flex-shrink-0 flex items-center gap-1 ${
                            isActive
                              ? "bg-[#3C0713] text-white shadow-sm"
                              : "bg-white text-gray-500 hover:bg-slate-100 hover:text-gray-800 border border-gray-150/40"
                          }`}
                        >
                          <span>{tab}</span>
                          <span className={`px-1 rounded-full text-[8px] font-sans font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-gray-150/80 text-gray-600"
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                </div>

                {/* Candidate Scrolling Roster */}
                <div className="flex-grow overflow-y-auto p-4 space-y-3">
                  {filteredApps.length === 0 ? (
                    <div className="h-full flex flex-col justify-center items-center py-12 text-center text-gray-400 italic text-[11px] font-medium">
                      <span>✕</span> No applications match the selection.
                    </div>
                  ) : (
                    filteredApps.map(app => {
                      const isSelected = selectedApp?.id === app.id;
                      return (
                        <div
                          key={app.id}
                          onClick={() => setSelectedApp(app)}
                          className={`py-3 px-3 transition-all duration-200 cursor-pointer flex justify-between items-center border-b border-gray-100/50 last:border-0 rounded-xl ${
                            isSelected
                              ? "bg-[#3C0713]/5 text-[#3C0713]"
                              : "hover:bg-slate-50/50 text-gray-800"
                          }`}
                        >
                          <div className="min-w-0 flex-grow pr-3">
                            <h4 className={`text-[11px] font-bold truncate transition-colors ${isSelected ? "text-[#3C0713]" : "text-gray-900"}`}>
                              {app.applicant_name}
                            </h4>
                            <p className="text-[9px] text-gray-400 font-medium truncate mt-0.5">
                              {app.applicant_title || "Candidate"} · {app.applicant_years_exp} Yrs Exp
                            </p>
                          </div>
                          
                          {/* Minimal status dot indicator */}
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              app.status === "PENDING" ? "bg-amber-400" :
                              app.status === "REVIEWED" ? "bg-blue-400" :
                              app.status === "ACCEPTED" ? "bg-emerald-400" : "bg-rose-400"
                            }`} title={app.status} />
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider font-sans">{app.status}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

              </div>

              {/* Right Column: Detail Dossier */}
              <div className="lg:col-span-7 bg-white rounded-3xl border border-gray-150/50 shadow-sm overflow-hidden flex flex-col min-h-[480px]">
                {selectedApp ? renderDetailView() : renderEmptyState()}
              </div>

            </div>
          )}

        </div>
      )}
    </div>
  );
}
