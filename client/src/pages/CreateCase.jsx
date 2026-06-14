import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getAgents } from "../store/userApi";
import { createCase } from "../store/caseApi";
import { setAgents, setLoading as setUserLoading, setError as setUserError } from "../store/userSlice";
import { setLoading as setCaseLoading, setError as setCaseError } from "../store/caseSlice";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectItem } from "../components/ui/select";

export default function CreateCase() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { agents } = useSelector((s) => s.user);
  const { error: storeError, loading } = useSelector((s) => s.case);
  
  const [form, setForm] = useState({
    clientName: "",
    subjectName: "",
    caseType: "",
    dueDate: "",
    assignedTo: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");

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
    loadAgents();
  }, [dispatch]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    dispatch(setCaseLoading(true));
    dispatch(setCaseError(null));
    try {
      const token = localStorage.getItem("token");
      const payload = { ...form };
      if (!payload.assignedTo) delete payload.assignedTo;
      const result = await createCase(token, payload);
      navigate(`/cases/${result._id}`);
    } catch (err) {
      const errorMsg = err?.message || storeError || "Failed to create case";
      setError(errorMsg);
      dispatch(setCaseError(errorMsg));
    } finally {
      dispatch(setCaseLoading(false));
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">Create Case</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Client Name</Label>
              <Input value={form.clientName} onChange={(e) => update("clientName", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Subject Name</Label>
              <Input value={form.subjectName} onChange={(e) => update("subjectName", e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Case Type</Label>
              <Input
                value={form.caseType}
                onChange={(e) => update("caseType", e.target.value)}
                placeholder="e.g. Background Check"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => update("dueDate", e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Assign to Agent (optional)</Label>
              <Select
                value={form.assignedTo || "none"}
                onValueChange={(v) => update("assignedTo", v === "none" ? "" : v)}
                placeholder="Select agent"
              >
                <SelectItem value="none">Unassigned</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a._id} value={a._id}>
                    {a.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            {(error || storeError) && <p className="text-sm text-destructive">{error || storeError}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Case"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/")}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
