import Case from "../models/Case.js";
import Comment from "../models/Comment.js";
import Document from "../models/Document.js";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import { uploadToCloudinary } from "../config/cloudinary.js";

const CASE_STATUSES = ["New", "Assigned", "In Progress", "Submitted", "Cleared", "Discrepant"];

const TRANSITIONS = {
  New: { manager: ["Assigned"] },
  Assigned: { agent: ["In Progress"] },
  "In Progress": { agent: ["Submitted"] },
  Submitted: { manager: ["Cleared", "Discrepant"] },
};

const canTransition = (from, to, role) => TRANSITIONS[from]?.[role]?.includes(to) || false;

const logStatusChange = (data) => AuditLog.create(data);

async function getCaseForUser(id, user) {
  const caseDoc = await Case.findById(id)
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email");

  if (!caseDoc) return null;
  if (user.role === "agent" && caseDoc.assignedTo?._id?.toString() !== user.id) {
    return "forbidden";
  }
  return caseDoc;
}

export const getCases = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filter = {};

    if (req.user.role === "agent") {
      filter.assignedTo = req.user.id;
    } else if (req.query.agentId) {
      filter.assignedTo = req.query.agentId;
    }

    if (req.query.status) {
      if (!CASE_STATUSES.includes(req.query.status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const search = req.query.search.trim();
      filter.$or = [
        { clientName: { $regex: search, $options: "i" } },
        { subjectName: { $regex: search, $options: "i" } },
        { caseType: { $regex: search, $options: "i" } },
      ];
    }

    const [cases, total] = await Promise.all([
      Case.find(filter)
        .populate("assignedTo", "name email")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Case.countDocuments(filter),
    ]);

    res.json({ cases, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCase = async (req, res) => {
  try {
    const { clientName, subjectName, caseType, dueDate, assignedTo } = req.body;

    if (!clientName || !subjectName || !caseType || !dueDate) {
      return res.status(400).json({ message: "All case fields are required" });
    }

    if (assignedTo) {
      const agent = await User.findOne({ _id: assignedTo, role: "agent" });
      if (!agent) return res.status(400).json({ message: "Agent not found" });
    }

    const status = assignedTo ? "Assigned" : "New";
    const caseDoc = await Case.create({
      clientName,
      subjectName,
      caseType,
      dueDate,
      assignedTo: assignedTo || null,
      status,
      createdBy: req.user.id,
    });

    await logStatusChange({
      caseId: caseDoc._id,
      fromStatus: null,
      toStatus: status,
      changedBy: req.user.id,
      note: "Case created",
    });

    const populated = await Case.findById(caseDoc._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCase = async (req, res) => {
  try {
    const caseDoc = await getCaseForUser(req.params.id, req.user);
    if (!caseDoc) return res.status(404).json({ message: "Case not found" });
    if (caseDoc === "forbidden") return res.status(403).json({ message: "Access denied" });

    const [comments, documents, auditLog] = await Promise.all([
      Comment.find({ caseId: caseDoc._id }).populate("author", "name role").sort({ createdAt: 1 }),
      Document.find({ caseId: caseDoc._id }).populate("uploadedBy", "name").sort({ createdAt: -1 }),
      AuditLog.find({ caseId: caseDoc._id }).populate("changedBy", "name role").sort({ createdAt: 1 }),
    ]);

    res.json({ case: caseDoc, comments, documents, auditLog });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const assignCase = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    if (!assignedTo) return res.status(400).json({ message: "Agent id required" });

    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ message: "Case not found" });

    const agent = await User.findOne({ _id: assignedTo, role: "agent" });
    if (!agent) return res.status(400).json({ message: "Agent not found" });

    if (caseDoc.status !== "New" && caseDoc.status !== "Assigned") {
      return res.status(400).json({ message: "Can only assign New or re-assign Assigned cases" });
    }

    const fromStatus = caseDoc.status;
    caseDoc.assignedTo = assignedTo;
    caseDoc.status = "Assigned";
    await caseDoc.save();

    if (fromStatus !== "Assigned") {
      await logStatusChange({
        caseId: caseDoc._id,
        fromStatus,
        toStatus: "Assigned",
        changedBy: req.user.id,
        note: `Assigned to ${agent.name}`,
      });
    }

    const populated = await Case.findById(caseDoc._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateCaseStatus = async (req, res) => {
  try {
    const { status: toStatus, note } = req.body;
    if (!toStatus) return res.status(400).json({ message: "Status required" });

    if (!CASE_STATUSES.includes(toStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const caseDoc = await Case.findById(req.params.id);
    if (!caseDoc) return res.status(404).json({ message: "Case not found" });

    const fromStatus = caseDoc.status;
    if (fromStatus === toStatus) {
      return res.status(400).json({ message: "Case already has this status" });
    }

    if (!canTransition(fromStatus, toStatus, req.user.role)) {
      return res.status(400).json({
        message: `Cannot transition from ${fromStatus} to ${toStatus} as ${req.user.role}`,
      });
    }

    if (req.user.role === "agent" && caseDoc.assignedTo?.toString() !== req.user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    caseDoc.status = toStatus;
    await caseDoc.save();

    await logStatusChange({
      caseId: caseDoc._id,
      fromStatus,
      toStatus,
      changedBy: req.user.id,
      note: note || "",
    });

    const populated = await Case.findById(caseDoc._id)
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ message: "Comment text required" });

    const caseDoc = await getCaseForUser(req.params.id, req.user);
    if (!caseDoc) return res.status(404).json({ message: "Case not found" });
    if (caseDoc === "forbidden") return res.status(403).json({ message: "Access denied" });

    const comment = await Comment.create({
      caseId: caseDoc._id,
      text: text.trim(),
      author: req.user.id,
    });

    const populated = await Comment.findById(comment._id).populate("author", "name role");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File required" });

    const caseDoc = await getCaseForUser(req.params.id, req.user);
    if (!caseDoc) return res.status(404).json({ message: "Case not found" });
    if (caseDoc === "forbidden") return res.status(403).json({ message: "Access denied" });

    if (["Cleared", "Discrepant"].includes(caseDoc.status)) {
      return res.status(400).json({ message: "Cannot upload to closed case" });
    }

    const uploadedFile = await uploadToCloudinary(req.file);

    const doc = await Document.create({
      caseId: caseDoc._id,
      filename: uploadedFile.public_id,
      publicId: uploadedFile.public_id,
      url: uploadedFile.secure_url,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: uploadedFile.bytes || req.file.size,
      uploadedBy: req.user.id,
    });

    const populated = await Document.findById(doc._id).populate("uploadedBy", "name");
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
