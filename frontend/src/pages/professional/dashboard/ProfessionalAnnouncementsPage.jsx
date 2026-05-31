import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { INDUSTRY_OPTIONS, JOB_TYPE_OPTIONS } from "../../../constants/apiChoices";
import { parseApiError } from "../../../services/auth";

export default function ProfessionalAnnouncementsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [type, setType] = useState("ALL");
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
  }, [search, category]);

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
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white border border-gray-100 text-sm outline-none shadow-sm min-w-[160px]"
        >
          <option value="ALL">All categories</option>
          {INDUSTRY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white border border-gray-100 text-sm outline-none shadow-sm min-w-[140px]"
        >
          <option value="ALL">All types</option>
          {JOB_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
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
            className="bg-white rounded-3xl p-6 border border-gray-150/70 hover:border-[#3C0713]/40 hover:shadow-xl hover:shadow-red-900/5 transition-all duration-300 flex flex-col justify-between group"
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
                      style={{ background: "linear-gradient(135deg, #3C0713 0%, #5c0b1e 100%)" }}
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
                
                <span className="bg-[#3C0713]/5 text-[#3C0713] text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider border border-[#3C0713]/10">
                  {job.job_type_display || job.job_type || "Full Time"}
                </span>
              </div>

              {/* Role Title */}
              <h2 className="font-serif font-bold text-lg text-gray-900 mb-2 group-hover:text-[#3C0713] transition-colors">
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
                  <span>⚡ Experience Required:</span>
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
                      className="bg-red-50 text-[#3C0713] text-[10px] font-semibold px-2.5 py-0.5 rounded-full border border-red-100"
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
                <span className="text-[10px] text-emerald-600 font-bold mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {job.applicant_count || 0} applied
                </span>
              </div>
              
              <button
                type="button"
                onClick={() => navigate(`/professional/dashboard/announcements/${job.id}`)}
                className="px-5 py-2 bg-[#3C0713] hover:bg-[#5c0b1e] text-white rounded-full text-xs font-bold tracking-wide transition-all shadow-sm shadow-[#3C0713]/10 hover:shadow-md hover:shadow-[#3C0713]/20 cursor-pointer"
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
