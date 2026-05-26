import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { professionalJobs } from "../../../data/professionalJobs";
import { Tag } from "../../../components/ui";

export default function ProfessionalAnnouncementsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [type, setType] = useState("All types");

  const filtered = professionalJobs.filter((j) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.location.toLowerCase().includes(q);
    const matchType = type === "All types" || j.type === type;
    return matchSearch && matchType;
  });

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
          <option>All categories</option>
          <option>Technology</option>
          <option>Design</option>
          <option>Engineering</option>
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-4 py-3 rounded-xl bg-white border border-gray-100 text-sm outline-none shadow-sm min-w-[140px]"
        >
          <option>All types</option>
          <option>Full-time</option>
          <option>Contract</option>
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((job) => (
          <article key={job.id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ background: job.color }}
              >
                {job.initials}
              </div>
              <span className="text-sm text-gray-500">{job.company}</span>
            </div>

            <h2 className="font-semibold text-lg text-gray-900 mb-2">{job.title}</h2>
            <p className="text-sm text-gray-500 mb-4">
              {job.location} · {job.type} · {job.salary}
            </p>

            <div className="flex flex-wrap gap-2 mb-5">
              {job.tags.map((t) => (
                <Tag key={t} variant={t === "Remote" ? "remote" : t === "New" ? "new" : "presential"}>
                  {t}
                </Tag>
              ))}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-400">{job.posted}</span>
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
    </div>
  );
}
