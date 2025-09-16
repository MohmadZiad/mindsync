export default function ReminderBanner({ text }: { text: string }) {
    return (
      <div className="rounded-xl p-3 bg-[var(--bg-2)] border border-[var(--line)] text-sm">
        ⏰ {text}
      </div>
    );
  }
  