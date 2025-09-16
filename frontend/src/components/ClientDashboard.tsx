"use client";

import dynamic from "next/dynamic";

const DashboardMain = dynamic(() => import("@/components/DashboardMain"), {
  ssr: false,
  loading: () => (
    <main className="min-h-[60vh] grid place-items-center text-sm text-gray-500">
      Loading dashboard…
    </main>
  ),
});

export default function ClientDashboard() {
  return <DashboardMain />;
}
