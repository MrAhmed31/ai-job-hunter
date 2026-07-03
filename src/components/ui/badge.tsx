import * as React from "react";
import { cn } from "@/lib/utils";

function Badge({ className, variant = "default", ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: "default" | "secondary" | "outline" | "success" | "warning" }) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          default: "border-transparent bg-primary text-primary-foreground",
          secondary: "border-transparent bg-secondary text-secondary-foreground",
          outline: "text-foreground",
          success: "border-transparent bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
          warning: "border-transparent bg-amber-500/10 text-amber-600 dark:text-amber-400",
        }[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
