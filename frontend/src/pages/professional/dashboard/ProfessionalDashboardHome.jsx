import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Tag } from "../../../components/ui";
import api from "../../../services/api";
import { parseApiError, getUserEmail } from "../../../services/auth";
import { listApplications } from "../../../services/applicationsApi";

export default function ProfessionalDashboardHome() {
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);
  const [applicationCount, setApplicationCount] = useState(0);
  const [offersCount, setOffersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fullName, setFullName] = useState("");
  const fallbackName = getUserEmail()?.split("@")[0] || "there";
  const finalName = fullName || fallbackName;

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      try {
        const [dashboardRes, profileRes] = await Promise.all([
          api.get("/dashboard/"),
          api.get("/profile/me/").catch(() => null),
        ]);
        if (cancelled) return;

        setRecent((dashboardRes.data?.recent_announcements || []).slice(0, 3));

        if (profileRes?.data) {
          const firstName = profileRes.data.first_name || "";
          const lastName = profileRes.data.last_name || "";
          const name = `${firstName} ${lastName}`.trim();
          if (name) {
            setFullName(name);
          }
          
          if (profileRes.data.id) {
            const profileId = profileRes.data.id;
            const apps = await listApplications({ applicant: profileId });
            if (cancelled) return;
            setApplicationCount(apps.length);
            setOffersCount(apps.filter((app) => app.status === "ACCEPTED").length);
          }
        }
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Unable to load dashboard details."));
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
    <div>
      {/* Premium Navy Welcome Card */}
      <div className="bg-[#0B1E36] rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <i className="text-2xl font-serif text-white tracking-wide block mb-3">Professional</i>
            <h1 className="font-serif text-3xl md:text-4xl font-normal leading-tight mb-2">
              <span className="italic text-slate-100">Welcome back, {finalName}</span>
            </h1>
          </div>

          <button
            type="button"
            onClick={() => navigate("/professional/dashboard/profile")}
            className="flex-shrink-0 bg-white text-[#0B1E36] hover:bg-slate-100 active:scale-95 transition-all px-6 py-3 rounded-full text-sm font-semibold shadow-md cursor-pointer"
          >
            View My Profile
          </button>
        </div>
      </div>

      {/* Dynamic Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: "Applications sent", value: String(applicationCount), color: "text-[#0B1E36]", desc: "Active submissions" },
          { label: "Offers received", value: String(offersCount), color: "text-[#0B1E36]", desc: "Accepted status" },
          { label: "Active Search", value: "On", color: "text-[#0B1E36]", desc: "Visible to employers" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-3xl p-6 border border-gray-150/50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">{s.label}</p>
            <p className={`font-serif text-4xl font-normal ${s.color} mb-1`}>{s.value}</p>
            <p className="text-[10px] text-gray-400 font-medium">{s.desc}</p>
          </div>
        ))}
      </div>

      {/* Recent Announcements */}
      <div className="bg-white rounded-3xl p-6 border border-gray-150/50 shadow-sm flex flex-col">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold text-gray-900">Recent announcements</h2>
          <button
            type="button"
            onClick={() => navigate("/professional/dashboard/announcements")}
            className="px-4 py-2 border border-gray-200 rounded-full text-xs hover:bg-gray-50 transition-colors cursor-pointer"
          >
            View all
          </button>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {loading ? (
            <p className="text-sm text-gray-400">Loading announcements...</p>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : recent.length === 0 ? (
            <p className="text-sm text-gray-400">No active announcements available yet.</p>
          ) : (
            recent.map((job) => (
              <button
                key={job.id}
                type="button"
                onClick={() => navigate(`/professional/dashboard/announcements/${job.id}`)}
                className="flex items-center justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-all text-left cursor-pointer"
              >
                <div>
                  <p className="font-semibold text-sm text-gray-900">{job.title || job.role_display || job.role}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {job.enterprise_name} · {job.wilaya_display || job.wilaya}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Tag variant="new">{job.job_type_display || job.job_type}</Tag>
                  <Tag variant="remote">{job.status}</Tag>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
