import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";

export function StatusTimeline({ auditLog }) {
  if (!auditLog?.length) {
    return <p className="text-sm text-muted-foreground">No status changes yet.</p>;
  }

  return (
    <ol className="relative border-l border-border ml-3 space-y-6">
      {auditLog.map((entry) => (
        <li key={entry._id} className="ml-6">
          <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
          <div className="flex flex-wrap items-center gap-2">
            {entry.fromStatus && (
              <>
                <StatusBadge status={entry.fromStatus} />
                <span className="text-muted-foreground">→</span>
              </>
            )}
            <StatusBadge status={entry.toStatus} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {entry.changedBy?.name} · {format(new Date(entry.createdAt), "MMM d, yyyy h:mm a")}
          </p>
          {entry.note && <p className="mt-1 text-sm">{entry.note}</p>}
        </li>
      ))}
    </ol>
  );
}
