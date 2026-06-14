import * as LabelPrimitive from "@radix-ui/react-label";

export function Label({ className = "", ...props }) {
  return (
    <LabelPrimitive.Root
      className={`text-sm font-medium text-foreground/90 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`.trim()}
      {...props}
    />
  );
}
