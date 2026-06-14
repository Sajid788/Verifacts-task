import mongoose from "mongoose";

const caseSchema = new mongoose.Schema(
  {
    clientName: { type: String, required: true, trim: true },
    subjectName: { type: String, required: true, trim: true },
    caseType: { type: String, required: true, trim: true },
    dueDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ["New", "Assigned", "In Progress", "Submitted", "Cleared", "Discrepant"],
      default: "New",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Case", caseSchema);
