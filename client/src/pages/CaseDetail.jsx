import { useEffect, useState, useCallback, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  FolderOpen,
  X,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useSelector, useDispatch } from "react-redux";
import { getCase, updateCaseStatus, assignCase, addComment, uploadDocument } from "../store/caseApi";
import { getAgents } from "../store/userApi";
import { setCurrentCase, setLoading as setCaseLoading, setError as setCaseError } from "../store/caseSlice";
import { setAgents, setLoading as setUserLoading, setError as setUserError } from "../store/userSlice";
import { StatusBadge } from "../components/StatusBadge";
import { StatusTimeline } from "../components/StatusTimeline";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Select, SelectItem } from "../components/ui/select";
import { Label } from "../components/ui/label";

const ACCEPTED_FILES = ".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx";

function isImageMime(mime) {
  return mime?.startsWith("image/");
}

export default function CaseDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);

  const user = useSelector((s) => s.auth.user);
  const token = useSelector((s) => s.auth.token);
  const { currentCase: data, loading, error } = useSelector((s) => s.case);
  const { agents } = useSelector((s) => s.user);

  const isManager = user?.role === "manager";
  const [comment, setComment] = useState("");
  const [assignAgent, setAssignAgent] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const refetchCase = useCallback(async () => {
    if (!token || !id) return;
    try {
      const fresh = await getCase(token, id);
      dispatch(setCurrentCase(fresh));
    } catch (err) {
      dispatch(setCaseError(err.message || "Failed to refresh case"));
    }
  }, [token, id, dispatch]);

  useEffect(() => {
    const loadCase = async () => {
      dispatch(setCaseLoading(true));
      dispatch(setCaseError(null));
      try {
        const result = await getCase(token, id);
        dispatch(setCurrentCase(result));
      } catch (err) {
        dispatch(setCaseError(err.message || "Failed to fetch case"));
      } finally {
        dispatch(setCaseLoading(false));
      }
    };

    const loadAgents = async () => {
      dispatch(setUserLoading(true));
      dispatch(setUserError(null));
      try {
        const agentList = await getAgents(token);
        dispatch(setAgents(agentList));
      } catch (err) {
        dispatch(setUserError(err.message || "Failed to fetch agents"));
      } finally {
        dispatch(setUserLoading(false));
      }
    };

    if (token) {
      loadCase();
      if (isManager) loadAgents();
    }
  }, [id, isManager, dispatch, token]);

  useEffect(() => {
    if (data?.case?.assignedTo?._id) {
      setAssignAgent(data.case.assignedTo._id);
    }
  }, [data]);

  async function handleUpdateStatus(status, note = "") {
    dispatch(setCaseError(null));
    try {
      await updateCaseStatus(token, id, status, note);
      await refetchCase();
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      dispatch(setCaseError(err.message || "Failed to update status"));
      toast.error(err.message || "Failed to update status");
    }
  }

  async function handleAssign() {
    if (!assignAgent) return;
    dispatch(setCaseError(null));
    try {
      await assignCase(token, id, assignAgent);
      await refetchCase();
      toast.success("Case assigned successfully");
    } catch (err) {
      dispatch(setCaseError(err.message || "Failed to assign case"));
      toast.error(err.message || "Failed to assign case");
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!comment.trim()) return;
    dispatch(setCaseError(null));
    try {
      await addComment(token, id, comment);
      setComment("");
      await refetchCase();
      toast.success("Comment added");
    } catch (err) {
      dispatch(setCaseError(err.message || "Failed to add comment"));
      toast.error(err.message || "Failed to add comment");
    }
  }

  function addFiles(fileList) {
    const allowed = /\.(jpg|jpeg|png|gif|webp|pdf|doc|docx)$/i;
    const incoming = Array.from(fileList || []).filter((f) => allowed.test(f.name));
    if (!incoming.length) {
      if (fileList?.length) toast.error("No supported files found. Use images, PDF, or DOC.");
      return;
    }
    setPendingFiles((prev) => {
      const existing = new Set(prev.map((f) => `${f.name}-${f.size}`));
      const unique = incoming.filter((f) => !existing.has(`${f.name}-${f.size}`));
      return [...prev, ...unique];
    });
  }

  function removePendingFile(index) {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!pendingFiles.length) return;

    setUploading(true);
    dispatch(setCaseError(null));
    const count = pendingFiles.length;
    try {
      for (const file of pendingFiles) {
        await uploadDocument(token, id, file);
      }
      setPendingFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (folderInputRef.current) folderInputRef.current.value = "";
      await refetchCase();
      toast.success(count === 1 ? "Document uploaded" : `${count} documents uploaded`);
    } catch (err) {
      dispatch(setCaseError(err.message || "Failed to upload document"));
      toast.error(err.message || "Failed to upload document");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    addFiles(e.dataTransfer.files);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading case...</p>
      </div>
    );
  }

  const caseDoc = data?.case;
  if (!caseDoc) {
    return <p className="text-destructive">{error || "Case not found"}</p>;
  }

  const comments = data.comments ?? [];
  const documents = data.documents ?? [];
  const auditLog = data.auditLog ?? [];

  const isAssignedAgent =
    !isManager && caseDoc.assignedTo?._id?.toString() === user?.id?.toString();
  const isClosed = ["Cleared", "Discrepant"].includes(caseDoc.status);
  const canUpload = !isClosed && (isAssignedAgent || isManager);

  return (
    <div className="space-y-8">
      <Link
        to="/"
        className="inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to cases
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="page-title text-3xl font-bold tracking-tight">{caseDoc.clientName}</h1>
          <p className="mt-1 text-muted-foreground">
            {caseDoc.subjectName} · {caseDoc.caseType}
          </p>
        </div>
        <StatusBadge status={caseDoc.status} />
      </div>

      {error && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="premium-card border-0">
            <CardHeader>
              <CardTitle className="text-base">Case Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-lg bg-muted/40 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Due date
                </span>
                <p className="mt-1 font-semibold">{format(new Date(caseDoc.dueDate), "MMM d, yyyy")}</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Assigned to
                </span>
                <p className="mt-1 font-semibold">{caseDoc.assignedTo?.name || "Unassigned"}</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Created by
                </span>
                <p className="mt-1 font-semibold">{caseDoc.createdBy?.name || "—"}</p>
              </div>
              <div className="rounded-lg bg-muted/40 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Created
                </span>
                <p className="mt-1 font-semibold">{format(new Date(caseDoc.createdAt), "MMM d, yyyy")}</p>
              </div>
            </CardContent>
          </Card>

          {isManager && !isClosed && (
            <Card className="premium-card border-0">
              <CardHeader>
                <CardTitle className="text-base">Manager Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(caseDoc.status === "New" || caseDoc.status === "Assigned") && (
                  <div className="flex flex-wrap items-end gap-2">
                    <div className="min-w-[200px] flex-1 space-y-2">
                      <Label>Assign Agent</Label>
                      <Select
                        value={assignAgent || "none"}
                        onValueChange={(v) => setAssignAgent(v === "none" ? "" : v)}
                      >
                        <SelectItem value="none">Select agent</SelectItem>
                        {agents.map((a) => (
                          <SelectItem key={a._id} value={a._id}>
                            {a.name}
                          </SelectItem>
                        ))}
                      </Select>
                    </div>
                    <Button onClick={handleAssign} disabled={!assignAgent}>
                      Assign
                    </Button>
                  </div>
                )}
                {caseDoc.status === "Submitted" && (
                  <div className="flex gap-2">
                    <Button onClick={() => handleUpdateStatus("Cleared")} variant="default">
                      Mark Cleared
                    </Button>
                    <Button onClick={() => handleUpdateStatus("Discrepant")} variant="destructive">
                      Mark Discrepant
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {isAssignedAgent && !isClosed && (
            <Card className="premium-card border-0">
              <CardHeader>
                <CardTitle className="text-base">Agent Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {caseDoc.status === "Assigned" && (
                  <Button onClick={() => handleUpdateStatus("In Progress")}>Start Work</Button>
                )}
                {caseDoc.status === "In Progress" && (
                  <Button onClick={() => handleUpdateStatus("Submitted")}>Submit Case</Button>
                )}
              </CardContent>
            </Card>
          )}

          <Card className="premium-card border-0">
            <CardHeader>
              <CardTitle className="text-base">Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No documents uploaded yet.</p>
              ) : (
                <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
                  {documents.map((doc) => (
                    <li key={doc._id} className="flex items-center gap-3 px-4 py-3 text-sm">
                      {isImageMime(doc.mimeType) ? (
                        <ImageIcon className="h-4 w-4 shrink-0 text-primary" />
                      ) : (
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="cursor-pointer font-medium text-primary hover:underline"
                      >
                        {doc.originalName}
                      </a>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {doc.uploadedBy?.name} · {format(new Date(doc.createdAt), "MMM d")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              {canUpload && (
                <form onSubmit={handleUpload} className="space-y-4 border-t border-border/60 pt-4">
                  <div
                    role="button"
                    tabIndex={0}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 transition-colors ${
                      dragOver
                        ? "border-primary bg-primary/5"
                        : "border-border/80 bg-muted/20 hover:border-primary/50 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Upload className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="font-medium">Drop files here or click to browse</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Images (JPG, PNG, GIF, WebP) · PDF · DOC · Max 10MB each
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        <ImageIcon className="h-4 w-4" />
                        Select files
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          folderInputRef.current?.click();
                        }}
                      >
                        <FolderOpen className="h-4 w-4" />
                        Select folder
                      </Button>
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_FILES}
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  <input
                    ref={folderInputRef}
                    type="file"
                    accept={ACCEPTED_FILES}
                    multiple
                    className="hidden"
                    {...{ webkitdirectory: "", directory: "" }}
                    onChange={(e) => {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />

                  {pendingFiles.length > 0 && (
                    <ul className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
                      {pendingFiles.map((file, index) => (
                        <li
                          key={`${file.name}-${file.size}-${index}`}
                          className="flex items-center gap-2 text-sm"
                        >
                          {file.type.startsWith("image/") ? (
                            <ImageIcon className="h-4 w-4 text-primary" />
                          ) : (
                            <FileText className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="flex-1 truncate">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024).toFixed(0)} KB
                          </span>
                          <button
                            type="button"
                            onClick={() => removePendingFile(index)}
                            className="cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted hover:text-destructive"
                            aria-label={`Remove ${file.name}`}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button type="submit" size="sm" disabled={!pendingFiles.length || uploading} className="cursor-pointer">
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        Upload {pendingFiles.length > 0 ? `(${pendingFiles.length})` : ""}
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          <Card className="premium-card border-0">
            <CardHeader>
              <CardTitle className="text-base">Comments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-muted-foreground">No comments yet.</p>
              ) : (
                <ul className="space-y-3">
                  {comments.map((c) => (
                    <li key={c._id} className="rounded-lg border border-border/40 bg-muted/30 p-4 text-sm">
                      <p className="font-medium">
                        {c.author?.name}{" "}
                        <span className="font-normal text-muted-foreground">
                          · {format(new Date(c.createdAt), "MMM d, h:mm a")}
                        </span>
                      </p>
                      <p className="mt-1.5 leading-relaxed">{c.text}</p>
                    </li>
                  ))}
                </ul>
              )}
              {!isClosed && (
                <form onSubmit={handleComment} className="space-y-3 border-t border-border/60 pt-4">
                  <Textarea
                    placeholder="Add a note..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                  <Button type="submit" size="sm" disabled={!comment.trim()}>
                    Add Comment
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="premium-card h-fit border-0">
          <CardHeader>
            <CardTitle className="text-base">Status Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <StatusTimeline auditLog={auditLog} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
