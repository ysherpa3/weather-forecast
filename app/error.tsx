"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background:
          "linear-gradient(135deg, #0d1117 0%, #111520 50%, #0a0e16 100%)",
      }}
    >
      <div className="text-center space-y-4">
        <p className="text-red-300 text-sm">{error.message}</p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-sm hover:bg-white/15 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
