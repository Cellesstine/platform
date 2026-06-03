import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Tag } from "../../../components/ui";
import ApplyModal from "./ApplyModal";
import api from "../../../services/api";
import { parseApiError } from "../../../services/auth";

export default function ProfessionalJobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showApply, setShowApply] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const loadDetails = async () => {
      try {
        const { data } = await api.get(`/jobs/${id}/`);
        if (cancelled) return;
        setJob(data);
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Job not found."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    loadDetails();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p className="text-sm text-gray-500 py-10">Loading job details...</p>;
  }

  if (!job) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">{error || "Job not found."}</p>
        <button
          type="button"
          onClick={() => navigate("/professional/dashboard/announcements")}
          className="text-navy underline text-sm"
        >
          Back to Announcements
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => navigate("/professional/dashboard/announcements")}
        className="text-sm text-gray-500 hover:text-navy mb-4 flex items-center gap-1"
      >
        ← Back to Announcements
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold"
              style={{ background: "#1b2d52" }}
            >
              {(job.enterprise_name || "CO").slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-gray-500">{job.enterprise_name}</p>
              <p className="text-xs text-gray-400">
                Posted {job.created_at ? new Date(job.created_at).toLocaleDateString() : "recently"}
              </p>
            </div>
          </div>

          <h1 className="font-serif text-3xl text-navy mb-4">{job.title || job.role_display || job.role}</h1>

          <div className="flex flex-wrap gap-2 mb-8">
            <Tag variant="remote">{job.job_type_display || job.job_type}</Tag>
            <Tag variant="new">{job.status}</Tag>
            <Tag>{job.wilaya_display || job.wilaya}</Tag>
            <Tag>{job.industry_display || job.industry}</Tag>
          </div>

          <section className="mb-8">
            <h2 className="font-semibold mb-3">About this role</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{job.description || "No description provided."}</p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold mb-3">Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              {(job.description ? [job.description] : ["See role description for details."]).map((r) => (
                <li key={r.slice(0, 20)}>{r}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {(job.required_skills || []).map((s) => (
                <Tag key={s} variant="skill">
                  {s}
                </Tag>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-semibold mb-3">What we offer</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              {["Competitive environment", "Growth opportunities", "Collaborative team"].map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4">
            <p className="font-serif text-2xl text-navy mb-1">{job.title || job.role_display || job.role}</p>
            <p className="text-xs text-gray-400 mb-6">{job.enterprise_name}</p>

            <dl className="space-y-3 text-sm mb-6">
              {[
                ["Location", job.wilaya_display || job.wilaya],
                ["Address", job.address],
                ["Contract", job.job_type_display || job.job_type],
                ["Experience", String(job.experience_required ?? 0)],
                ["Deadline", job.deadline || "Not set"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-gray-400">{k}</dt>
                  <dd className="font-medium text-gray-800">{v}</dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={() => setShowApply(true)}
              className="w-full py-3 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 flex items-center justify-center gap-2"
            >
              Apply Now →
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">About the company</h3>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                style={{ background: "#1b2d52" }}
                >
                {(job.enterprise_name || "CO").slice(0, 2).toUpperCase()}
                </div>
                <div>
                <p className="font-semibold text-sm">{job.enterprise_name}</p>
                  <p className="text-xs text-gray-400">
                    {job.wilaya_display || job.wilaya} · {job.industry_display || job.industry}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">Company profile details are available in public profile view.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Employees</p>
                <p className="font-medium">-</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Founded</p>
                <p className="font-medium">-</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ApplyModal open={showApply} onClose={() => setShowApply(false)} job={job} />
    </>
  );
}
