"use client";
import * as React from "react";

type Loader = () => Promise<any>;

export interface MountAddonProps {
  loader: Loader;
  exportName?: string;
  props?: Record<string, any>;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
  className?: string;
}

export default function MountAddon({
  loader,
  exportName,
  props,
  fallback = (
    <div className="rounded-xl bg-[var(--bg-1)] p-3 border border-[var(--line)] animate-pulse h-24" />
  ),
  errorFallback = null,
  className,
}: MountAddonProps) {
  const [Comp, setComp] = React.useState<React.ComponentType<any> | null>(null);
  const [err, setErr] = React.useState<unknown | null>(null);

  React.useEffect(() => {
    let alive = true;
    loader()
      .then((m) => {
        const C: any = exportName ? m?.[exportName] : m?.default ?? m;
        if (alive) setComp(() => C ?? null);
      })
      .catch((e) => {
        console.error("Addon load error:", e);
        if (alive) setErr(e);
      });
    return () => {
      alive = false;
    };
  }, [loader, exportName]);

  if (err) return <>{errorFallback}</>;
  if (!Comp) return <>{fallback}</>;

  try {
    return <Comp {...(props || {})} className={className} />;
  } catch (e) {
    console.error("Addon render error:", e);
    return <>{errorFallback}</>;
  }
}
