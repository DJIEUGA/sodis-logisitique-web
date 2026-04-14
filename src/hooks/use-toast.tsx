import * as React from "react";

import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

type ToastRecord = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ToastContextType = {
  toasts: ToastRecord[];
  toast: (toast: Omit<ToastRecord, "id">) => void;
  dismiss: (id: string) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastControllerProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastRecord[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const toast = React.useCallback((newToast: Omit<ToastRecord, "id">) => {
    const id = crypto.randomUUID();
    setToasts((current) => [{ ...newToast, id, open: true }, ...current].slice(0, 4));
  }, []);

  return <ToastContext.Provider value={{ toasts, toast, dismiss }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const context = React.useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within ToastControllerProvider");
  }

  return context;
}
