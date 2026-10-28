import "dotenv/config";
import mongoose from "mongoose";
import Route from "./models/Route.js";
import RouteAlert from "./models/RouteAlert.js";

// Mock routes between one origin and one destination (coordinates are [lng, lat])
const routes = [
  {
    name: "Ring Road Express",
    distanceKm: 12, baseTimeMins: 25, jamLevel: "HIGH", hasLights: true, roadCondition: "GOOD",
    coordinates: [[77.209, 28.6139], [77.225, 28.605], [77.24, 28.59], [77.235, 28.56], [77.23, 28.5355]],
  },
  {
    name: "Old City Shortcut",
    distanceKm: 8, baseTimeMins: 20, jamLevel: "HIGH", hasLights: false, roadCondition: "POOR",
    coordinates: [[77.209, 28.6139], [77.215, 28.595], [77.222, 28.575], [77.23, 28.5355]],
  },
  {
    name: "Metro Corridor Bypass",
    distanceKm: 14, baseTimeMins: 28, jamLevel: "LOW", hasLights: true, roadCondition: "GOOD",
    coordinates: [[77.209, 28.6139], [77.19, 28.595], [77.185, 28.57], [77.205, 28.55], [77.23, 28.5355]],
  },
  {
    name: "Green Belt Lane",
    distanceKm: 11, baseTimeMins: 30, jamLevel: "LOW", hasLights: false, roadCondition: "GOOD",
    coordinates: [[77.209, 28.6139], [77.2, 28.59], [77.21, 28.565], [77.225, 28.55], [77.23, 28.5355]],
  },
  {
    name: "University Link Road",
    distanceKm: 10, baseTimeMins: 26, jamLevel: "LOW", hasLights: true, roadCondition: "POOR",
    coordinates: [[77.209, 28.6139], [77.23, 28.6], [77.25, 28.58], [77.245, 28.55], [77.23, 28.5355]],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Route.deleteMany();
    await RouteAlert.deleteMany();
    const created = await Route.insertMany(routes);
    await RouteAlert.create({
      route: created[2]._id,
      type: "WATERLOGGING",
      description: "Water near the flyover",
      delayMins: 4,
    });
    console.log(`Seeded ${created.length} routes and 1 alert`);
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seed();
