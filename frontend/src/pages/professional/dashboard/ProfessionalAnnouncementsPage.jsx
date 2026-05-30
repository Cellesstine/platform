import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "../../../components/ui";
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
          <article key={job.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "#1b2d52" }}
              >
                {(job.enterprise_name || "CO").slice(0, 2).toUpperCase()}
              </div>
              <span className="text-sm text-gray-500">{job.enterprise_name}</span>
            </div>

            <h2 className="font-semibold text-lg text-gray-900 mb-2">{job.role_display || job.role}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {job.wilaya_display || job.wilaya} · {job.job_type_display || job.job_type} · {job.industry_display || job.industry}
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              <Tag variant="new">{job.status}</Tag>
              <Tag variant="remote">{job.job_type_display || job.job_type}</Tag>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">
                {job.created_at ? new Date(job.created_at).toLocaleDateString() : "Recently"}
              </span>
              <button
                type="button"
                onClick={() => navigate(`/professional/dashboard/announcements/${job.id}`)}
                className="px-5 py-2 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </article>
        ))}
      </div>
      )}
    </div>
  );
}
