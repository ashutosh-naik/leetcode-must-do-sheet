"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  createdAt: number;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const DURATION = 3500;

function ToastItem({ t, onDismiss }: { t: Toast; onDismiss: (id: number) => void }) {
  return (
    <div
      className={`pointer-events-auto flex flex-col overflow-hidden rounded-xl border shadow-xl text-sm font-medium animate-in slide-in-from-right-2 duration-300 ease-out ${
        t.type === "success"
          ? "border-green-500/20 bg-card text-foreground dark:border-green-500/25"
          : "border-red-500/20 bg-card text-foreground dark:border-red-500/25"
      }`}
    >
      <div className="flex items-center gap-2.5 px-4 py-3">
        {t.type === "success" ? (
          <CheckCircle className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
        ) : (
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
        )}
        <span className="flex-1">{t.message}</span>
        <button
          onClick={() => onDismiss(t.id)}
          className="cursor-pointer border-none bg-transparent p-0 opacity-40 hover:opacity-80 transition-opacity shrink-0 text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="h-0.5 w-full bg-muted-foreground/10">
        <div
          className="h-full rounded-full animate-shrink-width origin-right"
          style={{
            backgroundColor: t.type === "success" ? "rgb(34 197 94)" : "rgb(239 68 68)",
            animationDuration: `${DURATION}ms`,
          }}
        />
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, type: ToastType = "success") => {
      const id = nextId.current++;
      const createdAt = Date.now();
      setToasts((prev) => [...prev, { id, message, type, createdAt }]);
      const timer = setTimeout(() => dismiss(id), DURATION);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  // Cleanup all timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      for (const timer of timers.values()) {
        clearTimeout(timer);
      }
      timers.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 left-4 sm:left-auto z-[200] flex flex-col gap-2 pointer-events-none max-w-[360px] w-auto sm:w-full" aria-live="polite" role="status">
        {toasts.map((t) => (
          <ToastItem key={t.id} t={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
