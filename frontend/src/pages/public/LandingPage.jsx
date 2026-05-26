import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import LinkioLogo from "../../components/LinkioLogo";
import "./LandingPage.css";

const PROFESSIONAL_FEATURES = [
  "Build a verified skill profile",
  "Apply to jobs or receive client requests",
  "Offer services across all 58 wilayas",
  "Earn reviews and build your reputation",
];

const BUSINESS_FEATURES = [
  "Post job openings and manage applicants",
  "Browse and search verified professionals",
  "Commission freelancers for specific projects",
  "Build a verified enterprise profile",
];

const STEPS = [
  {
    title: "Create your profile",
    desc: "Sign up and build a complete, verified profile showcasing your skills, location, and experience. Our verification process ensures trust for all parties.",
  },
  {
    title: "Connect with the right match",
    desc: "Professionals discover job listings and client requests. Businesses browse verified talent across every field. Smart matching brings the right people together.",
  },
  {
    title: "Grow your reputation",
    desc: "Complete work, collect reviews, and build a professional record that opens more doors. Every successful engagement strengthens your standing on the network.",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reveals = root.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );

    reveals.forEach((el) => obs.observe(el));

    const heroReveals = root.querySelectorAll(".hero .reveal");
    const timeouts = [];
    heroReveals.forEach((el, i) => {
      timeouts.push(
        setTimeout(() => el.classList.add("visible"), i * 130 + 80)
      );
    });

    return () => {
      obs.disconnect();
      timeouts.forEach(clearTimeout);
    };
  }, []);

  const scrollToJoin = (e) => {
    e.preventDefault();
    document.getElementById("join")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="linkio-landing" ref={rootRef}>
      <nav>
        <Link to="/" className="nav-logo">
          <LinkioLogo />
          <span className="nav-wordmark">Linkio</span>
        </Link>

        <ul className="nav-links">
          <li>
            <a href="#how">How it works</a>
          </li>
          <li>
            <a href="#join">For Professionals</a>
          </li>
          <li>
            <a href="#join">For Businesses</a>
          </li>
        </ul>

        <div className="nav-cta">
          <Link to="/sign-in" className="btn-ghost">
            Sign in
          </Link>
          <a href="#join" className="btn-primary" onClick={scrollToJoin}>
            Get started
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow reveal">
            <div className="eyebrow-line" />
            <span className="eyebrow-text">Algeria&apos;s Professional Network</span>
            <div className="eyebrow-line" />
          </div>

          <h1 className="hero-h1 reveal reveal-delay-1">
            Where Algerian talent
            <br />
            meets <em>opportunity</em>
          </h1>

          <p className="hero-sub reveal reveal-delay-2">
            Linkio connects skilled professionals with businesses across all 58 wilayas —
            verified, transparent, and built for Algeria&apos;s future.
          </p>

          <div className="hero-actions reveal reveal-delay-3">
            <button
              type="button"
              className="btn-hero-primary"
              onClick={() => navigate("/professional/onboarding/account")}
            >
              Start as a Professional
            </button>
            <button
              type="button"
              className="btn-hero-outline"
              onClick={() => navigate("/register")}
            >
              Register your Business
            </button>
          </div>

          <div className="hero-trust reveal reveal-delay-4">
            <div className="trust-item">
              <div className="trust-dot" />
              58 Wilayas covered
            </div>
            <div className="trust-item">
              <div className="trust-dot" />
              Verified profiles only
            </div>
            <div className="trust-item">
              <div className="trust-dot" />
              Free to join
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="join">
        <div className="section-eyebrow">
          <span>Join the network</span>
        </div>
        <h2 className="section-title">
          Choose your <em>path</em>
        </h2>

        <div className="paths-grid">
          <div
            role="link"
            tabIndex={0}
            className="path-card reveal"
            onClick={() => navigate("/professional/onboarding/account")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/professional/onboarding/account");
              }
            }}
          >
            <div className="path-icon navy">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1B3A5C"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M6 20v-2a6 6 0 0 1 12 0v2" />
              </svg>
            </div>
            <div className="path-type navy">Professional</div>
            <h3 className="path-heading">
              I am a <em>Professional</em>
            </h3>
            <p className="path-desc">
              A skilled individual ready to build a verified presence, attract opportunities, and
              grow a professional reputation across Algeria.
            </p>
            <ul className="path-features">
              {PROFESSIONAL_FEATURES.map((text) => (
                <li key={text}>
                  <div className="feature-dot navy" />
                  {text}
                </li>
              ))}
            </ul>
            <span className="path-cta navy">
              Continue as Professional <span className="cta-arrow">→</span>
            </span>
          </div>

          <div
            role="link"
            tabIndex={0}
            className="path-card crimson reveal reveal-delay-2"
            onClick={() => navigate("/register")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/register");
              }
            }}
          >
            <div className="path-icon crimson">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7F1D1D"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
              </svg>
            </div>
            <div className="path-type crimson">Business</div>
            <h3 className="path-heading">
              I represent a <em>Business</em>
            </h3>
            <p className="path-desc">
              An organization looking to hire employees, discover freelance talent, and build a
              trusted presence on Algeria&apos;s professional network.
            </p>
            <ul className="path-features">
              {BUSINESS_FEATURES.map((text) => (
                <li key={text}>
                  <div className="feature-dot crimson" />
                  {text}
                </li>
              ))}
            </ul>
            <span className="path-cta crimson">
              Continue as Business <span className="cta-arrow">→</span>
            </span>
          </div>
        </div>
      </section>

      <div className="section-divider" />

      <section className="section" id="how">
        <div className="section-eyebrow">
          <span>The process</span>
        </div>
        <h2 className="section-title">
          Simple steps to <em>success</em>
        </h2>

        <div className="steps-grid">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className={`step reveal${i > 0 ? ` reveal-delay-${Math.min(i + 1, 4)}` : ""}`}
            >
              {i < STEPS.length - 1 && <div className="step-connector" />}
              <div className="step-title">{step.title}</div>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="signin-strip">
        Already have an account?{" "}
        <Link to="/sign-in">Sign in to your workspace →</Link>
      </div>

      <footer>
        <Link to="/" className="footer-brand">
          <LinkioLogo width={32} height={20} />
          <span className="footer-wordmark">Linkio</span>
        </Link>

        <ul className="footer-links">
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <a href="/about">Privacy</a>
          </li>
          <li>
            <a href="/about">Terms</a>
          </li>
          <li>
            <a href="/about">Contact</a>
          </li>
        </ul>

        <p className="footer-copy">© 2026 Linkio. All rights reserved.</p>
      </footer>
    </div>
  );
}
