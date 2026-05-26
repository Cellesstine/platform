import { useState } from "react";
import { useNavigate } from "react-router-dom";
import LinkioBrand from "../../components/LinkioBrand";

export default function CompanyPublicPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("overview");
  const tabs = ["overview", "jobs", "reviews", "culture"];

  return (
    <div className="min-h-screen bg-cream font-sans">
      <nav className="linkio-topbar px-10">
        <LinkioBrand logoWidth={32} logoHeight={20} wordmarkClassName="font-serif text-base font-semibold text-navy tracking-tight" />
        <div className="flex gap-2">
          <button className="px-4 py-1.5 rounded-full border border-gray-200 text-sm">Find Jobs</button>
          <button className="px-4 py-1.5 rounded-full border border-gray-200 text-sm">Companies</button>
          <button className="px-4 py-1.5 rounded-full bg-navy text-white text-sm">My Profile</button>
        </div>
      </nav>

      <div className="px-10 py-4">
        <button onClick={() => navigate(-1)} className="text-sm text-navy hover:underline">← Companies</button>
      </div>

      {/* Card */}
      <div className="mx-10 bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
        <div className="h-40 bg-gradient-to-br from-red to-red-dark relative flex items-start justify-end p-4">
          <span className="bg-black/30 text-white text-xs px-3 py-1.5 rounded-full">★ Verified Company</span>
        </div>
        <div className="px-7">
          <div className="-mt-9 mb-3">
            <div className="w-16 h-16 bg-white border-2 border-white rounded-xl flex items-center justify-center font-bold text-lg shadow-md">TC</div>
          </div>
          <h1 className="font-serif text-2xl mb-1">TechCorp Algérie</h1>
          <p className="text-sm text-gray-500 mb-3">Building next-generation SaaS products for the Algerian market and beyond</p>
          <div className="flex gap-5 text-sm text-gray-500 mb-4 flex-wrap">
            <span>📍 Alger, Hydra</span><span>🏢 Technology · SaaS</span><span>🕐 Founded 2019</span><span>👥 50–200 employees</span>
          </div>
          <div className="flex gap-2 pb-5">
            <button className="px-4 py-2 bg-navy text-white rounded-full text-sm">Follow Company</button>
            <button className="px-4 py-2 border border-gray-200 rounded-full text-sm">Visit Website ↗</button>
            <button className="px-4 py-2 border border-gray-200 rounded-full text-sm">Share</button>
          </div>
          <div className="flex border-t border-gray-100">
            {tabs.map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-4 py-3 text-sm border-b-2 transition-all ${tab === t ? "border-red text-red" : "border-transparent text-gray-400"}`}>
                {t === "jobs" ? "Jobs (4)" : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-10 flex gap-6 pb-16">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold mb-4">About TechCorp Algérie</h2>
          <p className="text-sm text-gray-500 leading-relaxed mb-3">Founded in 2019, TechCorp Algérie is a technology company specializing in enterprise SaaS solutions for the Algerian and North African markets.</p>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">We are a team of 80 engineers, designers, and business operators working remotely across 12 wilayas.</p>
          <div className="grid grid-cols-3 gap-3">
            {[{ n: "80+", l: "Employees" }, { n: "40K", l: "Platform users" }, { n: "12", l: "Wilayas" }].map((s) => (
              <div key={s.l} className="bg-cream rounded-xl p-4 text-center">
                <p className="font-serif text-xl">{s.n}</p>
                <p className="text-xs text-gray-400 mt-1">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="w-64 bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-semibold mb-4 text-sm">Company Details</h2>
          {[
            { l: "Sector", v: "Technology / SaaS" },
            { l: "Size", v: "50–200" },
            { l: "Founded", v: "2019" },
            { l: "HQ", v: "Alger, Hydra" },
            { l: "RC No.", v: "16/00-123456B07" },
            { l: "Website", v: "techcorp.dz ↗", red: true },
          ].map((r) => (
            <div key={r.l} className="flex justify-between py-2 border-b border-gray-100 last:border-0 text-sm">
              <span className="text-gray-400">{r.l}</span>
              <span className={r.red ? "text-red font-medium" : "font-medium"}>{r.v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}