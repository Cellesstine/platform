import { useNavigate } from "react-router-dom";
import { professionalJobs } from "../../../data/professionalJobs";
import { Tag } from "../../../components/ui";

export default function ProfessionalDashboardHome() {
  const navigate = useNavigate();
  const recent = professionalJobs.slice(0, 3);

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-serif text-4xl text-navy font-normal mb-1">Welcome back, Yacine</h1>
          <p className="text-sm text-gray-500">Here&apos;s your professional overview</p>
        </div>
        <span className="text-xs font-medium text-amber-800 bg-amber-light border border-amber/30 px-3 py-1.5 rounded-full">
          Pending Verification
        </span>
      </div>

      <div className="bg-amber-light border border-amber/25 rounded-xl px-4 py-3 flex gap-3 text-sm text-amber-900 mb-8">
        <span className="text-lg">ℹ</span>
        <span>
          Your account is pending verification. You can browse but cannot apply until approved.
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {[
          { label: "Applications sent", value: "0" },
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
          {recent.map((job) => (
            <button
              key={job.id}
              type="button"
              onClick={() => navigate(`/professional/dashboard/announcements/${job.id}`)}
              className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <div>
                <p className="font-semibold text-sm text-gray-900">{job.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {job.company} · {job.location} · {job.posted}
                </p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {job.tags.map((t) => (
                  <Tag key={t} variant={t === "Remote" ? "remote" : t === "New" ? "new" : "presential"}>
                    {t}
                  </Tag>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
