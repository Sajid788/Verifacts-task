import { Router } from "express";
import {
  getCases,
  createCase,
  getCase,
  assignCase,
  updateCaseStatus,
  addComment,
  uploadDocument,
} from "../controllers/case.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";
import { uploadSingle } from "../middleware/upload.js";

const router = Router();

router.get("/", authenticate, getCases);
router.post("/", authenticate, authorize("manager"), createCase);
router.get("/:id", authenticate, getCase);
router.patch("/:id/assign", authenticate, authorize("manager"), assignCase);
router.patch("/:id/status", authenticate, updateCaseStatus);
router.post("/:id/comments", authenticate, addComment);
router.post("/:id/documents", authenticate, uploadSingle, uploadDocument);

export default router;
