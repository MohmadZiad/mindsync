export default function AIInsightsCard({
    suggestion,
    reason,
    onAccept,
  }: { suggestion:string; reason:string; onAccept:()=>void }) {
    return (
      <div className="rounded-2xl border border-[var(--line)] p-4 bg-[var(--bg-2)]">
        <div className="text-sm opacity-75 mb-2">🤖 اقتراح عادة جديدة</div>
        <div className="font-semibold mb-1">{suggestion}</div>
        <div className="text-sm opacity-75 mb-3">{reason}</div>
        <button className="btn-primary" onClick={onAccept}>أضف الآن</button>
      </div>
    );
  }
  