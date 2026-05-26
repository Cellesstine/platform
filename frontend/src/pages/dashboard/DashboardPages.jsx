import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

      <div className="linkio-panel p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold">Recent applicants</h2>
          <button onClick={() => navigate("/dashboard/announcements")} className="px-4 py-2 linkio-dash-btn linkio-dash-btn-crimson transition-all">Manage jobs</button>
        </div>
        <p className="text-center text-sm text-gray-300 py-12">Post your first announcement to start receiving applicants.</p>
      </div>
    </div>
  );
}

// ── Announcements ─────────────────────────────────────────
const jobs = [
  { id: 1, title: "Senior Frontend Developer", meta: "Remote · CDI · Posted 10 Apr", status: "active",  apps: 24, deadline: "15 May 2026" },
  { id: 2, title: "Product Designer",           meta: "Alger · CDI · Posted 5 Apr",  status: "active",  apps: 18, deadline: "30 Apr 2026" },
  { id: 3, title: "DevOps Engineer",            meta: "Remote · CDI · Posted 1 Apr", status: "active",  apps: 31, deadline: "20 May 2026" },
  { id: 4, title: "Business Dev Manager",       meta: "Alger · CDI · Posted 18 Mar", status: "paused",  apps: 14, deadline: "—" },
  { id: 5, title: "Data Analyst",               meta: "Alger · CDD · Posted 5 Jan",  status: "draft",   apps: null, deadline: "—" },
  { id: 6, title: "QA Engineer",                meta: "Remote · CDI · Closed 28 Feb",status: "closed",  apps: 42, deadline: "28 Feb 2026" },
];

const badgeClass = { active: "bg-green-100 text-green-700", paused: "bg-yellow-100 text-yellow-700", draft: "bg-gray-100 text-gray-500", closed: "bg-red/10 text-red" };

const applicants = [
  { name: "Yacine Benali",  ini: "YB", color: "#fde68a", applied: "20 Apr", match: "96%", stage: "Shortlisted" },
  { name: "Sara Hamdi",     ini: "SH", color: "#bfdbfe", applied: "18 Apr", match: "88%", stage: "Under Review" },
  { name: "Karim Meziane",  ini: "KM", color: "#d1fae5", applied: "17 Apr", match: "81%", stage: "Applied" },
];

