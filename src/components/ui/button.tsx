import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--brand] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-transparent",
  {
    variants: {
      variant: {
        default: "border-[--success] bg-[--success] text-white hover:border-[--success-strong] hover:bg-[--success-strong]",
        secondary: "border-[--line] bg-[--surface-2] text-[--ink] hover:bg-[--surface-3]",
        outline: "border-[--line] bg-[--surface] text-[--ink] hover:bg-[--surface-2]",
        ghost: "border-transparent bg-transparent text-[--ink-soft] hover:bg-[--surface-2] hover:text-[--ink]",
        destructive: "border-red-600 bg-red-600 text-white hover:bg-red-700",
      },
      size: {
        default: "h-9 px-3 py-1",
        sm: "h-8 px-2.5 text-xs",
        lg: "h-10 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
