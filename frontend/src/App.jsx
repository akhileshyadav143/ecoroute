import { useEffect, useState } from "react";
import { fetchRoutes } from "./api";
import RouteCard from "./components/RouteCard";
import ChatWidget from "./components/ChatWidget";
import MapView from "./components/MapView";

const VEHICLES = [
  { value: "PETROL_CAR", label: "Petrol Car (200 g/km)" },
  { value: "BIKE", label: "Bike (80 g/km)" },
  { value: "EV", label: "Electric Vehicle (0 g/km)" },
];

const MODES = [
  { value: "NORMAL", label: "⚙️ Normal" },
  { value: "URGENT", label: "⚡ Urgent - No Jam" },
  { value: "NIGHT", label: "🌙 Night Journey" },
];

export default function App() {
  const [vehicleType, setVehicleType] = useState("PETROL_CAR");
  const [mode, setMode] = useState("NORMAL");
  const [data, setData] = useState({ routes: [], message: "" });
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetchRoutes(mode, vehicleType)
      .then((res) => {
        if (cancelled) return;
        setData(res);
        setSelectedId(res.routes[0]?._id ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        setData({ routes: [], message: "" });
        setError(err.response?.data?.message || "Cannot reach the server. Is the backend running on port 5000?");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [mode, vehicleType]);

  const selectedRoute = data.routes.find((r) => r._id === selectedId);

  return (
    <div className="flex h-full flex-col md:flex-row">
      {/* LEFT PANEL */}
      <aside className="flex h-[65vh] w-full flex-col bg-moss-50 md:h-full md:w-[430px] md:shrink-0 md:border-r md:border-moss-200">
        <div className="space-y-4 px-5 pt-5">
          <div>
            <h1 className="font-display text-xl font-bold">EcoRoute</h1>
            <p className="text-sm text-ink/60">Reach on time, stay safe, emit less.</p>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-moss-200 bg-white px-3 py-2 text-sm">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-dusk" />
            <span className="font-medium">New Delhi (India Gate)</span>
            <span className="text-ink/40">→</span>
            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-signal" />
            <span className="font-medium">Chirag Delhi</span>
          </div>

          <label className="block text-sm font-medium">
            Vehicle
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="mt-1 w-full rounded-lg border border-moss-200 bg-white px-3 py-2 text-sm"
            >
              {VEHICLES.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Journey mode">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => setMode(m.value)}
                aria-pressed={mode === m.value}
                className={`rounded-lg border px-2 py-2.5 text-xs font-semibold leading-tight transition-colors ${
                  mode === m.value
                    ? m.value === "NIGHT"
                      ? "border-dusk bg-dusk text-white"
                      : "border-moss-700 bg-moss-700 text-white"
                    : "border-moss-200 bg-white hover:border-moss-600"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
          {data.message && !error && <p className="text-xs text-ink/60">{data.message}</p>}
        </div>

        {/* Results */}
        <div className="mt-3 flex-1 space-y-3 overflow-y-auto px-5 pb-4">
          {loading && <p className="text-sm text-ink/60">Finding the best routes...</p>}
          {error && <div className="rounded-lg bg-signal/10 p-3 text-sm font-medium text-signal">⚠️ {error}</div>}
          {!loading && !error && data.routes.length === 0 && (
            <p className="text-sm text-ink/60">No routes match this mode. Run <code>npm run seed</code> in the backend or switch mode.</p>
          )}
          {data.routes.map((r) => (
            <RouteCard key={r._id} route={r} selected={r._id === selectedId} onSelect={setSelectedId} />
          ))}
        </div>

        <ChatWidget mode={mode} vehicleType={vehicleType} />
      </aside>

      {/* RIGHT PANEL */}
      <main className="h-[35vh] flex-1 md:h-full">
        <MapView route={selectedRoute} />
      </main>
    </div>
  );
}