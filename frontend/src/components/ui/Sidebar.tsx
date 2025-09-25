export default function Sidebar() {
    const items = [
      { id:"intro",  label:"📋 ملخص" },
      { id:"habits", label:"🧩 العادات" },
      { id:"entries",label:"📝 الإدخالات" },
      { id:"reports",label:"📊 التقارير" },
    ];
    return (
      <aside className="hidden lg:block sticky top-20 h-[calc(100vh-80px)] pe-4">
        <nav className="rounded-2xl border border-[var(--line)] bg-[var(--bg-1)] p-3 shadow-soft">
          <ul className="space-y-1">
            {items.map(it => (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className="menu-card block"
                >
                  {it.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    );
  }
  