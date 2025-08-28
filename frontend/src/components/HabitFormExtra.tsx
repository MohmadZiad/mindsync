"use client";
import React from "react";

type Extra = {
  frequency?: "daily" | "weekly";
  description?: string;
};

export default function HabitFormExtra({
  value,
  onChange,
}: {
  value: Extra;
  onChange: (v: Extra) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <label className="text-sm">
        التكرار
        <select
          className="ml-2 px-2 py-1 border rounded"
          value={value.frequency || "daily"}
          onChange={(e) =>
            onChange({ ...value, frequency: e.target.value as "daily" | "weekly" })
          }
        >
          <option value="daily">يومي</option>
          <option value="weekly">أسبوعي</option>
        </select>
      </label>

      <label className="text-sm flex-1">
        الوصف
        <input
          className="ml-2 px-2 py-1 border rounded w-full"
          placeholder="اختياري"
          value={value.description || ""}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </label>
    </div>
  );
}
