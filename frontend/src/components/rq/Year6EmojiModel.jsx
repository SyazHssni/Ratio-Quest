import { ObjectBoard } from "./ObjectBoard";
import { ObjectToken, TONES } from "./ObjectToken";

const compactGroup = (group) => {
  const tone = TONES[group.tone] || TONES.blue;
  return <section key={group.key} className={`rounded-2xl border-2 ${tone.border} ${tone.bg} p-3`} aria-label={`${group.count} ${group.plural}`}>
    <h3 className={`font-bold ${tone.text}`}>{group.plural}: {group.count}</h3>
    <div className="flex flex-wrap items-center gap-1 min-h-10" aria-label={`${group.count} ${group.plural} shown in equal icon groups`}>
      {Array.from({ length: Math.ceil(group.count / 10) }, (_, i) => {
        const count = Math.min(10, group.count - i * 10);
        return <span key={i} className="inline-flex items-center rounded-xl bg-slate-50 px-2 py-1"><ObjectToken item={group} size={28} /><span className="font-semibold">× {count}</span></span>;
      })}
    </div>
  </section>;
};

export function Year6EmojiModel({ first, second, wholeWord = "items", title, operation }) {
  const groups = [first, second];
  const compact = groups.some((g) => g.count > 20);
  return <section className="rq-card p-4 sm:p-5 space-y-3" aria-label={title || "Emoji quantity model"}>
    {title && <h3 className="font-heading text-lg font-bold">{title}</h3>}
    {compact ? <div className="grid sm:grid-cols-2 gap-3">{groups.map(compactGroup)}</div> : <ObjectBoard groups={groups} wholeWord={wholeWord} highlight={{ order: groups.map((g) => g.key) }} />}
    <p className="font-mono font-bold text-lg" aria-live="polite">{first.count} {first.emoji} : {second.count} {second.emoji}{operation ? ` · ${operation}` : ""}</p>
  </section>;
}

