/** Linkio wordmark + arc logo (navy / crimson) */
export default function LinkioLogo({ width = 38, height = 22, className = "" }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 192 160"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
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
}
