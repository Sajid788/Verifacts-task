import mongoose from "mongoose";

const auditLogSchema = new mongoose.Schema(
  {
    caseId: { type: mongoose.Schema.Types.ObjectId, ref: "Case", required: true },
    fromStatus: { type: String, default: null },
    toStatus: { type: String, required: true },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("AuditLog", auditLogSchema);
