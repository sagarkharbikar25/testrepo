// Auth route group layout — Calm Mode (no clip-paths, no grids, no glows)
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/40 px-4">
      {children}
    </div>
  );
}
