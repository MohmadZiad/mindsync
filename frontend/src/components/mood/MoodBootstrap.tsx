"use client";

/**
 * Injects a tiny inline script that:
 * - Reads saved mood from localStorage
 * - Applies `moodify-all` + `mood-*` to <body> *before* hydration
 * This avoids color flashes on route changes and first paint.
 */
export default function MoodBootstrap() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  try {
    var key = 'mindsync:mood';
    var list = ['mood-calm','mood-focus','mood-energy','mood-soft'];
    function apply() {
      var b = document.body;
      if (!b) return;
      var m = localStorage.getItem(key) || 'calm';
      b.classList.add('moodify-all');
      for (var i=0; i<list.length; i++) b.classList.remove(list[i]);
      b.classList.add('mood-' + m);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', apply, { once: true });
    } else {
      apply();
    }
  } catch (e) {}
})();`.trim(),
      }}
    />
  );
}
