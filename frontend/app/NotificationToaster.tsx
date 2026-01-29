'use client';

import { useApp } from './Providers';

export default function NotificationToaster() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-4 flex flex-col gap-3 z-[100] max-h-[80vh] overflow-y-auto pointer-events-none p-2">
      {toasts.map((n) => (
        <div
          key={n.id}
          className="pointer-events-auto bg-white dark:bg-zinc-900 border border-border shadow-xl rounded-xl p-4 w-80 animate-in slide-in-from-right-5 fade-in duration-300 relative group"
        >
          <div className="flex items-start gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 shrink-0 animate-pulse" />

            <div className="flex-1">
              <div className="text-sm font-semibold mb-1">{n.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{n.message}</div>
            </div>

            <button
              onClick={() => removeToast(n.id)}
              className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
