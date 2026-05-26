import { useState } from "react";
import Navbar from "../../components/Navbar";

const steps = {
  professionals: [
    { n: "1", title: "Create your account", desc: "Sign up with your email or Google account. Choose your role as a professional to get started." },
    { n: "2", title: "Build your profile", desc: "Add your skills, experience, wilaya, and upload your CV. The more complete your profile, the better your visibility." },
    { n: "3", title: "Get verified", desc: "Our admin team reviews your profile and documents within 24–48 hours. Once verified, you can apply to jobs." },
    { n: "4", title: "Apply & connect", desc: "Browse announcements from across all 58 wilayas, apply directly, or receive offers from companies who find you." },
  ],
  businesses: [
    { n: "1", title: "Create your business", desc: "Register your company with your official documents. Our team verifies your enterprise profile." },
    { n: "2", title: "Post job openings", desc: "Create detailed job announcements targeting specific wilayas, skills, and experience levels." },
    { n: "3", title: "Browse talent", desc: "Search our verified pool of professionals by skill, wilaya, and availability." },
    { n: "4", title: "Hire with confidence", desc: "Review verified profiles, contact directly, and build your team with full transparency." },
  ],
};

export default function HowItWorksPage() {
  const [tab, setTab] = useState("professionals");

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <div className="flex flex-col items-center px-6 pt-20 pb-16 text-center">
        <p className="linkio-eyebrow mb-4 justify-center">Simple. Transparent. Algerian.</p>
        <h1 className="font-serif text-5xl font-normal text-navy-deep mb-5">
          How <em className="text-red not-italic">Linkio</em>
          <br />
          works for you
        </h1>
        <p className="text-sm text-gray-500 max-w-md leading-relaxed mb-10">
          Whether you're a professional seeking your next opportunity or a
          business finding verified talent — the process is designed to be fast
          and trustworthy.
        </p>

        {/* Toggle */}
        <div className="flex bg-white rounded-linkio p-1 border border-navy/10 mb-16 shadow-sm">
          {["professionals", "businesses"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-6 py-2 rounded-linkio text-sm transition-all ${
                tab === t
                  ? t === "businesses"
                    ? "bg-red text-white"
                    : "bg-navy text-white"
                  : "text-gray-500 hover:text-navy"
              }`}
            >
              {t === "professionals" ? "For Professionals" : "For Businesses"}
            </button>
          ))}
        </div>

        {/* Steps */}
        <div className="grid grid-cols-4 gap-8 max-w-4xl w-full">
          {steps[tab].map((s) => (
            <div key={s.n} className="flex flex-col items-center">
              <div className="w-11 h-11 rounded-full border border-gray-200 bg-white flex items-center justify-center text-sm mb-4">
                {s.n}
              </div>
              <h3 className="text-sm font-semibold mb-2">{s.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <p className="text-center text-xs text-gray-300 pb-8">© 2026 Linkio. All rights reserved.</p>
    </div>
  );
}