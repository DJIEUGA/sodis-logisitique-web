import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "@/App";
import { Toaster } from "@/components/ui/toaster";
import { ToastControllerProvider } from "@/hooks/use-toast";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastControllerProvider>
      <App />
      <Toaster />
    </ToastControllerProvider>
  </StrictMode>,
);
