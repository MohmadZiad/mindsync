"use client";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";

export default function MiniWeekSparkline({ points }: { points: number[] }) {
  const data = points.map((count, i) => ({ d: i + 1, count }));
  return (
    <div className="h-[80px]">
      <ResponsiveContainer>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
          <XAxis dataKey="d" hide />
          <YAxis hide />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="count"
            dot={false}
            stroke="#6D5EF1"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
