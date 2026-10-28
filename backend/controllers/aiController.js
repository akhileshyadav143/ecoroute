import { GoogleGenerativeAI } from "@google/generative-ai";

const FALLBACK = {
  URGENT: "Bhai, Urgent mode me jam wale rasto se bach ke chalo. Abhi nikal jao aur sabse fast route pakdo, time pe pahunch jaoge.",
  NIGHT: "Raat ka safar hai, isliye sirf street light wale route lo. Speed kam rakho aur apni location kisi dost ko share kar do.",
  NORMAL: "Normal route chalega, lekin thoda jaldi nikalna better hai. Traffic badhne se pehle nikal jao.",
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// POST /api/ai-assistant  { userMessage, currentMode, vehicleType }
export const askAssistant = async (req, res) => {
  const { userMessage, currentMode = "NORMAL", vehicleType = "PETROL_CAR" } = req.body;

  if (!userMessage || typeof userMessage !== "string" || !userMessage.trim()) {
    return res.status(400).json({ message: "userMessage is required" });
  }

  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "your_gemini_api_key_here") {
    return res.json({ reply: FALLBACK[currentMode] || FALLBACK.NORMAL, source: "fallback" });
  }

  const genAI = new GoogleGenerativeAI(key);

  // Pehle main model, busy ho to backup model
  const models = [
    process.env.GEMINI_MODEL || "gemini-3.8-flash",
    process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash",
  ];

  const prompt =
    `Current routing mode: ${currentMode}\nVehicle: ${vehicleType}\n` +
    `Mode meanings: URGENT = avoid jams and bad roads to arrive on time, NIGHT = only lit roads for safety, NORMAL = shortest path.\n` +
    `User says: "${userMessage.trim().slice(0, 500)}"`;

  for (const modelName of models) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          systemInstruction:
            "You are EcoRoute AI, a friendly commute assistant. Always reply in Hinglish (Hindi written in English letters mixed with simple English). " +
            "Reply in only 2-3 short sentences. Give practical advice to reach work/college on time or stay safe on the road. " +
            "Never use markdown or bullet points.",
        });
        const result = await model.generateContent(prompt);
        return res.json({ reply: result.response.text().trim(), source: modelName });
      } catch (err) {
        console.error(`Gemini error (${modelName}, try ${attempt}):`, err.message.slice(0, 150));
        await sleep(1000);
      }
    }
  }

  res.json({ reply: FALLBACK[currentMode] || FALLBACK.NORMAL, source: "fallback" });
};