import mongoose from "mongoose";

const routeAlertSchema = new mongoose.Schema(
  {
    route: { type: mongoose.Schema.Types.ObjectId, ref: "Route", required: true },
    type: {
      type: String,
      enum: ["POTHOLE", "STREETLIGHT_OFF", "WATERLOGGING", "ACCIDENT", "ROADBLOCK"],
      required: true,
    },
    description: { type: String, trim: true, maxlength: 200, default: "" },
    delayMins: { type: Number, default: 5, min: 0, max: 120 },
    createdAt: { type: Date, default: Date.now, expires: 60 * 60 * 6 }, // auto-delete after 6 hours
  },
  { versionKey: false }
);

export default mongoose.model("RouteAlert", routeAlertSchema);
