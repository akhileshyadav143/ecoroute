import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 20000,
});

export const fetchRoutes = async (mode, vehicleType) => {
  const { data } = await api.get("/routes", { params: { mode, vehicleType } });
  return data;
};

export const askAI = async ({ userMessage, currentMode, vehicleType }) => {
  const { data } = await api.post("/ai-assistant", { userMessage, currentMode, vehicleType });
  return data;
};

export const reportAlert = async (payload) => {
  const { data } = await api.post("/routes/alerts", payload);
  return data;
};

export default api;
