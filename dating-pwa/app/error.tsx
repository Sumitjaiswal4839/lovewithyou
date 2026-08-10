'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // You can send this to an error tracking service like Sentry
    console.error("App crashed:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-white p-4">
      <h2 className="text-2xl font-bold text-red-500 mb-4">Oops! Something went wrong.</h2>
      <p className="text-zinc-400 mb-8 text-center max-w-md">
        A technical error occurred. Our team has been notified.
      </p>
      <button
        onClick={() => reset()}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-full font-semibold transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
