"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="glass-card max-w-md w-full p-8 rounded-2xl flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-destructive/20 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Something went wrong!</h2>
        <p className="text-neutral-400 mb-8 text-sm">
          We encountered an unexpected error. Don't worry, our team has been notified.
        </p>
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <RefreshCcw className="h-4 w-4" />
          Try again
        </button>
      </div>
    </div>
  );
}
