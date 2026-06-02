import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LandingPage.css";

export default function LandingPage() {
  const navigate = useNavigate();
  const revealRefs = useRef([]);

  useEffect(() => {
    // Intersection observer for scroll-reveal
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.1 }
    );

    revealRefs.current.forEach((el) => {
      if (el) obs.observe(el);
    });

    // Immediately reveal hero elements with stagger
    const heroReveals = document.querySelectorAll(".linkio-landing .hero .reveal");
    heroReveals.forEach((el, i) => {
      setTimeout(() => el.classList.add("visible"), i * 130 + 80);
    });

    return () => obs.disconnect();
  }, []);

  const addReveal = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  const LogoSVG = ({ width = 38, height = 22 }) => (
    <svg
      width={width}
      height={height}
      viewBox="0 0 192 160"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0 80 A64 64 0 0 1 128 80"
        stroke="#1B3A5C"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M64 80 A64 64 0 0 0 192 80"
        stroke="#7F1D1D"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M64 80 A64 64 0 0 1 128 80"
        stroke="#F5F1ED"
        strokeWidth="12"
        fill="none"
      />
      <circle cx="128" cy="80" r="10" fill="#1B3A5C" />
      <circle cx="64" cy="80" r="10" fill="#7F1D1D" />
    </svg>
  );

  return (
    <div className="linkio-landing">
      {/* NAV */}
      <nav>
        <a href="#" className="nav-logo">
          <LogoSVG width={38} height={22} />
          <span className="nav-wordmark">Linkio</span>
        </a>

        <ul className="nav-links">
          <li><a href="#join">Join the network</a></li>
          <li><a href="#how">How it works</a></li>
        </ul>

        <div className="nav-cta">
          <Link to="/sign-in" className="btn-ghost">Sign in</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <div className="hero-eyebrow reveal" ref={addReveal}>
            <div className="eyebrow-line"></div>
            <span className="eyebrow-text">Algeria's Professional Network</span>
            <div className="eyebrow-line"></div>
          </div>

          <h1 className="hero-h1 reveal reveal-delay-1" ref={addReveal}>
            Where Algerian talent<br />meets <em>opportunity</em>
          </h1>

          <p className="hero-sub reveal reveal-delay-2" ref={addReveal}>
            Linkio connects skilled professionals with businesses across all 69 wilayas — verified, transparent, and built for Algeria's future.
          </p>


          <div className="hero-trust reveal reveal-delay-4" ref={addReveal}>
            <div className="trust-item"><div className="trust-dot"></div>69 Wilayas covered</div>
            <div className="trust-item"><div className="trust-dot"></div>Verified profiles only</div>
            <div className="trust-item"><div className="trust-dot"></div>Free to join</div>
          </div>
        </div>
      </section>

      {/* CHOOSE YOUR PATH */}
      <section className="section" id="join">
        <div className="section-eyebrow"><span>Join the network</span></div>
        <h2 className="section-title">Choose your <em>path</em></h2>

        <div className="paths-grid">
          {/* Professional card */}
          <div
            className="path-card reveal"
            ref={addReveal}
            role="button"
            tabIndex={0}
            onClick={() => navigate("/professional/onboarding/account")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/professional/onboarding/account");
              }
            }}
          >
            <div className="path-icon navy">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="17" cy="10" r="5" fill="#1b2d52" opacity="0.85"/>
                <path d="M8 28 C8 21.4 12.0 18 17 18 C22.0 18 26 21.4 26 28" fill="#1b2d52" opacity="0.85"/>
                <path d="M22 26 L26 22 L30 24" stroke="#96192c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="26" cy="22" r="1.4" fill="#96192c"/>
              </svg>
            </div>
            <div className="path-type navy">Professional</div>
            <h3 className="path-heading">I am a <em>Professional</em></h3>
            <p className="path-desc">
              A skilled individual ready to build a verified presence, attract opportunities, and grow a professional reputation across Algeria.
            </p>
            <ul className="path-features">
              <li><div className="feature-dot navy"></div>Build a verified skill profile</li>
              <li><div className="feature-dot navy"></div>Apply to jobs or receive client requests</li>
              <li><div className="feature-dot navy"></div>Offer services across all 69 wilayas</li>
              <li><div className="feature-dot navy"></div>Earn reviews and build your reputation</li>
            </ul>
            <div className="path-cta navy">
              Continue as Professional <span className="cta-arrow">→</span>
            </div>
          </div>

          {/* Business card */}
          <div
            className="path-card crimson reveal reveal-delay-2"
            ref={addReveal}
            role="button"
            tabIndex={0}
            onClick={() => navigate("/register")}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                navigate("/register");
              }
            }}
          >
            <div className="path-icon crimson">
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="6" y="14" width="22" height="16" rx="1.5" fill="#96192c" opacity="0.85"/>
                <path d="M4 14 L17 5 L30 14" fill="#96192c" opacity="0.6" stroke="#96192c" strokeWidth="0.5"/>
                <rect x="13.5" y="21" width="7" height="9" rx="1" fill="#f7f5f1"/>
                <rect x="8" y="17" width="5" height="4" rx="0.8" fill="rgba(247,245,241,0.55)"/>
                <rect x="21" y="17" width="5" height="4" rx="0.8" fill="rgba(247,245,241,0.55)"/>
                <line x1="17" y1="2" x2="17" y2="6" stroke="#96192c" strokeWidth="1.4" strokeLinecap="round"/>
                <path d="M17 2 L22 3.8 L17 5.5Z" fill="#b5902e"/>
              </svg>
            </div>
            <div className="path-type crimson">Business</div>
            <h3 className="path-heading">I represent a <em>Business</em></h3>
            <p className="path-desc">
              An organization looking to hire employees, discover freelance talent, and build a trusted presence on Algeria's professional network.
            </p>
            <ul className="path-features">
              <li><div className="feature-dot crimson"></div>Post job openings and manage applicants</li>
              <li><div className="feature-dot crimson"></div>Browse and search verified professionals</li>
              <li><div className="feature-dot crimson"></div>Commission freelancers for specific projects</li>
              <li><div className="feature-dot crimson"></div>Build a verified enterprise profile</li>
            </ul>
            <div className="path-cta crimson">
              Continue as Business <span className="cta-arrow">→</span>
            </div>
          </div>
        </div>
      </section>

      <div className="section-divider"></div>

      {/* HOW IT WORKS */}
      <section className="section" id="how">
        <div className="section-eyebrow"><span>The process</span></div>
        <h2 className="section-title">Simple steps to <em>success</em></h2>

        <div className="steps-grid">
          <div className="step reveal" ref={addReveal}>
            <div className="step-connector"></div>
            <div className="step-title">Create your profile</div>
            <p className="step-desc">
              Sign up and build a complete, verified profile showcasing your skills, location, and experience. Our verification process ensures trust for all parties.
            </p>
          </div>
          <div className="step reveal reveal-delay-2" ref={addReveal}>
            <div className="step-connector"></div>
            <div className="step-title">Connect with the right match</div>
            <p className="step-desc">
              Professionals discover job listings and client requests. Businesses browse verified talent across every field. Smart matching brings the right people together.
            </p>
          </div>
          <div className="step reveal reveal-delay-3" ref={addReveal}>
            <div className="step-title">Grow your reputation</div>
            <p className="step-desc">
              Complete work, collect reviews, and build a professional record that opens more doors. Every successful engagement strengthens your standing on the network.
            </p>
          </div>
        </div>
      </section>

      {/* SIGN-IN STRIP */}
      <div className="signin-strip">
        Already have an account?{" "}
        <Link to="/sign-in">Sign in to your workspace →</Link>
      </div>

      {/* FOOTER */}
      <footer>
        <a href="#" className="footer-brand">
          <LogoSVG width={32} height={20} />
          <span className="footer-wordmark">Linkio</span>
        </a>

        <p className="footer-copy">© 2026 Linkio. All rights reserved.</p>
      </footer>
    </div>
  );
}
