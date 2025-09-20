"use client";

import { useDuoTheme } from "./ThemeProvider";
import { BGSerene, BGNeo } from "./backgrounds";

export default function ThemePicker({ onClose }: { onClose: () => void }) {
  const { setTheme } = useDuoTheme();

  return (
    <div className="fixed inset-0 z-[80] bg-black/30 backdrop-blur-sm p-6 flex items-center justify-center">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 p-6">
        <h3 className="text-xl font-semibold">اختر الجو العام لصفحة الدخول</h3>
        <p className="text-sm text-gray-500 mb-5">
          كل خيار يغير الخلفية + الألوان + الظلال وطريقة التفاعل.
        </p>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* Serene */}
          <button
            onClick={() => { setTheme("serene"); onClose(); }}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-black/10 text-left"
          >
            <div className="absolute inset-0"><BGSerene/></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/10" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="rounded-lg bg-white/85 p-3 shadow">
                <div className="font-semibold">Serene Aurora</div>
                <p className="text-sm text-gray-600 mt-1">
                  أبيض/بنفسجي هادئ، هالة تتبع الماوس، ضباب لطيف. مناسب لمنتجات هادئة و-wellness.
                </p>
              </div>
            </div>
          </button>

          {/* Neo */}
          <button
            onClick={() => { setTheme("neo"); onClose(); }}
            className="group relative aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-black/10 text-left"
          >
            <div className="absolute inset-0"><BGNeo/></div>
            <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-white/10" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="rounded-lg bg-white/85 p-3 shadow">
                <div className="font-semibold">Neon Play</div>
                <p className="text-sm text-gray-600 mt-1">
                  نيون/ليزر حيوي، خطوط تفاعلية وألوان جريئة. يعطي شعور “ديزني لاند” بدون إزعاج.
                </p>
              </div>
            </div>
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button onClick={onClose}
                  className="rounded-lg bg-gray-100 hover:bg-gray-200 px-4 py-2 text-sm font-medium">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
