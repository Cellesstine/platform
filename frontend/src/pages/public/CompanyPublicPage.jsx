import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProfileDetails } from "../../services/profilesApi";
import { listAnnouncements } from "../../services/jobsApi";
import { parseApiError } from "../../services/auth";
import { getMediaUrl } from "../../utils/media";

export default function CompanyPublicPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [company, setCompany] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState({ announcementsCount: 0, applicantsCount: 0 });

  const tabs = ["overview", "jobs", "reviews", "culture"];

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch company profile details
        const companyData = await getProfileDetails(id);
        if (cancelled) return;
        setCompany(companyData);

        // Fetch announcements
        let announcementsData = [];
        try {
          announcementsData = await listAnnouncements({ enterprise: id, status: "ACTIVE" });
        } catch (err) {
          console.error("Failed to load announcements:", err);
        }

        if (cancelled) return;
        setAnnouncements(announcementsData);

        // Sum the applicant_count from announcementsData
        const announcementsCount = announcementsData.length;
        const applicantsCount = announcementsData.reduce((acc, ann) => acc + (ann.applicant_count || 0), 0);

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

    if (id) {
      fetchData();
    }

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream font-sans flex items-center justify-center">
        <p className="text-gray-500 text-sm animate-pulse">Loading company profile...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen bg-cream font-sans p-10">
        <div className="max-w-xl mx-auto bg-white rounded-3xl border border-gray-250 p-8 text-center shadow-sm">
          <p className="text-[#3C0713] font-semibold text-lg mb-2">Error</p>
          <p className="text-sm text-gray-500 mb-6">{error || "Company profile not found."}</p>
          <button onClick={() => navigate(-1)} className="px-6 py-2 bg-navy text-white rounded-full text-sm cursor-pointer hover:bg-navy-deep transition-all">
            Go Back
          </button>
        </div>
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
    return w.charAt(0).toUpperCase() + w.slice(1).replace("_", " ");
  };

  return (
    <div className="min-h-screen bg-cream font-sans animate-fade-in">
      <div className="px-10 py-4 flex justify-between items-center">
        <button onClick={() => navigate(-1)} className="text-sm text-navy hover:underline cursor-pointer">← Back</button>
        <button onClick={() => navigate("/dashboard")} className="px-4 py-1.5 rounded-full bg-[#3C0713] text-white text-xs font-bold hover:bg-[#5c0b1e] transition-all cursor-pointer shadow-sm">Dashboard</button>
      </div>

      {/* Card */}
      <div className="mx-10 bg-white rounded-3xl border border-gray-200 overflow-hidden mb-6 shadow-sm">
        {/* Banner with cherry gradient & effects */}
        <div className="h-44 md:h-52 bg-gradient-to-tr from-[#3C0713] via-[#5c0b1e] to-[#25040c] relative flex items-start justify-end p-4 overflow-hidden">
          <div className="absolute top-[-50%] left-[-10%] w-80 h-80 bg-red-400/20 blur-3xl rounded-full mix-blend-screen animate-pulse" />
          <div className="absolute bottom-[-50%] right-[-10%] w-60 h-60 bg-rose-300/10 blur-3xl rounded-full mix-blend-screen" />
          <div className="absolute inset-0 bg-black/10 backdrop-brightness-[0.95]" />
          {company.verified ? (
            <span className="relative z-10 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs px-3.5 py-1.5 rounded-full font-semibold shadow-md flex items-center gap-1.5">
              <span className="inline-flex w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-sm" />
              Verified Company
            </span>
          ) : (
            <span className="relative z-10 bg-black/35 backdrop-blur-md border border-white/15 text-white text-xs px-3.5 py-1.5 rounded-full font-medium shadow-sm flex items-center gap-1.5">
              <span className="inline-flex w-1.5 h-1.5 rounded-full bg-amber-400" />
              Verification Pending
            </span>
          )}
        </div>
        <div className="px-7">
          <div className="-mt-12 mb-3 relative z-10">
            <div className="w-24 h-24 bg-white p-1.5 border-4 border-white rounded-[2.5rem] flex items-center justify-center font-bold text-2xl shadow-md overflow-hidden">
              {company.avatar ? (
                <img src={getMediaUrl(company.avatar)} alt="Logo" className="w-full h-full object-cover rounded-[1.8rem]" />
              ) : (
                <div className="w-full h-full rounded-[1.8rem] bg-gradient-to-br from-[#3C0713]/10 to-[#5c0b1e]/5 flex items-center justify-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#3C0713] to-[#5c0b1e] font-black tracking-tight">{initials}</span>
                </div>
              )}
            </div>
          </div>
          <h1 className="font-serif text-3xl mb-1 text-navy-deep font-extrabold tracking-tight flex items-center gap-2">
            {company.company_name}
            {company.verified && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-[#0095f6] inline-block align-middle select-none shrink-0" title="Verified Account">
                <path fillRule="evenodd" d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 0 0-1.06-1.061l-3.8 3.8-1.48-1.48a.75.75 0 1 0-1.06 1.06l2.01 2.01a.75.75 0 0 0 1.06 0l4.33-4.33Z" clipRule="evenodd" />
              </svg>
            )}
          </h1>
          <p className="text-sm text-gray-500 mb-4 max-w-2xl">{company.bio || "No company description provided yet."}</p>
          <div className="flex gap-5 text-sm text-gray-400 mb-5 flex-wrap">
            <span className="flex items-center gap-1.5 font-medium font-sans">📍 {getWilayaLabel(company.wilaya)}, {company.address}</span>
            <span className="flex items-center gap-1.5 font-medium font-sans">🏢 {getIndustryLabel(company.industry)}</span>
            <span className="flex items-center gap-1.5 font-medium font-sans">👥 {getCompanySizeLabel(company.company_size)} Employees</span>
          </div>
          <div className="flex gap-2 pb-5 border-b border-gray-150/50">
            {company.website && (
              <a
                href={company.website.startsWith("http") ? company.website : `https://${company.website}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 border border-gray-205 hover:border-[#3C0713] hover:text-[#3C0713] rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm bg-white"
              >
                Visit Website ↗
              </a>
            )}
            <button className="px-4 py-2 border border-gray-205 rounded-full text-xs font-semibold transition-all hover:bg-slate-50 cursor-pointer shadow-sm bg-white">Share</button>
          </div>
          <div className="flex">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${tab === t ? "border-[#3C0713] text-[#3C0713]" : "border-transparent text-gray-400 hover:text-navy"}`}>
                {t === "jobs" ? `Jobs (${announcements.length})` : t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-10 flex flex-col lg:flex-row gap-6 pb-16">
        <div className="flex-1 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm">
          {tab === "overview" && (
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-xl font-bold text-gray-900 mb-4">About {company.company_name}</h2>
                <div className="border-l-4 border-[#3C0713]/40 pl-5 my-3">
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-serif italic">
                    {company.bio || "No company description provided yet."}
                  </p>
                </div>
              </div>

              {/* Real Enterprise Performance & Statistics Card */}
              <div className="bg-white rounded-[2rem] border border-gray-150 p-6 md:p-8 shadow-md relative overflow-hidden">
                {/* Ambient subtle light gradient at the top */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#3C0713] via-[#5c0b1e] to-emerald-500" />
                
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gray-900 flex items-center gap-2">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#3C0713]">
                        <line x1="18" y1="20" x2="18" y2="10" />
                        <line x1="12" y1="20" x2="12" y2="4" />
                        <line x1="6" y1="20" x2="6" y2="14" />
                      </svg>
                      Enterprise Statistics
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">Real-time performance metrics and pipeline indicators.</p>
                  </div>
                  <span className="bg-[#3C0713]/5 text-[#3C0713] border border-[#3C0713]/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Connection
                  </span>
                </div>

                {/* Simplified Metrics Display */}
                <div className="flex flex-col sm:flex-row gap-8 sm:gap-16">
                  
                  {/* Stat 1: Active Announcements */}
                  <div>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-80">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                      </svg>
                      Job Announcements
                    </div>
                    <div className="font-serif text-2xl font-black text-gray-900 tracking-tight flex items-baseline gap-1.5">
                      {stats.announcementsCount}
                      <span className="text-[10px] text-gray-400 font-sans font-medium">Active</span>
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
                    <div className="font-serif text-2xl font-black text-gray-900 tracking-tight flex items-baseline gap-1.5">
                      {stats.applicantsCount}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}

          {tab === "jobs" && (
            <div className="space-y-6">
              <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
                <h2 className="font-serif text-xl font-bold text-gray-900">Active Openings ({announcements.length})</h2>
                <span className="text-xs text-gray-400">All positions are subject to real-time verification</span>
              </div>
              
              {announcements.length === 0 ? (
                <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mx-auto mb-3">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                  </svg>
                  <p className="text-gray-500 text-sm font-medium">No active job openings available</p>
                  <p className="text-xs text-gray-400 mt-1">This company hasn't posted any active announcements yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {announcements.map((ann) => (
                    <div key={ann.id} className="p-5 border border-gray-150/80 rounded-2xl bg-white hover:border-[#3C0713]/40 hover:shadow-lg hover:shadow-slate-100/50 transition-all duration-300 flex flex-col justify-between group">
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <span className="bg-[#3C0713]/5 text-[#3C0713] text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#3C0713]/10">
                            {ann.job_type_display || ann.job_type || "Full Time"}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                            📅 Deadline: {ann.deadline || "Open"}
                          </span>
                        </div>
                        <h3 className="font-serif font-bold text-gray-900 text-base mb-1 group-hover:text-[#3C0713] transition-colors">
                          {ann.role_display || ann.role}
                        </h3>
                        <div className="flex flex-wrap gap-x-2.5 gap-y-1 text-xs text-gray-500 mb-3.5">
                          <span className="flex items-center gap-1 font-sans">📍 {ann.wilaya_display || ann.wilaya || "Alger"}</span>
                          <span className="text-gray-300">•</span>
                          <span className="flex items-center gap-1 font-sans">🏢 {ann.industry_display || ann.industry}</span>
                        </div>
                        {ann.description && (
                          <p className="text-xs text-gray-500 line-clamp-3 mb-4 leading-relaxed bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 font-sans">
                            {ann.description}
                          </p>
                        )}
                      </div>
                      <div className="pt-3.5 border-t border-gray-50 flex items-center justify-between">
                        <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          {ann.applicant_count || 0} Applicants
                        </span>
                        <button
                          onClick={() => navigate(`/professional/dashboard/announcements/${ann.id}`)}
                          className="px-4 py-1.5 bg-[#3C0713] hover:bg-[#5c0b1e] text-white rounded-full text-xs font-bold tracking-wide transition-all shadow-sm shadow-[#3C0713]/10 hover:shadow-md hover:shadow-[#3C0713]/20 cursor-pointer"
                        >
                          View Details & Apply →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "reviews" && (
            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mx-auto mb-3">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <p className="text-gray-500 text-sm font-medium">Reviews are currently disabled</p>
              <p className="text-xs text-gray-400 mt-1">Review capabilities for this enterprise profile will be activated soon.</p>
            </div>
          )}

          {tab === "culture" && (
            <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 mx-auto mb-3">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
              <p className="text-gray-500 text-sm font-medium">No culture description published yet</p>
              <p className="text-xs text-gray-400 mt-1">Check back later to learn about this company's workspace and values.</p>
            </div>
          )}
        </div>
        
        {/* Sidebar Details Card */}
        <div className="w-full lg:w-72 bg-white rounded-3xl border border-gray-200 p-6 shadow-sm h-fit">
          <h2 className="font-serif text-sm font-bold text-gray-900 uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#3C0713]">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
            Company Details
          </h2>
          <div className="mt-3.5 space-y-1">
            {[
              { l: "Sector", v: getIndustryLabel(company.industry) },
              { l: "Size", v: getCompanySizeLabel(company.company_size) },
              { l: "HQ", v: `${getWilayaLabel(company.wilaya)}, Algeria` },
              company.phone && { l: "Phone", v: company.phone },
              company.website && { l: "Website", v: company.website, href: company.website.startsWith("http") ? company.website : `https://${company.website}` },
            ].filter(Boolean).map((r) => (
              <div key={r.l} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-0 text-xs">
                <span className="text-gray-400 font-semibold">{r.l}</span>
                {r.href ? (
                  <a href={r.href} target="_blank" rel="noreferrer" className="text-[#3C0713] font-bold hover:underline truncate max-w-[150px]">{r.v}</a>
                ) : (
                  <span className="font-bold text-gray-800 truncate max-w-[150px]">{r.v}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}