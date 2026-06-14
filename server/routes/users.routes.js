import { Router } from "express";
import { getAgents } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { authorize } from "../middleware/authorize.js";

const router = Router();

router.get("/agents", authenticate, authorize("manager"), getAgents);

export default router;
