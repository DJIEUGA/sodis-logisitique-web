import { motion } from "framer-motion";

import { getSubmissionTarget } from "@/features/order-preparation/api/submit-order";
import { Header } from "@/features/order-preparation/components/Header";
import { OrderForm } from "@/features/order-preparation/components/OrderForm";

export default function OrderPreparationPage() {
  const submissionTarget = getSubmissionTarget();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="mx-auto w-full max-w-4xl space-y-5 px-4 py-5 md:px-4 md:py-6"
    >
      <Header submissionTarget={submissionTarget} />
      <OrderForm />
    </motion.div>
  );
}
