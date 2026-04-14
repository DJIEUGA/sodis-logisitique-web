import { Suspense, lazy } from "react";

const OrderPreparationPage = lazy(() => import("@/features/order-preparation"));

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-10 md:px-6">
          <div className="h-10 w-72 animate-pulse rounded-xl bg-[--surface-3]" />
          <div className="h-80 animate-pulse rounded-2xl bg-[--surface-3]" />
        </div>
      }
    >
      <OrderPreparationPage />
    </Suspense>
  );
}
