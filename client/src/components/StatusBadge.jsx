import { Badge } from "./ui/badge";

const statusVariant = {
  New: "secondary",
  Assigned: "default",
  "In Progress": "warning",
  Submitted: "default",
  Cleared: "success",
  Discrepant: "destructive",
};

export function StatusBadge({ status }) {
  return <Badge variant={statusVariant[status] || "outline"}>{status}</Badge>;
}
