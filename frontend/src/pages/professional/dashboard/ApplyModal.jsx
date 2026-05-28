import { useState } from "react";
import { Modal } from "../../../components/ui";
import { createApplication } from "../../../services/applicationsApi";
import { parseApiError } from "../../../services/auth";

export default function ApplyModal({ open, onClose, job }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!job) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    try {
      await createApplication({
        announcementId: job.id,
        coverLetter,
        resumeFile,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCoverLetter("");
        setResumeFile(null);
        onClose();
      }, 1500);
    } catch (err) {
      if (err.code === "MISSING_APPLICANT") {
        setError(
          "Your professional profile is not set up yet. Complete onboarding (profile setup) before applying."
        );
      } else {
        setError(parseApiError(err, "Unable to submit your application."));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-xl">
      <div className="p-8">
        <h2 className="font-serif text-2xl text-navy mb-1">Apply for this position</h2>
        <p className="text-sm text-gray-500 mb-6">Review your application before sending.</p>

        <div className="bg-pro-blue/20 rounded-xl p-4 flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: "#1b2d52" }}
          >
            {(job.enterprise_name || "CO").slice(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-sm">{job.role}</p>
            <p className="text-xs text-gray-500">
              {job.enterprise_name} · {job.wilaya} · {job.job_type}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold mb-3">Resume (PDF, max 5 MB)</p>
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            className="w-full text-sm text-gray-600"
          />
          {resumeFile ? (
            <p className="text-xs text-gray-400 mt-2">
              {resumeFile.name} · {(resumeFile.size / 1024).toFixed(0)} KB
            </p>
          ) : null}
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold mb-3">Cover letter</p>
          <textarea
            rows={5}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Introduce yourself and explain why you're a great fit for this role..."
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm outline-none focus:border-navy resize-y"
          />
        </div>

        {error ? (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2 mb-4">
            Application submitted successfully.
          </p>
        ) : null}

        <div className="flex justify-between items-center">
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900">
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting || success}
            className="px-8 py-3 bg-navy text-white rounded-full text-sm font-medium hover:bg-navy/90 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit Application →"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
