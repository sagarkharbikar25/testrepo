import Link from "next/link";
import { SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
          <SearchX className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
        <p className="text-neutral-400 mb-8 text-sm">
          We couldn't find the page you were looking for. It might have been moved or doesn't exist.
        </p>
        <Link
          href="/"
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors w-full sm:w-auto"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
