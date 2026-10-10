export const RafiAvatar = ({ size = 72, mood = "happy" }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label="Rafi the explorer" className="shrink-0">
    <circle cx="50" cy="56" r="34" fill="#FDE68A" stroke="#0F172A" strokeWidth="3" />
    <path d="M14 40 Q50 8 86 40 Z" fill="#0D9488" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
    <rect x="8" y="38" width="84" height="8" rx="4" fill="#115E59" stroke="#0F172A" strokeWidth="3" />
    <circle cx="50" cy="26" r="5" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
    <circle cx="38" cy="58" r="4" fill="#0F172A" />
    <circle cx="62" cy="58" r="4" fill="#0F172A" />
    {mood === "thinking" ? (
      <path d="M40 74 Q50 70 60 74" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
    ) : (
      <path d="M38 70 Q50 82 62 70" stroke="#0F172A" strokeWidth="3" fill="none" strokeLinecap="round" />
    )}
    <circle cx="28" cy="68" r="4" fill="#FCA5A5" opacity="0.8" />
    <circle cx="72" cy="68" r="4" fill="#FCA5A5" opacity="0.8" />
  </svg>
);

export const RafiSays = ({ children, mood, testid = "rafi-says" }) => (
  <div className="flex items-start gap-3" data-testid={testid}>
    <RafiAvatar size={60} mood={mood} />
    <div className="relative bg-white border-2 border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 text-slate-800 text-base sm:text-lg leading-relaxed max-w-prose">
      {children}
    </div>
  </div>
);
