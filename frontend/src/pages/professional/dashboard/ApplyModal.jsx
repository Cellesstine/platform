import { Modal } from "../../../components/ui";

export default function ApplyModal({ open, onClose, job }) {
  if (!job) return null;

  return (
    <Modal open={open} onClose={onClose} className="max-w-xl">
      <div className="p-8">
        <h2 className="font-serif text-2xl text-navy mb-1">Apply for this position</h2>
        <p className="text-sm text-gray-500 mb-6">Review your application before sending.</p>

        <div className="bg-pro-blue/20 rounded-xl p-4 flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
            style={{ background: job.color }}
          >
            {job.initials}
          </div>
          <div>
            <p className="font-semibold text-sm">{job.title}</p>
            <p className="text-xs text-gray-500">
              {job.company} · {job.workMode} · {job.contract} · {job.salary}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold mb-3">Select your CV</p>
          <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-3">
            <span className="text-2xl">📄</span>
            <div>
              <p className="text-sm font-medium">CV_Yacine_Freelance.pdf</p>
              <p className="text-xs text-gray-400">Uploaded 10 Jan 2026 · 290 KB</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-sm font-semibold mb-3">Cover letter (optional)</p>
          <textarea
            rows={5}
            placeholder="Introduce yourself and explain why you're a great fit for this role..."
            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-sm outline-none focus:border-navy resize-y"
          />
        </div>

        <div className="flex justify-between items-center">
          <button type="button" onClick={onClose} className="text-sm text-gray-500 hover:text-gray-900">
            Cancel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-3 bg-navy text-white rounded-full text-sm font-medium hover:bg-navy/90"
          >
            Submit Application →
          </button>
        </div>
      </div>
    </Modal>
  );
}
