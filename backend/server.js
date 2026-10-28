import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import routeRoutes from "./routes/routeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/routes", routeRoutes);
app.use("/api/ai-assistant", aiRoutes);

app.use((req, res) => res.status(404).json({ message: `Route ${req.originalUrl} not found` }));

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`EcoRoute API running on http://localhost:${PORT}`)));
