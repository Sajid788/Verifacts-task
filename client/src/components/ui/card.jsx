export function Card({ className = "", ...props }) {
  return (
    <div
      className={`rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm transition-shadow ${className}`.trim()}
      {...props}
    />
  );
}

export function CardHeader({ className = "", ...props }) {
  return <div className={`flex flex-col gap-1.5 p-6 ${className}`.trim()} {...props} />;
}

export function CardTitle({ className = "", ...props }) {
  return <h3 className={`text-xl font-bold tracking-tight leading-none ${className}`.trim()} {...props} />;
}

export function CardContent({ className = "", ...props }) {
  return <div className={`p-6 pt-0 ${className}`.trim()} {...props} />;
}