export function AnnouncementsPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? jobs : jobs.filter((j) => j.status === filter.toLowerCase());

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
        {[{ l: "Total Listings", v: "12", t: "↑ 2 this month" }, { l: "Active", v: "4" }, { l: "Total Applications", v: "87", t: "↑ 14 this week" }].map((s) => (
          <div key={s.l} className="linkio-panel px-6 py-5">
            <p className="text-xs text-gray-400 mb-2">{s.l}</p>
            <p className="font-serif text-4xl">{s.v}</p>
            {s.t && <p className="text-xs text-green-600 mt-1">{s.t}</p>}
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="linkio-panel p-6 mb-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-semibold">All Announcements</h2>
          <div className="flex gap-3 items-center">
            <div className="flex bg-cream rounded-full p-1 border border-gray-200">
              {["All", "Active", "Drafts", "Closed"].map((f) => (
                <button key={f} onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs transition-all ${filter === f ? "bg-white font-medium text-gray-900" : "text-gray-400"}`}>
                  {f}
                </button>
              ))}
            </div>
            <input className="px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none w-44" placeholder="Search listings..." />
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr>{["JOB", "STATUS", "APPLICATIONS", "DEADLINE", "ACTIONS"].map((h) => (
              <th key={h} className="text-left text-[11px] tracking-widest text-gray-300 py-2 px-3 border-b border-gray-100 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {filtered.map((j) => (
              <tr key={j.id} className="hover:bg-gray-50">
                <td className="py-4 px-3 border-b border-gray-100">
                  <p className="text-sm font-medium">{j.title}</p>
                  <p className="text-xs text-gray-400">{j.meta}</p>
                </td>
                <td className="py-4 px-3 border-b border-gray-100">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${badgeClass[j.status]}`}>
                    {j.status.charAt(0).toUpperCase() + j.status.slice(1)}
                  </span>
                </td>
                <td className="py-4 px-3 border-b border-gray-100 text-sm">{j.apps ?? "—"}</td>
                <td className="py-4 px-3 border-b border-gray-100 text-sm">{j.deadline}</td>
                <td className="py-4 px-3 border-b border-gray-100">
                  <div className="flex gap-2">
                    {j.status !== "draft" && <button className="px-3 py-1.5 linkio-dash-btn linkio-dash-btn-crimson text-xs transition-all">View Apps</button>}
                    {j.status === "draft" && <button className="px-3 py-1.5 bg-red text-white rounded-full text-xs">Publish</button>}
                    <button className="px-3 py-1.5 border border-gray-200 rounded-full text-xs hover:bg-gray-50">{j.status === "paused" ? "Resume" : j.status === "closed" ? "Duplicate" : "Edit"}</button>
                    <button className="px-3 py-1.5 border border-red/30 text-red rounded-full text-xs hover:bg-red/5">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Applicants */}
      <div className="linkio-panel p-6">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="font-semibold">Applicants — Senior Frontend Developer</h2>
            <p className="text-xs text-gray-400 mt-1">24 applications · 15 May 2026 deadline</p>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-gray-200 rounded-full text-xs hover:bg-gray-50">Export CSV</button>
            <button className="px-3 py-1.5 border border-gray-200 rounded-full text-xs hover:bg-gray-50">All stages</button>
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr>{["CANDIDATE", "APPLIED", "MATCH", "STAGE", "ACTIONS"].map((h) => (
              <th key={h} className="text-left text-[11px] tracking-widest text-gray-300 py-2 px-3 border-b border-gray-100 uppercase">{h}</th>
            ))}</tr>
          </thead>
          <tbody>
            {applicants.map((a) => (
              <tr key={a.name} className="hover:bg-gray-50">
                <td className="py-4 px-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: a.color }}>{a.ini}</div>
                    <span className="text-sm font-medium">{a.name}</span>
                  </div>
                </td>
                <td className="py-4 px-3 border-b border-gray-100 text-sm text-gray-500">{a.applied}</td>
                <td className="py-4 px-3 border-b border-gray-100 text-sm font-medium text-green-700">{a.match}</td>
                <td className="py-4 px-3 border-b border-gray-100"><span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full">{a.stage}</span></td>
                <td className="py-4 px-3 border-b border-gray-100">
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 border border-gray-200 rounded-full text-xs hover:bg-gray-50">View</button>
                    <button className="px-3 py-1.5 linkio-dash-btn linkio-dash-btn-crimson text-xs">Interview</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── New Announcement ──────────────────────────────────────
export function NewAnnouncementPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("Remote");

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
              <Input label={<>Job Title <span className="text-red">*</span></>} placeholder="e.g. Senior Frontend Developer" />
              <div className="grid grid-cols-2 gap-4">
                <Input label={<>Category <span className="text-red">*</span></>} placeholder="Select a category" />
                <Input label={<>Contract Type <span className="text-red">*</span></>} defaultValue="CDI (Permanent)" />
              </div>
              <div className="mb-4">
                <label className="text-sm font-medium block mb-2">Work Mode <span className="text-red">*</span></label>
                <div className="flex gap-2">
                  {["Remote", "Presential", "Hybrid"].map((m) => (
                    <button key={m} onClick={() => setMode(m)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-all ${mode === m ? "border-red bg-red/5 text-red" : "border-gray-200 text-gray-600"}`}>
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${mode === m ? "border-red" : "border-gray-300"}`}>
                        {mode === m && <div className="w-2 h-2 rounded-full bg-red" />}
                      </div>
                      {m}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input label={<>Wilaya <span className="text-red">*</span></>} defaultValue="Alger" />
                <Input label="Experience Required" defaultValue="3–5 years" />
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
              <textarea rows={5} placeholder="Describe the role, your team, the context, and what makes it a great opportunity..."
                className="px-4 py-3 rounded-xl border border-gray-200 bg-cream text-sm outline-none focus:border-navy focus:bg-white resize-y" />
            </div>
          ),
        },
      ].map((section) => (
        <div key={section.title} className="linkio-panel p-6 mb-4">
          <h2 className="font-semibold mb-5 pb-3 border-b border-gray-100">{section.title}</h2>
          {section.content}
        </div>
      ))}

      <div className="flex justify-end gap-3">
        <button className="px-5 py-2.5 border border-gray-200 rounded-full text-sm hover:bg-gray-50" onClick={() => navigate("/dashboard/announcements")}>Save as Draft</button>
        <button className="px-7 py-2.5 bg-red text-white rounded-full text-sm font-medium hover:bg-red-dark transition-all" onClick={() => navigate("/dashboard/announcements")}>Publish →</button>
      </div>
    </div>
  );
}

// ── Find Workers ──────────────────────────────────────────
const workers = [
  { ini: "YB", color: "#fde68a", name: "Yacine Benali",  role: "Software Engineer · Alger",    tags: ["React", "Node.js", "3 yrs"], mode: "Remote OK" },
  { ini: "SH", color: "#bfdbfe", name: "Sara Hamdi",     role: "UX Designer · Oran",           tags: ["Figma", "Research", "5 yrs"], mode: "Presential" },
  { ini: "KM", color: "#d1fae5", name: "Karim Meziane",  role: "Civil Engineer · Constantine",  tags: ["AutoCAD", "BIM", "2 yrs"],   mode: "Presential" },
  { ini: "NA", color: "#e0e7ff", name: "Nadia Aïssani",  role: "Financial Analyst · Alger",    tags: ["Excel", "Finance", "4 yrs"], mode: "Remote OK" },
  { ini: "LB", color: "#fce7f3", name: "Leila Bensalem", role: "Marketing Manager · Annaba",   tags: ["SEO", "Content", "6 yrs"],   mode: "Remote OK" },
  { ini: "OD", color: "#fef3c7", name: "Omar Dali",      role: "Data Analyst · Sétif",         tags: ["Python", "SQL", "3 yrs"],    mode: "Remote OK" },
];

export function FindWorkersPage() {
  return (
    <div>
      <h1 className="font-serif text-3xl font-normal mb-1">Find Workers</h1>
      <p className="text-sm text-gray-400 mb-6">Browse verified professionals across Algeria</p>

      <div className="flex gap-3 mb-6">
        <input className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-navy" placeholder="Search by name, skill, title..." />
        <input className="w-44 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none" defaultValue="All categories" />
        <input className="w-36 px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white outline-none" defaultValue="All types" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        {workers.map((w) => (
          <div key={w.name} className="linkio-panel p-5 hover:shadow-md transition-all">
            <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold mb-3" style={{ background: w.color }}>{w.ini}</div>
            <p className="font-semibold text-sm mb-0.5">{w.name}</p>
            <p className="text-xs text-gray-400 mb-3">{w.role}</p>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {w.tags.map((t) => <span key={t} className="text-xs px-2 py-0.5 bg-cream border border-gray-200 rounded-md">{t}</span>)}
            </div>
            <span className="text-xs px-2.5 py-1 bg-red/5 text-red rounded-full inline-block mb-4">{w.mode}</span>
            <button className="w-full py-2 border border-gray-200 rounded-xl text-sm text-red hover:bg-red/5 transition-all">Contact</button>
          </div>
        ))}
      </div>
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
