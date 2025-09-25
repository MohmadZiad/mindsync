"use client";
import dynamic from "next/dynamic";

const DashboardMain = dynamic(() => import("@/components/DashboardMain"), {
  ssr: false,
});

export default function ClientDashboard() {
  return <DashboardMain />;
}
