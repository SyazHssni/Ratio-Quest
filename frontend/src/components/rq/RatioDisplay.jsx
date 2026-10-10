export const RatioDisplay = ({ firstLabel, secondLabel, value, size = "lg", testid = "ratio-display" }) => {
  if (!value) {
    return (
      <div className="rounded-2xl bg-slate-100 p-4 text-slate-700 font-semibold" data-testid={testid} aria-live="polite">
        Add some objects to make a ratio.
      </div>
    );
  }
  const num = size === "lg" ? "text-4xl sm:text-5xl" : "text-2xl sm:text-3xl";
  return (
    <div className="rounded-2xl bg-white border-2 border-teal-200 px-4 py-3 inline-flex flex-col items-start" data-testid={testid} aria-live="polite" aria-label={`${firstLabel} to ${secondLabel} is ${value[0]} to ${value[1]}`}>
      <div className="flex items-end gap-3 sm:gap-5">
        <div className="flex flex-col items-center">
          <span className={`ratio-mono font-bold text-teal-800 ${num}`} data-testid={`${testid}-first`}>{value[0]}</span>
          <span className="text-xs sm:text-sm font-semibold text-slate-600 max-w-[110px] text-center">{firstLabel}</span>
        </div>
        <span className={`ratio-mono font-bold text-slate-900 ${num} pb-5`}>:</span>
        <div className="flex flex-col items-center">
          <span className={`ratio-mono font-bold text-teal-800 ${num}`} data-testid={`${testid}-second`}>{value[1]}</span>
          <span className="text-xs sm:text-sm font-semibold text-slate-600 max-w-[110px] text-center">{secondLabel}</span>
        </div>
      </div>
    </div>
  );
};

export const StepProgress = ({ step, total, testid = "step-progress" }) => (
  <div className="flex items-center gap-3" data-testid={testid}>
    <span className="text-sm font-bold text-slate-700">Step {step} of {total}</span>
    <div className="flex gap-1" aria-hidden="true">
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} className={`h-2 w-5 rounded-full ${i < step ? "bg-teal-600" : "bg-slate-200"}`} />
      ))}
    </div>
  </div>
);
