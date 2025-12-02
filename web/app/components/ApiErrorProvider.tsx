"use client";
import { useEffect, useState } from 'react';
import ErrorBanner from './ErrorBanner';

export default function ApiErrorProvider({ children }: { children: React.ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const handler = (ev: Event) => {
      try {
        const ce = ev as CustomEvent<any>;
        const d = ce?.detail || {};
        const m = d?.message || d?.error || d?.errorMessage || 'API unreachable';
        setMessage(m);
      } catch (e) {
        setMessage('API unreachable');
      }
    };

    window.addEventListener('apiError', handler as EventListener);
    return () => window.removeEventListener('apiError', handler as EventListener);
  }, []);

  const clear = () => setMessage(null);

  return (
    <>
      {message && (
        <div className="sticky top-0 z-50">
          <ErrorBanner message={message} />
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="flex justify-end -mt-3 mb-2">
              <button
                onClick={() => { clear(); window.location.reload(); }}
                className="rounded bg-accent-500 px-3 py-1 text-white text-sm hover:bg-accent-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
