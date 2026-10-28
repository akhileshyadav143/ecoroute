const co2Label = (g) => (g >= 1000 ? `${(g / 1000).toFixed(2)} kg` : `${g} g`);

export default function RouteCard({ route, selected, onSelect }) {
  const hazards = route.warnings || [];
  return (
    <div
      className={`rounded-xl border bg-white transition-colors ${
        selected ? "border-moss-600 ring-2 ring-moss-600/20" : "border-moss-200 hover:border-moss-600/50"
      }`}
    >
      <button type="button" onClick={() => onSelect(route._id)} className="w-full text-left p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[15px] font-semibold">{route.name}</h3>
          {route.recommended && (
            <span className="shrink-0 rounded-full bg-moss-600 px-2.5 py-0.5 text-xs font-medium text-white">Best pick</span>
          )}
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <Stat value={`${route.effectiveTimeMins} min`} label="Arrival time" />
          <Stat value={`${route.distanceKm} km`} label="Distance" />
          <Stat value={co2Label(route.co2Grams)} label="CO2 emitted" />
        </div>

        {route.co2SavedGrams > 0 && (
          <p className="mt-2 text-xs text-moss-700">Saves {co2Label(route.co2SavedGrams)} CO2 vs a petrol car</p>
        )}
      </button>

      {hazards.length > 0 && (
        <ul className="space-y-1 border-t border-signal/20 bg-signal/10 px-4 py-2.5 rounded-b-xl">
          {hazards.map((w, i) => (
            <li key={i} className="flex gap-2 text-xs font-medium text-signal">
              <span aria-hidden>⚠️</span>
              <span>{w}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const Stat = ({ value, label }) => (
  <div className="rounded-lg bg-moss-50 px-1 py-2">
    <div className="font-display text-sm font-semibold">{value}</div>
    <div className="text-[11px] text-ink/60">{label}</div>
  </div>
);
