import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import {
  listAnnouncements,
  createAnnouncement,
  publishAnnouncement,
  closeAnnouncement,
  deleteAnnouncement,
} from "../../services/jobsApi";
import { parseApiError } from "../../services/auth";

// ── Shared helpers ────────────────────────────────────────
const Input = ({ label, placeholder, defaultValue, type = "text", className = "" }) => (
  <div className={`flex flex-col gap-1 mb-4 ${className}`}>
    {label && <label className="text-sm font-medium">{label}</label>}
    <input type={type} placeholder={placeholder} defaultValue={defaultValue}
      className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full" />
  </div>
);

// ── Dashboard Home ────────────────────────────────────────
export function DashboardHome() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentAnnouncements, setRecentAnnouncements] = useState([]);
  const [professionalProfiles, setProfessionalProfiles] = useState([]);

  useEffect(() => {
    let cancelled = false;
    const loadDashboard = async () => {
      try {
        const { data } = await api.get("/dashboard/");
        if (cancelled) return;
        setRecentAnnouncements(data?.recent_announcements || []);
        setProfessionalProfiles(data?.professional_profiles || []);
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Unable to load dashboard data."));
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
      <h1 className="font-serif text-3xl font-normal mb-1">Business Dashboard</h1>
      <p className="text-sm text-gray-400 mb-5">TechCorp Algérie overview</p>

      <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex gap-3 text-sm text-yellow-800 mb-6">
        <span>⚠</span>
        <span>Account pending verification. You cannot post announcements until approved by admin.</span>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ l: "Active announcements", v: "0" }, { l: "Total applicants", v: "0" }, { l: "Workers contacted", v: "0" }].map((s) => (
          <div key={s.l} className="linkio-panel px-6 py-5">
            <p className="text-xs text-gray-400 mb-2">{s.l}</p>
            <p className="font-serif text-4xl text-gray-900">{s.v}</p>
          </div>
        ))}
      </div>

      <div className="linkio-panel p-6 mb-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold">Recent announcements</h2>
          <button onClick={() => navigate("/dashboard/announcements")} className="px-4 py-2 linkio-dash-btn linkio-dash-btn-crimson transition-all">Manage jobs</button>
        </div>
        {loading ? (
          <p className="text-center text-sm text-gray-300 py-12">Loading announcements...</p>
        ) : error ? (
          <p className="text-center text-sm text-red-500 py-12">{error}</p>
        ) : recentAnnouncements.length === 0 ? (
          <p className="text-center text-sm text-gray-300 py-12">Post your first announcement to get started.</p>
        ) : (
          <div className="space-y-3">
            {recentAnnouncements.map((item) => (
              <div key={item.id} className="p-4 border border-gray-100 rounded-xl">
                <p className="text-sm font-semibold text-gray-900">{item.role}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {item.industry} · {item.wilaya} · {item.job_type} · {item.status}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="linkio-panel p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold">Professional profiles</h2>
          <button onClick={() => navigate("/dashboard/find-workers")} className="px-4 py-2 border border-gray-200 rounded-full text-sm hover:bg-gray-50 transition-all">View all</button>
        </div>
        {loading ? (
          <p className="text-center text-sm text-gray-300 py-12">Loading profiles...</p>
        ) : professionalProfiles.length === 0 ? (
          <p className="text-center text-sm text-gray-300 py-12">No professional profiles found yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {professionalProfiles.map((profile) => (
              <div key={profile.id} className="p-4 border border-gray-100 rounded-xl">
                <p className="text-sm font-semibold text-gray-900">{profile.full_name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {profile.professional_title} · {profile.wilaya} · {profile.years_experience} yrs
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Announcements ─────────────────────────────────────────
const badgeClass = {
  ACTIVE: "bg-green-100 text-green-700",
  CLOSED: "bg-red/10 text-red",
  DRAFT: "bg-gray-100 text-gray-500",
};

const INDUSTRY_OPTIONS = ["TECH", "FINANCE", "WATER", "CONSTRUCTION", "HEALTHCARE", "EDUCATION", "RETAIL", "ENERGY", "AGRICULTURE", "TRANSPORT", "OTHER"];
const JOB_TYPE_OPTIONS = ["FULL_TIME", "PART_TIME", "CONTRACT", "REMOTE", "HYBRID"];
const ROLE_OPTIONS = ["WEB_DEVELOPER", "MOBILE_DEVELOPER", "DATA_SCIENTIST", "PRODUCT_MANAGER", "GRAPHIC_DESIGNER", "UX_UI_DESIGNER", "ACCOUNTANT", "OTHER"];
const WILAYA_OPTIONS = ["alger", "oran", "constantine", "annaba", "setif", "tlemcen", "bejaia", "blida"];

export function AnnouncementsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState("");

  const loadAnnouncements = async () => {
    const statusFilter = filter === "All" ? "ALL" : filter.toUpperCase();
    const data = await listAnnouncements({
      status: statusFilter,
      search: search || undefined,
    });
    setJobs(data);
  };

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const statusFilter = filter === "All" ? "ALL" : filter.toUpperCase();
        const data = await listAnnouncements({
          status: statusFilter,
          search: search || undefined,
        });
        if (cancelled) return;
        setJobs(data);
        setError("");
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Unable to load announcements."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [filter, search]);

  const runAction = async (id, action) => {
    setActionLoadingId(id);
    try {
      await action();
      await loadAnnouncements();
      setError("");
    } catch (err) {
      setError(parseApiError(err, "Action failed."));
    } finally {
      setActionLoadingId("");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-serif text-3xl font-normal mb-1">Manage Jobs</h1>
          <p className="text-sm text-gray-400">Track your announcements, edit listings, and manage applicants.</p>
        </div>
        <button onClick={() => navigate("/dashboard/announcements/new")} className="px-5 py-2.5 linkio-dash-btn linkio-dash-btn-crimson transition-all">
          + New Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[{ l: "Total Listings", v: String(jobs.length) }, { l: "Active", v: String(jobs.filter((j) => j.status === "ACTIVE").length) }, { l: "Total Applications", v: String(jobs.reduce((sum, j) => sum + (j.applicant_count || 0), 0)) }].map((s) => (
          <div key={s.l} className="linkio-panel px-6 py-5">
            <p className="text-xs text-gray-400 mb-2">{s.l}</p>
            <p className="font-serif text-4xl">{s.v}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="linkio-panel p-6 mb-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold">All Announcements</h2>
          <div className="flex gap-3 items-center">
            <div className="flex bg-cream rounded-full p-1 border border-gray-200">
              {["All", "Active", "Draft", "Closed"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all ${filter === f ? "bg-white font-medium text-gray-900" : "text-gray-400"}`}>
                  {f}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none w-44"
              placeholder="Search listings..."
            />
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-gray-400">Loading announcements...</p>
        ) : error ? (
          <p className="text-sm text-red-600">{error}</p>
        ) : (
        <table className="w-full">
          <thead>
            <tr>{["JOB", "STATUS", "APPLICATIONS", "DEADLINE", "ACTIONS"].map((h) => (
              <th key={h} className="text-left text-[11px] tracking-widest text-gray-300 py-2 px-3 border-b border-gray-100 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id} className="hover:bg-gray-50">
                <td className="py-4 px-3 border-b border-gray-100">
                  <p className="text-sm font-medium">{j.role}</p>
                  <p className="text-xs text-gray-400">{j.wilaya} · {j.job_type} · {j.enterprise_name}</p>
                </td>
                <td className="py-4 px-3 border-b border-gray-100">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeClass[j.status] || "bg-gray-100 text-gray-600"}`}>
                    {j.status}
                  </span>
                </td>
                <td className="py-4 px-3 border-b border-gray-100 text-sm">{j.applicant_count ?? 0}</td>
                <td className="py-4 px-3 border-b border-gray-100 text-sm">{j.deadline || "—"}</td>
                <td className="py-4 px-3 border-b border-gray-100">
                  <div className="flex gap-2">
                    {j.status === "DRAFT" ? (
                      <button
                        onClick={() => runAction(j.id, () => publishAnnouncement(j.id))}
                        disabled={actionLoadingId === j.id}
                        className="px-3 py-1.5 bg-red text-white rounded-full text-xs disabled:opacity-60"
                      >
                        Publish
                      </button>
                    ) : null}
                    {j.status === "ACTIVE" ? (
                      <button
                        onClick={() => runAction(j.id, () => closeAnnouncement(j.id))}
                        disabled={actionLoadingId === j.id}
                        className="px-3 py-1.5 border border-gray-200 rounded-full text-xs hover:bg-gray-50 disabled:opacity-60"
                      >
                        Close
                      </button>
                    ) : null}
                    <button
                      onClick={() => runAction(j.id, () => deleteAnnouncement(j.id))}
                      disabled={actionLoadingId === j.id}
                      className="px-3 py-1.5 border border-red/30 text-red rounded-full text-xs hover:bg-red/5 disabled:opacity-60"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}

// ── New Announcement ──────────────────────────────────────
export function NewAnnouncementPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    role: "WEB_DEVELOPER",
    industry: "TECH",
    job_type: "FULL_TIME",
    wilaya: "alger",
    address: "",
    description: "",
    experience_required: 0,
    deadline: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const submitAnnouncement = async (publishNow) => {
    if (!form.address.trim() || !form.description.trim()) {
      setError("Address and description are required.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const created = await createAnnouncement({
        ...form,
        address: form.address.trim(),
        description: form.description.trim(),
        experience_required: Number(form.experience_required || 0),
        deadline: form.deadline || null,
      });
      if (publishNow && created?.id) {
        await publishAnnouncement(created.id);
      }
      navigate("/dashboard/announcements");
    } catch (err) {
      const data = err.response?.data;
      if (typeof data?.error === "string") {
        setError(data.error);
      } else {
        const firstKey = data && typeof data === "object" ? Object.keys(data)[0] : "";
        const message = firstKey ? (Array.isArray(data[firstKey]) ? data[firstKey][0] : data[firstKey]) : null;
        setError(message || "Unable to save announcement.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-serif text-3xl font-normal mb-1">New Announcement</h1>
          <p className="text-sm text-gray-400">Post a job opening or freelance mission</p>
        </div>
        <button onClick={() => navigate("/dashboard/announcements")} className="px-4 py-2 border border-gray-200 rounded-full text-sm hover:bg-gray-50">← Back to Announcements</button>
      </div>

      {[
        {
          title: "Basic Information",
          content: (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-sm font-medium">Job Role</label>
                  <select className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full" value={form.role} onChange={(e) => setField("role", e.target.value)}>
                    {ROLE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-sm font-medium">Category</label>
                  <select className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full" value={form.industry} onChange={(e) => setField("industry", e.target.value)}>
                    {INDUSTRY_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-sm font-medium">Contract Type</label>
                  <select className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full" value={form.job_type} onChange={(e) => setField("job_type", e.target.value)}>
                    {JOB_TYPE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-sm font-medium">Wilaya</label>
                  <select className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full" value={form.wilaya} onChange={(e) => setField("wilaya", e.target.value)}>
                    {WILAYA_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-sm font-medium">Address</label>
                  <input value={form.address} onChange={(e) => setField("address", e.target.value)} placeholder="Exact work address" className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full" />
                </div>
                <div className="flex flex-col gap-1 mb-4">
                  <label className="text-sm font-medium">Experience Required</label>
                  <input type="number" min="0" value={form.experience_required} onChange={(e) => setField("experience_required", e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full" />
                </div>
              </div>
            </>
          ),
        },
        {
          title: "Compensation",
          content: (
            <div className="grid grid-cols-3 gap-4">
              <Input label="Min Salary (DA/month)" placeholder="e.g. 80000" />
              <Input label="Max Salary (DA/month)" placeholder="e.g. 120000" />
              <Input label="Display salary?" defaultValue="Show salary range" />
            </div>
          ),
        },
        {
          title: "Job Description",
          content: (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">Description <span className="text-red">*</span></label>
              <textarea rows={5} value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="Describe the role, your team, and responsibilities..."
                className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white resize-y" />
              <div className="mt-3">
                <label className="text-sm font-medium block mb-1">Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => setField("deadline", e.target.value)} className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white w-full" />
              </div>
            </div>
          ),
        },
      ].map((section) => (
        <div key={section.title} className="linkio-panel p-6 mb-4">
          <h2 className="font-semibold mb-5 pb-3 border-b border-gray-100">{section.title}</h2>
          {section.content}
        </div>
      ))}

      {error ? <p className="text-sm text-red-600 mb-4">{error}</p> : null}
      <div className="flex justify-end gap-3">
        <button disabled={submitting} className="px-5 py-2.5 border border-gray-200 rounded-full text-sm hover:bg-gray-50 disabled:opacity-60" onClick={() => submitAnnouncement(false)}>Save as Draft</button>
        <button disabled={submitting} className="px-7 py-2.5 bg-red text-white rounded-full text-sm font-medium hover:bg-red-dark transition-all disabled:opacity-60" onClick={() => submitAnnouncement(true)}>{submitting ? "Saving..." : "Publish →"}</button>
      </div>
    </div>
  );
}

// ── Find Workers ──────────────────────────────────────────
const AVATAR_COLORS = ["#fde68a", "#bfdbfe", "#d1fae5", "#e0e7ff", "#fce7f3", "#fef3c7"];

export function FindWorkersPage() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const { data } = await api.get("/dashboard/");
        if (cancelled) return;
        setWorkers(data?.professional_profiles || []);
        setError("");
      } catch (err) {
        if (cancelled) return;
        setError(parseApiError(err, "Unable to load professionals."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = workers.filter((w) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      w.full_name?.toLowerCase().includes(q) ||
      w.professional_title?.toLowerCase().includes(q) ||
      w.wilaya?.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <h1 className="font-serif text-3xl font-normal mb-1">Find Workers</h1>
      <p className="text-sm text-gray-400 mb-6">Browse verified professionals across Algeria</p>

      <div className="flex gap-3 mb-6">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-navy"
          placeholder="Search by name, skill, title..."
        />
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading professionals...</p>
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-gray-400">No professional profiles found yet.</p>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((w, index) => {
            const ini = (w.full_name || "??")
              .split(" ")
              .map((p) => p[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            return (
              <div key={w.id} className="linkio-panel p-5 hover:shadow-md transition-all">
                <div
                  className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold mb-3"
                  style={{ background: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
                >
                  {ini}
                </div>
                <p className="font-semibold text-sm mb-0.5">{w.full_name}</p>
                <p className="text-xs text-gray-400 mb-3">
                  {w.professional_title} · {w.wilaya}
                </p>
                <span className="text-xs px-2.5 py-1 bg-red/5 text-red rounded-full inline-block mb-4">
                  {w.years_experience ?? 0} yrs experience
                </span>
                <button
                  type="button"
                  className="w-full py-2 border border-gray-200 rounded-xl text-sm text-red hover:bg-red/5 transition-all"
                  disabled
                >
                  Contact (coming soon)
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Company Profile Edit ──────────────────────────────────
export function CompanyProfileEditPage() {
  return (
    <div>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="font-serif text-3xl font-normal mb-1">Edit Company Profile</h1>
          <p className="text-sm text-gray-400">Changes are visible to all users on the platform.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-200 rounded-full text-sm hover:bg-gray-50">Preview public page</button>
          <button className="px-5 py-2 bg-red text-white rounded-full text-sm hover:bg-red-dark transition-all">Save Changes</button>
        </div>
      </div>

      {/* Cover */}
      <div className="linkio-panel overflow-hidden mb-5">
        <div className="h-36 bg-gradient-to-br from-red to-red-dark flex items-end justify-end p-3">
          <button className="flex items-center gap-2 text-xs bg-black/30 text-white border border-white/30 px-3 py-1.5 rounded-full">✏ Edit cover</button>
        </div>
        <div className="px-6 pb-5">
          <div className="-mt-8 mb-2">
            <div className="w-16 h-16 bg-white border-2 border-white rounded-xl flex items-center justify-center font-bold text-xl shadow-md relative">
              TC
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-red rounded-full flex items-center justify-center text-white text-[9px]">✓</div>
            </div>
          </div>
          <p className="font-semibold text-lg">TechCorp Algérie</p>
          <p className="text-sm text-gray-400">Business Plan · Verified</p>
        </div>
      </div>

      {/* Form */}
      <div className="linkio-panel p-6">
        <h2 className="font-semibold mb-5 pb-3 border-b border-gray-100">Basic Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Company Name" defaultValue="TechCorp Algérie" />
          <Input label="Industry / Sector" defaultValue="Technology" />
          <Input label="Company Size" defaultValue="50–200" />
          <Input label="Year Founded" defaultValue="2019" />
          <Input label="Headquarters Wilaya" defaultValue="Alger" />
          <Input label="City" defaultValue="Hydra" />
          <Input label="Website" defaultValue="https://techcorp.dz" />
          <Input label="LinkedIn" placeholder="https://linkedin.com/company/..." />
        </div>
        <Input label="Tagline" defaultValue="Building next-generation SaaS products for the Algerian market and beyond" />
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">About the Company</label>
          <textarea rows={4} defaultValue="Founded in 2019, TechCorp Algérie is a technology company specializing in enterprise SaaS solutions..."
            className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white resize-y" />
        </div>
      </div>
    </div>
  );
}
