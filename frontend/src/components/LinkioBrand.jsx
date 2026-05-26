import { Link } from "react-router-dom";
import LinkioLogo from "./LinkioLogo";

export default function LinkioBrand({
  to = "/",
  className = "",
  logoWidth = 38,
  logoHeight = 22,
  wordmarkClassName = "font-serif text-lg font-semibold text-navy tracking-tight",
}) {
  const inner = (
    <>
      <LinkioLogo width={logoWidth} height={logoHeight} />
      <span className={wordmarkClassName}>Linkio</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className={`flex items-center gap-2.5 no-underline ${className}`}>
        {inner}
      </Link>
    );
  }

  return <div className={`flex items-center gap-2.5 ${className}`}>{inner}</div>;
}
