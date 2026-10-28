import { Router } from "express";
import { askAssistant } from "../controllers/aiController.js";

const router = Router();
router.post("/", askAssistant);

export default router;
