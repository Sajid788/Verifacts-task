export function Input({ className = "", error, ...props }) {
  return (
    <input
      className={`flex h-11 w-full rounded-lg border bg-background px-4 py-2 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 ${
        error ? "border-destructive focus-visible:ring-destructive/30" : "border-input hover:border-primary/30"
      } ${className}`.trim()}
      {...props}
    />
  );
}
