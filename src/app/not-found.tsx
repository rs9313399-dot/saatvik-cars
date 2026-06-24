'use client';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#06B6D4]/20 bg-[#06B6D4]/10">
          <span className="text-4xl font-extrabold bg-gradient-to-r from-[#06B6D4] to-[#EAB308] bg-clip-text text-transparent">404</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Page Not Found</h2>
        <p className="text-sm text-white/50 mb-6">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-[#06B6D4] px-6 py-3 text-sm font-semibold text-[#0a0f1a] transition-all hover:bg-[#22D3EE]"
        >
          Go Home
        </a>
      </div>
    </div>
  );
}
