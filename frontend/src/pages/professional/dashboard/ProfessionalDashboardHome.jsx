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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const displayName = getUserEmail()?.split("@")[0] || "there";

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      try {
        const [dashboardRes, applications] = await Promise.all([
          api.get("/dashboard/"),
          listApplications().catch(() => []),
        ]);
        if (cancelled) return;
        setRecent((dashboardRes.data?.recent_announcements || []).slice(0, 3));
        setApplicationCount(applications.length);
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Unable to load announcements."));
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
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-serif text-4xl text-navy font-normal mb-1">Welcome back, {displayName}</h1>
          <p className="text-sm text-gray-500">Here&apos;s your professional overview</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[
          { label: "Applications sent", value: String(applicationCount) },
          { label: "Offers received", value: "0" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl px-6 py-6 shadow-sm">
            <p className="text-sm text-gray-400 mb-2">{s.label}</p>
            <p className="font-serif text-5xl text-gray-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold text-gray-900">Recent announcements</h2>
          <button
            type="button"
            onClick={() => navigate("/professional/dashboard/announcements")}
            className="px-4 py-2 border border-gray-200 rounded-full text-sm hover:bg-gray-50 transition-colors"
          >
            View all
          </button>
        </div>

        <div className="flex flex-col gap-3">
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
                className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors text-left"
              >
                <div>
                  <p className="font-semibold text-sm text-gray-900">{job.role}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {job.enterprise_name} · {job.wilaya}
                  </p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Tag variant="new">{job.job_type}</Tag>
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
