export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`flex min-h-[100px] w-full rounded-lg border border-input bg-background px-4 py-3 text-sm shadow-sm transition-all placeholder:text-muted-foreground hover:border-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 ${className}`.trim()}
      {...props}
    />
  );
}
