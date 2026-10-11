import { forwardRef } from "react";
import { CheckCircle2, Lightbulb, ListOrdered } from "lucide-react";

export const FeedbackPanel = forwardRef(({ status, fb, worked, testid = "feedback-panel" }, ref) => {
  if (!fb) return <div role="status" aria-live="polite" className="sr-only" data-testid={`${testid}-empty`} />;
  const good = status === "correct";
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="status"
      aria-live="polite"
      className={`rq-enter ${good ? "rq-feedback-correct" : "rq-feedback-wrong"} rounded-2xl border-2 p-4 sm:p-5 ${good ? "bg-green-50 border-green-400" : "bg-orange-50 border-orange-300"}`}
      data-testid={testid}
    >
      <div className="flex items-start gap-3">
        {good ? <CheckCircle2 className="text-green-700 shrink-0" size={28} aria-hidden="true" /> : <Lightbulb className="text-orange-600 shrink-0" size={28} aria-hidden="true" />}
        <div className="space-y-2">
          <p className="font-heading font-semibold text-lg text-slate-900" data-testid={`${testid}-title`}>
            <span className="sr-only">{good ? "Correct. " : "Not quite. "}</span>
            {fb.title}
          </p>
          <p className="text-slate-800" data-testid={`${testid}-message`}>{fb.message}</p>
          {fb.guide && !good && (
            <p className="font-semibold text-slate-900" data-testid={`${testid}-guide`}>
              Think: {fb.guide}
            </p>
          )}
        </div>
      </div>
      {worked && (
        <div className="mt-4 rounded-xl bg-white border border-slate-200 p-4" data-testid="worked-example">
          <p className="flex items-center gap-2 font-bold text-slate-900 mb-2">
            <ListOrdered size={20} aria-hidden="true" /> Let's work it out together
          </p>
          <ol className="list-decimal pl-6 space-y-1 text-slate-800">
            {worked.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
});
FeedbackPanel.displayName = "FeedbackPanel";
