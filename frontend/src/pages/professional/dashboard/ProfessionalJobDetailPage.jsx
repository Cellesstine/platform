import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getJobById } from "../../../data/professionalJobs";
import { Tag } from "../../../components/ui";
import ApplyModal from "./ApplyModal";

export default function ProfessionalJobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const job = getJobById(id);
  const [showApply, setShowApply] = useState(false);

  if (!job) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 mb-4">Job not found.</p>
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
              style={{ background: job.color }}
            >
              {job.initials}
            </div>
            <div>
              <p className="text-sm text-gray-500">{job.company}</p>
              <p className="text-xs text-gray-400">Posted {job.posted}</p>
            </div>
          </div>

          <h1 className="font-serif text-3xl text-navy mb-4">{job.title}</h1>

          <div className="flex flex-wrap gap-2 mb-8">
            <Tag variant="remote">{job.workMode}</Tag>
            {job.tags.includes("New") && <Tag variant="new">New</Tag>}
            <Tag>{job.type}</Tag>
            <Tag>{job.location}</Tag>
          </div>

          <section className="mb-8">
            <h2 className="font-semibold mb-3">About this role</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold mb-3">Responsibilities</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              {job.responsibilities.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="font-semibold mb-3">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((s) => (
                <Tag key={s} variant="skill">
                  {s}
                </Tag>
              ))}
            </div>
          </section>

          <section>
            <h2 className="font-semibold mb-3">What we offer</h2>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
              {job.offers.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          </section>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-4">
            <p className="font-serif text-2xl text-navy mb-1">{job.salary.replace("/mo", "")}</p>
            <p className="text-xs text-gray-400 mb-6">per month · {job.type}</p>

            <dl className="space-y-3 text-sm mb-6">
              {[
                ["Location", job.location],
                ["Work mode", job.workMode],
                ["Contract", job.contract],
                ["Experience", job.experience],
                ["Deadline", job.deadline],
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
              className="w-full py-3 bg-navy text-white rounded-xl text-sm font-medium hover:bg-navy/90 mb-3 flex items-center justify-center gap-2"
            >
              Apply Now →
            </button>
            <button
              type="button"
              className="w-full py-3 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center justify-center gap-2"
            >
              ☆ Save for later
            </button>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-semibold mb-4">About the company</h3>
            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: job.color }}
                >
                  {job.initials}
                </div>
                <div>
                  <p className="font-semibold text-sm">{job.company}</p>
                  <p className="text-xs text-gray-400">
                    {job.location} · {job.industry}
                  </p>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{job.aboutCompany}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-400 text-xs">Employees</p>
                <p className="font-medium">{job.employees}</p>
              </div>
              <div>
                <p className="text-gray-400 text-xs">Founded</p>
                <p className="font-medium">{job.founded}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ApplyModal open={showApply} onClose={() => setShowApply(false)} job={job} />
    </>
  );
}
