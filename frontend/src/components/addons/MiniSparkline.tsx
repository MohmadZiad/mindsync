"use client";
import { LineChart, Line, Tooltip, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from "recharts";

type Point = { date: string; count: number };

export default function MiniSparkline({ data, height=80 }: { data: Point[]; height?: number }) {
  return (
    <div className="h-[80px]" style={{ height }}>
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Tooltip />
          <Line type="monotone" dataKey="count" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
