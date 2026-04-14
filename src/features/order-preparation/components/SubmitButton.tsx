import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

type SubmitButtonProps = {
  isSubmitting: boolean;
  onClick: () => void;
};

export function SubmitButton({ isSubmitting, onClick }: SubmitButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        className="w-full min-w-44 bg-slate-900 text-white shadow-sm hover:bg-[--brand-strong] focus-visible:ring-[--brand] sm:w-auto"
        size="lg"
        disabled={isSubmitting}
        onClick={onClick}
      >
        {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {isSubmitting ? "Envoi en cours..." : "Soumettre la commande"}
      </Button>
    </motion.div>
  );
}
