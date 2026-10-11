import { X } from "lucide-react";

export const ChoiceAnswer = ({ options, selected, onSelect, disabled, mono = true, testid = "option" }) => (
  <div role="radiogroup" aria-label="Answer options" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
    {options.map((o, i) => {
      const on = selected === i;
      return (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={on}
          disabled={disabled}
          onClick={() => onSelect(i)}
          data-testid={`${testid}-${i}`}
          className={`rq-answer-option min-h-[60px] rounded-2xl border-2 px-4 py-3 font-bold text-left sm:text-center transition-colors duration-150 ${mono ? "ratio-mono text-2xl" : "text-base whitespace-normal"} ${
            on ? "rq-answer-selected border-teal-600 bg-teal-50 text-teal-900 ring-2 ring-teal-600" : "border-slate-200 bg-white text-slate-900 hover:border-teal-400"
          } disabled:opacity-70`}
        >
          {on && <span className="sr-only">Selected: </span>}
          {o}
        </button>
      );
    })}
  </div>
);

export const RatioInput = ({ value, onChange, error, disabled, onEnter }) => (
  <div className="space-y-2">
    <label htmlFor="ratio-input" className="font-semibold text-slate-800">
      Type your ratio (for example 2 : 3)
    </label>
    <input
      id="ratio-input"
      type="text"
      inputMode="text"
      autoComplete="off"
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => e.key === "Enter" && onEnter()}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? "ratio-input-error" : undefined}
      className="ratio-mono text-3xl w-full max-w-xs rounded-2xl border-2 border-slate-300 px-4 py-3 focus:border-teal-600 bg-white"
      placeholder="_ : _"
      data-testid="ratio-input"
    />
    {error && (
      <p id="ratio-input-error" className="text-orange-800 font-semibold" role="alert" data-testid="ratio-input-error">
        {error}
      </p>
    )}
  </div>
);

const Slot = ({ value, label, onClear, error, active, testid }) => (
  <button
    type="button"
    onClick={onClear}
    data-testid={testid}
    aria-label={`${label}: ${value === null ? "empty" : value}${value === null ? "" : ". Tap to clear"}`}
    className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-[3px] flex flex-col items-center justify-center ${
      error ? "border-orange-500 bg-orange-50" : active ? "border-teal-600 bg-teal-50" : "border-dashed border-slate-400 bg-white"
    }`}
  >
    <span className="ratio-mono text-4xl font-bold text-slate-900">{value === null ? "?" : value}</span>
    <span className="text-[11px] font-semibold text-slate-600 px-1 leading-tight">{label}</span>
    {value !== null && <X size={14} className="absolute top-1 right-1 text-slate-500" aria-hidden="true" />}
    {error && <span className="absolute -bottom-6 text-xs font-bold text-orange-800 whitespace-nowrap">Check this one</span>}
  </button>
);

export const BuildAnswer = ({ slots, setSlots, max, cards, slotErrors = [false, false], disabled }) => {
  const active = slots[0] === null ? 0 : slots[1] === null ? 1 : -1;
  const put = (n) => {
    if (disabled || active < 0) return;
    const next = [...slots];
    next[active] = n;
    setSlots(next);
  };
  const clear = (i) => {
    if (disabled) return;
    const next = [...slots];
    next[i] = null;
    setSlots(next);
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 sm:gap-5 pb-4" data-testid="build-slots">
        <Slot value={slots[0]} label="First quantity" onClear={() => clear(0)} error={slotErrors[0]} active={active === 0} testid="slot-first" />
        <span className="ratio-mono text-5xl font-bold text-slate-900" aria-hidden="true">:</span>
        <Slot value={slots[1]} label="Second quantity" onClear={() => clear(1)} error={slotErrors[1]} active={active === 1} testid="slot-second" />
      </div>
      {cards ? (
        <div className="flex flex-wrap gap-2" aria-label="Count cards">
          {cards.map((c) => (
            <button key={c.label} type="button" disabled={disabled || active < 0} onClick={() => put(c.value)} data-testid={`card-${c.id}`} className="rq-btn-secondary !min-h-[56px] flex-col !gap-0">
              <span className="ratio-mono text-2xl font-bold">{c.value}</span>
              <span className="text-xs">{c.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2 max-w-xl" aria-label="Number buttons">
          {Array.from({ length: max + 1 }).map((_, n) => (
            <button key={n} type="button" disabled={disabled || active < 0} onClick={() => put(n)} data-testid={`num-${n}`} className="ratio-mono min-h-[48px] rounded-xl border-2 border-slate-200 bg-white text-xl font-bold hover:border-teal-500 disabled:opacity-40">
              {n}
            </button>
          ))}
        </div>
      )}
      <p className="text-sm text-slate-600">Tap a number to fill the next box. Tap a box to clear it.</p>
    </div>
  );
};
