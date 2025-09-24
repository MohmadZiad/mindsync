"use client";

/**
 * Pre-hydration boot for mood:
 * - Reads saved mood from localStorage
 * - Applies `moodify-all` and `mood-*` on <body> ASAP
 * - Listens to storage / custom events so route changes reflect instantly
 */
export default function MoodBootstrap() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function () {
  try {
    var KEY = 'mindsync:mood';
    var ALL = ['mood-calm','mood-focus','mood-energy','mood-soft'];
    function apply(v) {
      var m = (v || localStorage.getItem(KEY) || 'calm');
      var b = document.body; if (!b) return;
      b.classList.add('moodify-all');
      for (var i=0;i<ALL.length;i++) b.classList.remove(ALL[i]);
      b.classList.add('mood-' + m);
    }
    function onAny(ev) { try { apply(ev && ev.newValue); } catch(e) {} }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function(){ apply(); }, { once:true });
    } else { apply(); }
    // React immediately to changes (same tab + other tabs)
    window.addEventListener('storage', function(e){ if (e && e.key === KEY) onAny(e); });
    window.addEventListener('ms:mood', function(e){ apply(e && e.detail); });
  } catch (e) {}
})();`.trim(),
      }}
    />
  );
}
