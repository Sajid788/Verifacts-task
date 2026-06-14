import { cva } from "class-variance-authority";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-primary/12 text-primary ring-1 ring-primary/20",
      secondary: "bg-secondary text-secondary-foreground",
      success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      destructive: "bg-red-50 text-red-700 ring-1 ring-red-200",
      outline: "border border-border text-foreground",
    },
  },
  defaultVariants: { variant: "default" },
});

export function Badge({ className = "", variant, ...props }) {
  return <span className={`${badgeVariants({ variant })} ${className}`.trim()} {...props} />;
}
