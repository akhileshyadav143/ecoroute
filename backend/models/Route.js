import mongoose from "mongoose";

const routeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    distanceKm: { type: Number, required: true, min: 0 },
    baseTimeMins: { type: Number, required: true, min: 0 },
    jamLevel: { type: String, enum: ["LOW", "HIGH"], default: "LOW" },
    hasLights: { type: Boolean, default: false },
    roadCondition: { type: String, enum: ["GOOD", "POOR"], default: "GOOD" },
    // [[lng, lat], [lng, lat], ...] (GeoJSON / Mapbox order)
    coordinates: {
      type: [[Number]],
      validate: {
        validator: (arr) => arr.length >= 2 && arr.every((p) => p.length === 2),
        message: "coordinates must have at least 2 [lng, lat] points",
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Route", routeSchema);
