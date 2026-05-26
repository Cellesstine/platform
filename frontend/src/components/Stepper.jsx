export default function Stepper({ steps, current, variant = "red" }) {
  const isNavy = variant === "navy";
  const doneBg = isNavy ? "bg-navy border-navy" : "bg-red border-red";
  const activeBorder = isNavy ? "border-navy text-navy" : "border-red text-red";
  const lineDone = isNavy ? "bg-navy" : "bg-red";
  const labelActive = isNavy ? "text-navy font-medium" : "text-red font-medium";

  return (
    <div className="flex items-center justify-center mb-10 flex-wrap gap-y-2">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = num < current;
        const active = num === current;

        return (
          <div key={label} className="flex items-center">
            {i > 0 && <div className={`w-12 md:w-20 h-px mx-1 ${done ? lineDone : "bg-ivory-deep"}`} />}

            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border transition-all
                  ${done ? `${doneBg} text-white` : ""}
                  ${active ? `${activeBorder} font-semibold bg-white` : ""}
                  ${!done && !active ? "border-ivory-deep text-gray-400 bg-white" : ""}
                `}
              >
                {done ? "✓" : num}
              </div>
              <span className={`text-xs hidden sm:block ${active ? labelActive : "text-gray-500"}`}>
                {label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
