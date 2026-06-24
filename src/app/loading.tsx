export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#06B6D4] animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-b-[#EAB308] animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-sm text-white/50 animate-pulse">Loading Saatvik Cars...</p>
      </div>
    </div>
  );
}
