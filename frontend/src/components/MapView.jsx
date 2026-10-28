import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const HAS_TOKEN = Boolean(TOKEN) && !TOKEN.includes("your_mapbox");
const CENTER = [77.209, 28.6139];
const EMPTY = { type: "Feature", geometry: { type: "LineString", coordinates: [] } };

export default function MapView({ route }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [ready, setReady] = useState(false);

  // Initialise the map once
  useEffect(() => {
    if (!HAS_TOKEN || mapRef.current) return;
    mapboxgl.accessToken = TOKEN;
    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: CENTER,
      zoom: 10.5,
    });
    map.addControl(new mapboxgl.NavigationControl(), "top-right");
    map.on("load", () => {
      map.addSource("route", { type: "geojson", data: EMPTY });
      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#2f6b50", "line-width": 6 },
      });
      setReady(true);
    });
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
  }, []);

  // Draw selected route + start/end markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !ready) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (!route?.coordinates?.length) {
      map.getSource("route").setData(EMPTY);
      return;
    }

    const coords = route.coordinates;
    map.getSource("route").setData({ type: "Feature", geometry: { type: "LineString", coordinates: coords } });
    map.setPaintProperty("route-line", "line-color", route.jamLevel === "HIGH" ? "#e5484d" : "#2f6b50");

    const popupOpts = { closeButton: false, closeOnClick: false, offset: 28 };
    markersRef.current = [
      new mapboxgl.Marker({ color: "#26306b" })
        .setLngLat(coords[0])
        .setPopup(new mapboxgl.Popup(popupOpts).setText("From: New Delhi (India Gate)"))
        .addTo(map)
        .togglePopup(),
      new mapboxgl.Marker({ color: "#e5484d" })
        .setLngLat(coords[coords.length - 1])
        .setPopup(new mapboxgl.Popup(popupOpts).setText("To: Chirag Delhi"))
        .addTo(map)
        .togglePopup(),
    ];

    const bounds = coords.reduce((b, c) => b.extend(c), new mapboxgl.LngLatBounds(coords[0], coords[0]));
    map.fitBounds(bounds, { padding: 80, duration: 800 });
  }, [route, ready]);

  if (!HAS_TOKEN) {
    return (
      <div className="flex h-full items-center justify-center bg-moss-100 p-8 text-center">
        <p className="max-w-sm text-sm">
          Map token missing. Add your Mapbox public token as <code className="font-semibold">VITE_MAPBOX_TOKEN</code> in{" "}
          <code className="font-semibold">frontend/.env</code> and restart <code>npm run dev</code>.
        </p>
      </div>
    );
  }

  return <div ref={containerRef} className="h-full w-full" />;
}