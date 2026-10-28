import Route from "../models/Route.js";
import RouteAlert from "../models/RouteAlert.js";
import { calculateCO2, calculateSavings, isValidVehicle } from "../utils/emissions.js";

const MODES = ["NORMAL", "URGENT", "NIGHT"];

// Realistic travel time = base time + penalties for jam, bad road and live alerts
const effectiveTime = (route, alertDelay) => {
  let t = route.baseTimeMins;
  if (route.jamLevel === "HIGH") t *= 1.6;
  if (route.roadCondition === "POOR") t *= 1.15;
  return Math.round(t + alertDelay);
};

const buildWarnings = (route, alerts) => {
  const w = [];
  if (route.jamLevel === "HIGH") w.push("Heavy traffic jam on this route");
  if (route.roadCondition === "POOR") w.push("Poor road condition - potholes / damaged surface");
  if (!route.hasLights) w.push("No street lights - avoid after dark");
  alerts.forEach((a) =>
    w.push(`Reported: ${a.type.replace("_", " ").toLowerCase()}${a.description ? ` - ${a.description}` : ""}`)
  );
  return w;
};

// GET /api/routes?mode=NORMAL|URGENT|NIGHT&vehicleType=PETROL_CAR|BIKE|EV
export const getRoutes = async (req, res) => {
  try {
    const mode = (req.query.mode || "NORMAL").toUpperCase();
    const vehicleType = (req.query.vehicleType || "PETROL_CAR").toUpperCase();

    if (!MODES.includes(mode)) return res.status(400).json({ message: `mode must be one of ${MODES.join(", ")}` });
    if (!isValidVehicle(vehicleType)) return res.status(400).json({ message: "Invalid vehicleType" });

    const [routes, alerts] = await Promise.all([Route.find().lean(), RouteAlert.find().lean()]);

    const enriched = routes.map((r) => {
      const routeAlerts = alerts.filter((a) => String(a.route) === String(r._id));
      const delay = routeAlerts.reduce((sum, a) => sum + (a.delayMins || 0), 0);
      return {
        ...r,
        effectiveTimeMins: effectiveTime(r, delay),
        co2Grams: calculateCO2(r.distanceKm, vehicleType),
        co2SavedGrams: calculateSavings(r.distanceKm, vehicleType),
        warnings: buildWarnings(r, routeAlerts),
        alertCount: routeAlerts.length,
      };
    });

    let message = "";
    let result = [];

    if (mode === "URGENT") {
      // Bypass HIGH jam and POOR roads, fastest first
      result = enriched
        .filter((r) => r.jamLevel !== "HIGH" && r.roadCondition !== "POOR")
        .sort((a, b) => a.effectiveTimeMins - b.effectiveTimeMins);
      message = result.length
        ? "Jam-free, good-condition routes sorted by fastest arrival."
        : "No fully clear route found right now. Showing the least-delayed options instead.";
      if (!result.length) result = [...enriched].sort((a, b) => a.effectiveTimeMins - b.effectiveTimeMins);
    } else if (mode === "NIGHT") {
      // Only well-lit routes, safest (good road first, then fastest)
      result = enriched
        .filter((r) => r.hasLights)
        .sort(
          (a, b) =>
            Number(a.roadCondition === "POOR") - Number(b.roadCondition === "POOR") ||
            a.effectiveTimeMins - b.effectiveTimeMins
        );
      message = result.length ? "Only routes with street lights are shown." : "No lit route available.";
    } else {
      result = enriched.sort((a, b) => a.distanceKm - b.distanceKm);
      message = "Shortest distance first.";
    }

    result = result.map((r, i) => ({ ...r, recommended: i === 0 }));
    res.json({ mode, vehicleType, message, count: result.length, routes: result });
  } catch (err) {
    console.error("getRoutes error:", err);
    res.status(500).json({ message: "Failed to fetch routes" });
  }
};

// POST /api/routes/alerts  { routeId, type, description?, delayMins? }
export const createAlert = async (req, res) => {
  try {
    const { routeId, type, description, delayMins } = req.body;
    if (!routeId || !type) return res.status(400).json({ message: "routeId and type are required" });
    const route = await Route.findById(routeId);
    if (!route) return res.status(404).json({ message: "Route not found" });
    const alert = await RouteAlert.create({ route: routeId, type, description, delayMins });
    res.status(201).json(alert);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/routes/alerts
export const getAlerts = async (_req, res) => {
  try {
    res.json(await RouteAlert.find().populate("route", "name").sort({ createdAt: -1 }));
  } catch {
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};
