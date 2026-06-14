import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { Search, Filter, ArrowUpRight, Briefcase, CheckCircle2, Clock } from "lucide-react";
import { getCases } from "../store/caseApi";
import { getAgents } from "../store/userApi";
import { setCases, setLoading as setCaseLoading, setError as setCaseError } from "../store/caseSlice";
import { setAgents, setLoading as setUserLoading, setError as setUserError } from "../store/userSlice";
import { StatusBadge } from "../components/StatusBadge";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectItem } from "../components/ui/select";
import { Button } from "../components/ui/button";

const STATUSES = ["", "New", "Assigned", "In Progress", "Submitted", "Cleared", "Discrepant"];

export default function CaseList() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);
  const { cases, loading } = useSelector((s) => s.case);
  const { agents } = useSelector((s) => s.user);

  const isManager = user?.role === "manager";
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [agentId, setAgentId] = useState("");

  useEffect(() => {
    const loadCases = async () => {
      dispatch(setCaseLoading(true));
      dispatch(setCaseError(null));
      try {
        const data = await getCases(token);
        dispatch(setCases(data));
      } catch (err) {
        toast.error(err.message || "Failed to fetch cases");
        dispatch(setCaseError(err.message || "Failed to fetch cases"));
      } finally {
        dispatch(setCaseLoading(false));
      }
    };

    const loadAgents = async () => {
      dispatch(setUserLoading(true));
      dispatch(setUserError(null));
      try {
        const data = await getAgents(token);
        dispatch(setAgents(data));
      } catch (err) {
        dispatch(setUserError(err.message || "Failed to fetch agents"));
      } finally {
        dispatch(setUserLoading(false));
      }
    };

    if (token) {
      loadCases();
      if (isManager) loadAgents();
    }
  }, [isManager, dispatch, token]);

  const filtered = cases.filter((c) => {
    if (
      search &&
      !c.clientName.toLowerCase().includes(search.toLowerCase()) &&
      !c.subjectName.toLowerCase().includes(search.toLowerCase()) &&
      !c.caseType.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    if (status && c.status !== status) return false;
    if (agentId && c.assignedTo?._id !== agentId) return false;
    return true;
  });

  const activeCount = cases.filter((c) => !["Cleared", "Discrepant"].includes(c.status)).length;
  const clearedCount = cases.filter((c) => c.status === "Cleared").length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="page-title text-4xl font-bold tracking-tight">Cases</h1>
          <p className="mt-2 text-base text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? "case" : "cases"} in your workspace
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div className="stat-card rounded-xl px-5 py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Total</span>
            </div>
            <p className="mt-1 text-2xl font-bold">{cases.length}</p>
          </div>
          <div className="stat-card rounded-xl px-5 py-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Active</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-primary">{activeCount}</p>
          </div>
          <div className="stat-card col-span-2 rounded-xl px-5 py-4 sm:col-span-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Cleared</span>
            </div>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{clearedCount}</p>
          </div>
        </div>
      </div>

      <Card className="premium-card border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Filter className="h-4 w-4 text-primary" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search client, subject, type..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-background/60"
              />
            </div>
            <Select
              value={status || "all"}
              onValueChange={(v) => setStatus(v === "all" ? "" : v)}
              placeholder="All statuses"
            >
              <SelectItem value="all">All statuses</SelectItem>
              {STATUSES.filter(Boolean).map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </Select>
            {isManager && (
              <Select
                value={agentId || "all"}
                onValueChange={(v) => setAgentId(v === "all" ? "" : v)}
                placeholder="All agents"
              >
                <SelectItem value="all">All agents</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a._id} value={a._id}>
                    {a.name}
                  </SelectItem>
                ))}
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="premium-card overflow-hidden border-0">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-3 p-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <p className="text-muted-foreground">Loading cases...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
              <Briefcase className="h-10 w-10 text-muted-foreground/40" />
              <p className="font-medium text-muted-foreground">No cases found</p>
              <p className="text-sm text-muted-foreground/70">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="premium-table w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Client
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Subject
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Type
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Due
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    {isManager && (
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Agent
                      </th>
                    )}
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c._id} className="border-b border-border/60 last:border-0">
                      <td className="px-6 py-4 font-medium">{c.clientName}</td>
                      <td className="px-6 py-4">{c.subjectName}</td>
                      <td className="px-6 py-4 text-muted-foreground">{c.caseType}</td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {format(new Date(c.dueDate), "MMM d, yyyy")}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={c.status} />
                      </td>
                      {isManager && (
                        <td className="px-6 py-4 text-muted-foreground">{c.assignedTo?.name || "—"}</td>
                      )}
                      <td className="px-6 py-4">
                        <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary">
                          <Link to={`/cases/${c._id}`}>
                            View
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
