"use client";
import React from "react";
import EmojiPickerButton from "./EmojiPickerButton";

export type Extra = {
  frequency?: "daily" | "weekly";
  description?: string;
  icon?: string | null; // ⬅️ جديد
};

export default function HabitFormExtra({
  value,
  onChange,
}: {
  value: Extra;
  onChange: (v: Extra) => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
      {/* التكرار */}
      <label className="text-sm">
        التكرار
        <select
          className="ml-2 px-2 py-1 border rounded"
          value={value.frequency || "daily"}
          onChange={(e) =>
            onChange({
              ...value,
              frequency: e.target.value as "daily" | "weekly",
            })
          }
        >
          <option value="daily">يومي</option>
          <option value="weekly">أسبوعي</option>
        </select>
      </label>

      {/* الوصف */}
      <label className="text-sm flex-1">
        الوصف
        <input
          className="ml-2 px-2 py-1 border rounded w-full"
          placeholder="اختياري"
          value={value.description || ""}
          onChange={(e) => onChange({ ...value, description: e.target.value })}
        />
      </label>

      {/* الأيقونة (إيموجي) */}
      <div className="text-sm flex items-center gap-2">
        <span className="whitespace-nowrap">الأيقونة</span>

        {/* زر اختيار الإيموجي */}
        <EmojiPickerButton
          value={value.icon ?? null}
          onChange={(emoji) => onChange({ ...value, icon: emoji })}
        />

        {/* معاينة صغيرة */}
        <span className="text-xl">{value.icon ?? "🙂"}</span>

        {/* زر مسح (اختياري) */}
        {value.icon && (
          <button
            type="button"
            className="px-2 py-1 border rounded text-xs"
            onClick={() => onChange({ ...value, icon: null })}
            title="مسح الأيقونة"
          >
            مسح
          </button>
        )}
      </div>
    </div>
  );
}
