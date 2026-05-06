export default function Loading() {
  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "linear-gradient(135deg, #0d1117 0%, #111520 50%, #0a0e16 100%)",
      }}
    >
      <div className="flex flex-col items-center gap-3">
        <div
          className="w-8 h-8 border-2 border-white/15 border-t-white/60 rounded-full animate-spin"
          aria-hidden="true"
        />
        <span className="text-sm text-white/55">Loading…</span>
      </div>
    </div>
  );
}
