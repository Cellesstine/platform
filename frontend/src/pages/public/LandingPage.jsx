import { Link, useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#fcfbf9] flex flex-col justify-between items-center py-12 px-6 font-sans">
      {/* Top spacing element to balance the footer link */}
      <div className="h-4" />

      {/* Main Container */}
      <div className="flex flex-col items-center justify-center max-w-4xl w-full flex-grow">
        {/* Creative & elegant italic headline */}
        <h1 className="font-serif text-3xl md:text-5xl text-gray-900 italic font-normal tracking-wide mb-3 text-center select-none">
          when <span className="text-red font-serif italic font-semibold">talents</span> meet <span className="text-navy font-serif italic font-semibold">opportunity</span>
        </h1>
        <p className="text-[10px] text-gray-400 select-none tracking-[0.25em] uppercase mb-12 font-medium">
          choose your path
        </p>

        {/* Dynamic Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-3xl">
          {/* Professional Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate("/professional/onboarding/account")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/professional/onboarding/account");
              }
            }}
            className="group backdrop-blur-md bg-white border border-gray-150 rounded-[28px] p-8 shadow-sm flex flex-col justify-between hover-shadow-navy hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer h-72 text-left"
          >
            <div>
              <div className="w-12 h-12 bg-navy/5 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-navy/10 transition-colors">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1B3A5C"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="8" r="4" />
                  <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl text-navy mb-3 font-normal italic">
                i am professional
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed font-light">
                Position your expertise, showcase validated achievements, and engage with leading enterprises seeking elite talent.
              </p>
            </div>
            <span className="text-xs font-semibold text-navy flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Continue as Professional <span>→</span>
            </span>
          </div>

          {/* Business Card */}
          <div
            role="button"
            tabIndex={0}
            onClick={() => navigate("/register")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/register");
              }
            }}
            className="group backdrop-blur-md bg-white border border-gray-150 rounded-[28px] p-8 shadow-sm flex flex-col justify-between hover-shadow-red hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 cursor-pointer h-72 text-left"
          >
            <div>
              <div className="w-12 h-12 bg-red/5 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-red/10 transition-colors">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7F1D1D"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="7" width="20" height="14" rx="2" />
                  <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                  <line x1="10" y1="14" x2="14" y2="14" />
                </svg>
              </div>
              <h2 className="font-serif text-2xl text-red mb-3 font-normal italic">
                i represent a business
              </h2>
              <p className="text-xs text-gray-500 leading-relaxed font-light">
                Acquire validated talent, optimize team deployment, and partner with elite independent specialists to drive organizational growth.
              </p>
            </div>
            <span className="text-xs font-semibold text-red flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Continue as Business <span>→</span>
            </span>
          </div>
        </div>

        {/* Clean Sign-in link brought closer to cards */}
        <div className="text-xs text-gray-500 select-none tracking-wider mt-12 pb-4">
          Already have an account?{" "}
          <Link to="/sign-in" className="text-navy font-semibold underline hover:text-navy/80 transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
