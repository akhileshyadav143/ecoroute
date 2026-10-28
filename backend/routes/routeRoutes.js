import { Router } from "express";
import { getRoutes, createAlert, getAlerts } from "../controllers/routeController.js";

const router = Router();
router.get("/", getRoutes);
router.get("/alerts", getAlerts);
router.post("/alerts", createAlert);

export default router;
