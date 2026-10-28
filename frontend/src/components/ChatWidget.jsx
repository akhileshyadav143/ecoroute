import { useEffect, useRef, useState } from "react";
import { askAI } from "../api";

const SpeechRecognition =
  typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export default function ChatWidget({ mode, vehicleType }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Namaste! Main EcoRoute AI hu. Late ho rahe ho ya raat ka safar hai? Mujhse pooch lo." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [voiceOn, setVoiceOn] = useState(true);
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // Stop any speech when leaving the page
  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const speak = (text) => {
    if (!voiceOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN"; // Roman Hinglish reads best with the Indian English voice
    utter.rate = 1;
    window.speechSynthesis.speak(utter);
  };

  const toggleVoice = () => {
    if (voiceOn) window.speechSynthesis?.cancel();
    setVoiceOn((v) => !v);
  };

  const sendText = async (raw) => {
    const text = raw.trim();
    if (!text || sending) return;
    setMessages((m) => [...m, { role: "user", text }]);
    setInput("");
    setSending(true);
    try {
      const data = await askAI({ userMessage: text, currentMode: mode, vehicleType });
      setMessages((m) => [...m, { role: "ai", text: data.reply }]);
      speak(data.reply);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "ai", text: "Server se connect nahi ho paya. Backend chal raha hai ya nahi check karo.", error: true },
      ]);
    } finally {
      setSending(false);
    }
  };

  const send = (e) => {
    e.preventDefault();
    sendText(input);
  };

  const startListening = () => {
    if (!SpeechRecognition || listening) return;
    window.speechSynthesis?.cancel();
    const rec = new SpeechRecognition();
    rec.lang = "hi-IN";
    rec.interimResults = false;
    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    rec.onresult = (e) => sendText(e.results[0][0].transcript);
    recognitionRef.current = rec;
    rec.start();
  };

  return (
    <section className="flex h-64 flex-col border-t border-moss-200 bg-white" aria-label="EcoRoute AI chat">
      <header className="flex items-center justify-between border-b border-moss-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-moss-600" />
          <h2 className="font-display text-sm font-semibold">EcoRoute AI</h2>
        </div>
        <button
          type="button"
          onClick={toggleVoice}
          aria-pressed={voiceOn}
          className="rounded-md border border-moss-200 px-2 py-1 text-xs font-medium hover:border-moss-600"
        >
          {voiceOn ? "🔊 Voice on" : "🔇 Voice off"}
        </button>
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto px-4 py-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <p
              className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-snug ${
                m.role === "user"
                  ? "rounded-br-sm bg-moss-700 text-white"
                  : m.error
                  ? "rounded-bl-sm bg-signal/10 text-signal"
                  : "rounded-bl-sm bg-moss-100"
              }`}
            >
              {m.text}
            </p>
          </div>
        ))}
        {sending && <p className="text-xs text-ink/50">EcoRoute AI soch raha hai...</p>}
        {listening && <p className="text-xs text-moss-700">🎤 Sun raha hu... boliye</p>}
        <div ref={endRef} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t border-moss-100 p-3">
        {SpeechRecognition && (
          <button
            type="button"
            onClick={startListening}
            disabled={sending}
            aria-label="Bol ke puchho"
            className={`rounded-lg border px-3 text-base ${
              listening ? "border-signal bg-signal/10" : "border-moss-200 hover:border-moss-600"
            } disabled:opacity-40`}
          >
            🎤
          </button>
        )}
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Late ho raha hu kya karu?"
          className="flex-1 rounded-lg border border-moss-200 px-3 py-2 text-sm outline-none focus:border-moss-600"
        />
        <button
          type="submit"
          disabled={sending || !input.trim()}
          className="rounded-lg bg-moss-700 px-4 text-sm font-medium text-white disabled:opacity-40"
        >
          Send
        </button>
      </form>
    </section>
  );
}