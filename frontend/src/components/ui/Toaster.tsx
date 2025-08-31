"use client";
import * as React from "react";
type Toast = { id: number; title?: string; message: string; variant?: "default"|"success"|"error" };
const Ctx = React.createContext<{toasts:Toast[]; push:(t:Omit<Toast,"id">)=>void; remove:(id:number)=>void} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const idRef = React.useRef(1);
  const push = React.useCallback((t: Omit<Toast,"id">) => {
    const id = idRef.current++;
    setToasts((prev) => [...prev, { id, ...t }]);
    setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 3500);
  }, []);
  const remove = (id:number)=>setToasts((ts)=>ts.filter(x=>x.id!==id));
  return (
    <Ctx.Provider value={{toasts, push, remove}}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 space-y-2" role="status" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className="card shadow-lg min-w-[220px]">
            {t.title && <div className="font-semibold mb-1">{t.title}</div>}
            <div className="text-sm">{t.message}</div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export function useToast(){
  const ctx = React.useContext(Ctx);
  if(!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
