import { useState, useEffect } from "react";

const API = "https://mindlog-ai-backend.onrender.com/api";

const AMBIENCE = {
  forest: {
    emoji: "🌲",
    label: "Forest",
    color: "#2d6a4a",
    bg: "#e8f5ee",
    border: "#a8d8bc",
  },
  ocean: {
    emoji: "🌊",
    label: "Ocean",
    color: "#1a5a8a",
    bg: "#e0f0fa",
    border: "#9ac4e8",
  },
  mountain: {
    emoji: "⛰️",
    label: "Mountain",
    color: "#7a4a2a",
    bg: "#f5ece0",
    border: "#d4b090",
  },
};

const EMO_COLOR = {
  calm: "#2d7a5a",
  happy: "#b87a0a",
  peaceful: "#1a6a8a",
  grateful: "#6a4aa0",
  sad: "#3a6a9a",
  anxious: "#c45a2a",
  excited: "#c43050",
  hopeful: "#2a8a5a",
  overwhelmed: "#a03030",
  neutral: "#7a7a7a",
  joyful: "#b87a0a",
  relaxed: "#2d7a5a",
};
const ec = (e) => EMO_COLOR[(e || "").toLowerCase()] || "#2d7a5a";

const emojiFor = (e) => {
  const map = {
    calm: "😌",
    calmness: "😌",
    happy: "😊",
    happiness: "😊",
    joyful: "😄",
    joy: "😄",
    excited: "😃",
    excitement: "😃",
    peaceful: "😇",
    peace: "😇",
    grateful: "🙏",
    gratitude: "🙏",
    hopeful: "🤞",
    hope: "🤞",
    relaxed: "😎",
    relaxation: "😎",
    love: "🥰",
    loving: "🥰",
    proud: "🏆",
    pride: "🏆",
    surprised: "😲",
    surprise: "😲",
    content: "🙂",
    contentment: "🙂",
    optimistic: "⭐",
    optimism: "⭐",
    cheerful: "😁",
    cheerfulness: "😁",
    elated: "🎉",
    elation: "🎉",
    enthusiastic: "🔥",
    enthusiasm: "🔥",
    inspired: "💡",
    inspiration: "💡",
    motivated: "💪",
    motivation: "💪",
    energetic: "⚡",
    energy: "⚡",
    playful: "😜",
    playfulness: "😜",
    confident: "😤",
    confidence: "😤",
    satisfied: "😌",
    satisfaction: "😌",
    ecstatic: "🤩",
    ecstasy: "🤩",
    blissful: "😇",
    bliss: "😇",
    warm: "🤗",
    warmth: "🤗",
    affectionate: "💗",
    affection: "💗",
    nostalgic: "🥲",
    nostalgia: "🥲",
    sad: "😢",
    sadness: "😢",
    anxious: "😟",
    anxiety: "😟",
    stressed: "😰",
    stress: "😰",
    overwhelmed: "😩",
    overwhelm: "😩",
    angry: "😡",
    anger: "😡",
    frustrated: "😠",
    frustration: "😠",
    fearful: "😨",
    fear: "😨",
    pain: "🤕",
    hurt: "🤕",
    grief: "😭",
    grieving: "😭",
    lonely: "🥺",
    loneliness: "🥺",
    confused: "😕",
    confusion: "😕",
    bored: "😑",
    boredom: "😑",
    guilty: "😔",
    guilt: "😔",
    shame: "😓",
    ashamed: "😓",
    disgust: "🤢",
    disgusted: "🤢",
    disappointed: "😞",
    disappointment: "😞",
    worried: "😧",
    worry: "�47",
    nervous: "😬",
    nervousness: "😬",
    embarrassed: "😳",
    embarrassment: "😳",
    jealous: "😒",
    jealousy: "😒",
    envious: "😒",
    envy: "😒",
    regretful: "😟",
    regret: "😟",
    hopeless: "😿",
    helpless: "😦",
    depressed: "😓",
    depression: "😓",
    melancholy: "😔",
    melancholic: "😔",
    rejected: "💔",
    rejection: "💔",
    betrayed: "😤",
    betrayal: "😤",
    restless: "😤",
    irritated: "😒",
    anguish: "😣",
    distress: "😣",
    despair: "😞",
    heartbreak: "😔",
    tired: "😴",
    exhausted: "😴",
    exhaustion: "😴",
    neutral: "😐",
  };
  return map[(e || "").toLowerCase()] || "💭";
};

export default function App() {
  const [tab, setTab] = useState("write");
  const [userId, setUserId] = useState("user_1");
  const [ambience, setAmbience] = useState("forest");
  const [text, setText] = useState("");
  const [entries, setEntries] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(null);
  const [results, setResults] = useState({});
  const [toast, setToast] = useState(null);
  const [focused, setFocused] = useState(false);

  const today = new Date()
    .toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
    .toUpperCase();

  useEffect(() => {
    if (tab === "entries") fetchEntries();
    if (tab === "insights") fetchInsights();
  }, [tab, userId]);

  const showToast = (type, msg) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEntries = async () => {
    try {
      setEntries(await (await fetch(`${API}/journal/${userId}`)).json());
    } catch {
      showToast("err", "Failed to load entries");
    }
  };

  const fetchInsights = async () => {
    try {
      setInsights(
        await (await fetch(`${API}/journal/insights/${userId}`)).json(),
      );
    } catch {
      showToast("err", "Failed to load insights");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, ambience, text }),
      });
      if (!r.ok) throw new Error((await r.json()).error);
      showToast("ok", "Entry saved!");
      setText("");
    } catch (err) {
      showToast("err", err.message);
    }
    setLoading(false);
  };

  const analyze = async (entry) => {
    setAnalyzing(entry.id);
    setResults((prev) => ({
      ...prev,
      [entry.id]: { streaming: true, streamText: "" },
    }));
    try {
      const r = await fetch(`${API}/journal/analyze/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: entry.text, entryId: entry.id }),
      });
      const reader = r.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const lines = decoder
          .decode(value)
          .split("\n")
          .filter((l) => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const json = JSON.parse(line.slice(5));
            if (json.chunk)
              setResults((prev) => ({
                ...prev,
                [entry.id]: {
                  streaming: true,
                  streamText: (prev[entry.id]?.streamText || "") + json.chunk,
                },
              }));
            if (json.done && json.result) {
              setResults((prev) => ({
                ...prev,
                [entry.id]: { ...json.result, streaming: false },
              }));
              fetchEntries();
            }
          } catch {}
        }
      }
    } catch {
      showToast("err", "Analysis failed");
    }
    setAnalyzing(null);
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#faf7f2" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        body{background:#faf7f2;}
        textarea{resize:none!important;-webkit-resize:none!important;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        .emoji{font-family:"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif!important;}
        .nbtn:hover{background:#fdf0e0!important;color:#c8960a!important;}
        .acard:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,0.08)!important;}
        .ecard:hover{box-shadow:0 6px 24px rgba(0,0,0,0.07)!important;transform:translateY(-1px);}
        .abtn:hover{border-color:#c8960a!important;color:#c8960a!important;background:#fdf8ee!important;}
        .kpill:hover{background:#c8960a!important;color:#fff!important;border-color:#c8960a!important;}
        .icard:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,0.06)!important;}
      `}</style>

      {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            zIndex: 9999,
            padding: "12px 20px",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "Outfit,sans-serif",
            background: toast.type === "ok" ? "#f0fdf4" : "#fef2f2",
            border: `1.5px solid ${toast.type === "ok" ? "#86efac" : "#fca5a5"}`,
            color: toast.type === "ok" ? "#166534" : "#991b1b",
            boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          }}
        >
          {toast.type === "ok" ? "✓" : "✕"} {toast.msg}
        </div>
      )}

      {/* SIDEBAR */}
      <aside
        style={{
          width: 240,
          minWidth: 240,
          background: "#ffffff",
          borderRight: "1.5px solid #e5d8c5",
          display: "flex",
          flexDirection: "column",
          padding: "36px 20px",
          position: "sticky",
          top: 0,
          height: "100vh",
          boxShadow: "2px 0 16px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              fontSize: 10,
              letterSpacing: 3,
              color: "#c8960a",
              textTransform: "uppercase",
              fontFamily: "Outfit,sans-serif",
              marginBottom: 6,
            }}
          >
            AI Journal
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 700,
              color: "#1a1510",
              fontFamily: "Outfit,sans-serif",
              lineHeight: 1,
            }}
          >
            Mind<span style={{ color: "#c8960a" }}>Log</span>
          </div>
          <div
            style={{
              fontSize: 11,
              color: "#8a7d6e",
              marginTop: 8,
              lineHeight: 1.5,
              fontFamily: "Outfit,sans-serif",
            }}
          >
            Nature-assisted mental wellness journaling
          </div>
        </div>

        <nav
          style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}
        >
          {[
            ["write", "✍", "Write Entry"],
            ["entries", "◈", "My Entries"],
            ["insights", "◎", "Insights"],
          ].map(([key, icon, label]) => (
            <button
              key={key}
              className="nbtn"
              onClick={() => setTab(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 10,
                border: "none",
                background: tab === key ? "#fdf0e0" : "transparent",
                color: tab === key ? "#c8960a" : "#6a5a4a",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                width: "100%",
                textAlign: "left",
                fontFamily: "Outfit,sans-serif",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 15 }} className="emoji">
                {icon}
              </span>
              {label}
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: tab === key ? "#c8960a" : "#e5d8c5",
                  marginLeft: "auto",
                }}
              />
            </button>
          ))}
        </nav>

        <div style={{ paddingTop: 20, borderTop: "1.5px solid #e5d8c5" }}>
          <div
            style={{
              fontSize: 9,
              letterSpacing: 2,
              color: "#8a7d6e",
              textTransform: "uppercase",
              fontFamily: "monospace",
              marginBottom: 8,
            }}
          >
            Session User
          </div>
          <input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            style={{
              width: "100%",
              background: "#faf7f2",
              border: "1.5px solid #e5d8c5",
              borderRadius: 8,
              padding: "9px 12px",
              color: "#1a1510",
              fontSize: 14,
              fontFamily: "Outfit,sans-serif",
              outline: "none",
            }}
          />
        </div>
      </aside>

      {/* MAIN */}
      <main
        style={{
          flex: 1,
          padding: "48px 40px 48px 56px",
          background: "#faf7f2",
          minWidth: 0,
          display: "flex",
          gap: 28,
          alignItems: "flex-start",
        }}
      >
        {/* LEFT — content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 10,
              color: "#8a7d6e",
              letterSpacing: 2,
              fontFamily: "monospace",
              marginBottom: 6,
            }}
          >
            {today}
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 300,
              color: "#1a1510",
              lineHeight: 1.1,
              marginBottom: 4,
              fontFamily: "Georgia,serif",
            }}
          >
            {tab === "write" && (
              <>
                <em style={{ color: "#c8960a" }}>Write</em> your entry
              </>
            )}
            {tab === "entries" && (
              <>
                <em style={{ color: "#c8960a" }}>My</em> journal
              </>
            )}
            {tab === "insights" && (
              <>
                Wellness <em style={{ color: "#c8960a" }}>insights</em>
              </>
            )}
          </div>
          <div
            style={{
              height: 2,
              background: "linear-gradient(to right,#c8960a88,transparent)",
              margin: "14px 0 32px",
            }}
          />

          {/* WRITE */}
          {tab === "write" && (
            <form onSubmit={submit} style={{ width: "100%" }}>
              <div
                style={{
                  fontSize: 9,
                  letterSpacing: 2.5,
                  color: "#8a7d6e",
                  textTransform: "uppercase",
                  fontFamily: "monospace",
                  marginBottom: 12,
                }}
              >
                Choose Your Ambience
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3,1fr)",
                  gap: 12,
                  marginBottom: 28,
                }}
              >
                {Object.entries(AMBIENCE).map(([key, a]) => (
                  <div
                    key={key}
                    className="acard"
                    onClick={() => setAmbience(key)}
                    style={{
                      background: ambience === key ? a.bg : "#fff",
                      border: `1.5px solid ${ambience === key ? a.border : "#e5d8c5"}`,
                      borderRadius: 14,
                      padding: "24px 16px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.25s",
                      position: "relative",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      className="emoji"
                      style={{ fontSize: 30, marginBottom: 10 }}
                    >
                      {a.emoji}
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        color: ambience === key ? a.color : "#8a7d6e",
                        fontFamily: "Outfit,sans-serif",
                      }}
                    >
                      {a.label}
                    </div>
                    {ambience === key && (
                      <span
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: a.color,
                          color: "#fff",
                          fontSize: 10,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ✓
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div
                style={{
                  background: "#fff",
                  border: `1.5px solid ${focused ? "#c8960a" : "#e5d8c5"}`,
                  borderRadius: 16,
                  padding: 24,
                  position: "relative",
                  boxShadow: focused
                    ? "0 0 0 3px #c8960a15"
                    : "0 2px 8px rgba(0,0,0,0.04)",
                  transition: "all 0.2s",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: -10,
                    left: 16,
                    background: "#fff",
                    padding: "0 8px",
                    fontSize: 11,
                    color: "#8a7d6e",
                    fontStyle: "italic",
                    fontFamily: "Georgia,serif",
                  }}
                >
                  Today's Reflection
                </span>
                <textarea
                  rows={8}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  placeholder="Describe your experience... what did you feel, hear, or notice in nature today?"
                  style={{
                    width: "100%",
                    border: "none",
                    outline: "none",
                    resize: "none",
                    fontFamily: "Georgia,serif",
                    fontSize: 16,
                    lineHeight: 1.9,
                    color: "#1a1510",
                    background: "transparent",
                    display: "block",
                    minHeight: 200,
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: 14,
                    borderTop: "1px solid #f0e8d8",
                    marginTop: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      color: "#8a7d6e",
                      fontFamily: "monospace",
                    }}
                  >
                    {text.length} characters
                  </span>
                  <button
                    type="submit"
                    disabled={loading || !text.trim()}
                    style={{
                      background: loading || !text.trim() ? "#ccc" : "#1a1510",
                      color: "#faf7f2",
                      border: "none",
                      borderRadius: 10,
                      padding: "11px 28px",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor:
                        loading || !text.trim() ? "not-allowed" : "pointer",
                      fontFamily: "Outfit,sans-serif",
                    }}
                  >
                    {loading ? "Saving..." : "Save entry →"}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* ENTRIES */}
          {tab === "entries" && (
            <div>
              {entries.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "80px 0",
                    color: "#8a7d6e",
                  }}
                >
                  <div style={{ fontSize: 44, marginBottom: 16, opacity: 0.3 }}>
                    ✍
                  </div>
                  <div
                    style={{
                      fontFamily: "Georgia,serif",
                      fontStyle: "italic",
                      fontSize: 19,
                    }}
                  >
                    No entries yet — begin your journey.
                  </div>
                </div>
              ) : (
                entries.map((entry) => {
                  const a = AMBIENCE[entry.ambience] || AMBIENCE.forest;
                  const res = results[entry.id];
                  return (
                    <div
                      key={entry.id}
                      className="ecard"
                      style={{
                        background: "#fff",
                        border: "1.5px solid #e5d8c5",
                        borderRadius: 16,
                        overflow: "hidden",
                        marginBottom: 16,
                        transition: "all 0.2s",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div
                        style={{
                          height: 3,
                          background: `linear-gradient(to right,${a.color},transparent)`,
                        }}
                      />
                      <div style={{ padding: "20px 24px" }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: 14,
                            flexWrap: "wrap",
                            gap: 8,
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              alignItems: "center",
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 5,
                                padding: "4px 12px",
                                borderRadius: 20,
                                fontSize: 10,
                                fontWeight: 700,
                                letterSpacing: 0.5,
                                textTransform: "uppercase",
                                background: a.bg,
                                color: a.color,
                                border: `1px solid ${a.border}`,
                                fontFamily: "Outfit,sans-serif",
                              }}
                            >
                              <span className="emoji" style={{ fontSize: 14 }}>
                                {a.emoji}
                              </span>{" "}
                              {a.label}
                            </span>
                            {entry.emotion && (
                              <span
                                style={{
                                  padding: "4px 12px",
                                  borderRadius: 20,
                                  fontSize: 11,
                                  fontWeight: 600,
                                  background: `${ec(entry.emotion)}18`,
                                  color: ec(entry.emotion),
                                  border: `1px solid ${ec(entry.emotion)}33`,
                                  fontFamily: "Outfit,sans-serif",
                                  textTransform: "capitalize",
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 5,
                                }}
                              >
                                <span
                                  className="emoji"
                                  style={{ fontSize: 13 }}
                                >
                                  {emojiFor(entry.emotion)}
                                </span>
                                {entry.emotion}
                              </span>
                            )}
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              color: "#8a7d6e",
                              fontFamily: "monospace",
                            }}
                          >
                            {new Date(entry.createdAt).toLocaleDateString(
                              "en-IN",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <p
                          style={{
                            fontFamily: "Georgia,serif",
                            fontSize: 15,
                            lineHeight: 1.8,
                            color: "#2a1f14",
                            marginBottom: 14,
                            fontStyle: "italic",
                          }}
                        >
                          {entry.text}
                        </p>
                        {entry.summary && (
                          <p
                            style={{
                              fontFamily: "Georgia,serif",
                              fontStyle: "italic",
                              fontSize: 13,
                              color: "#8a7d6e",
                              borderLeft: `2px solid ${a.color}55`,
                              paddingLeft: 12,
                              marginBottom: 12,
                              lineHeight: 1.6,
                            }}
                          >
                            {entry.summary}
                          </p>
                        )}
                        {entry.keywords?.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              gap: 6,
                              flexWrap: "wrap",
                              marginBottom: 14,
                            }}
                          >
                            {entry.keywords.map((k) => (
                              <span
                                key={k}
                                style={{
                                  background: "#faf7f2",
                                  border: "1px solid #e5d8c5",
                                  borderRadius: 20,
                                  padding: "2px 10px",
                                  fontSize: 10,
                                  color: "#8a7d6e",
                                  fontFamily: "monospace",
                                }}
                              >
                                #{k}
                              </span>
                            ))}
                          </div>
                        )}
                        {!entry.analyzed && (
                          <button
                            className="abtn"
                            onClick={() => analyze(entry)}
                            disabled={analyzing === entry.id}
                            style={{
                              background: "#fff",
                              border: "1.5px solid #e5d8c5",
                              borderRadius: 8,
                              padding: "8px 18px",
                              color: "#6a5a4a",
                              fontSize: 11,
                              fontWeight: 700,
                              cursor: "pointer",
                              letterSpacing: 0.5,
                              textTransform: "uppercase",
                              fontFamily: "Outfit,sans-serif",
                              transition: "all 0.2s",
                            }}
                          >
                            {analyzing === entry.id
                              ? "⏳ Analyzing..."
                              : "◎ Analyze Emotion"}
                          </button>
                        )}
                        {res && (
                          <div
                            style={{
                              background: "#fdf8ee",
                              border: "1.5px solid #ead9b0",
                              borderRadius: 12,
                              padding: 16,
                              marginTop: 12,
                            }}
                          >
                            {res.streaming ? (
                              <>
                                <div
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 700,
                                    color: "#c8960a",
                                    marginBottom: 6,
                                    fontFamily: "Outfit,sans-serif",
                                  }}
                                >
                                  Analyzing…
                                </div>
                                <div
                                  style={{
                                    fontSize: 12,
                                    color: "#8a7d6e",
                                    fontFamily: "monospace",
                                    lineHeight: 1.6,
                                    whiteSpace: "pre-wrap",
                                  }}
                                >
                                  {res.streamText}
                                  <span
                                    style={{
                                      display: "inline-block",
                                      width: 2,
                                      height: 12,
                                      background: "#c8960a",
                                      marginLeft: 2,
                                      verticalAlign: "middle",
                                      animation: "blink 1s step-end infinite",
                                    }}
                                  />
                                </div>
                              </>
                            ) : (
                              <>
                                <div
                                  style={{
                                    fontFamily: "Georgia,serif",
                                    fontSize: 20,
                                    fontWeight: 600,
                                    color: ec(res.emotion),
                                    marginBottom: 6,
                                    textTransform: "capitalize",
                                  }}
                                >
                                  <span
                                    className="emoji"
                                    style={{ marginRight: 6 }}
                                  >
                                    {emojiFor(res.emotion)}
                                  </span>
                                  {res.emotion}
                                </div>
                                <div
                                  style={{
                                    fontFamily: "Georgia,serif",
                                    fontStyle: "italic",
                                    fontSize: 13,
                                    color: "#6a5a4a",
                                    marginBottom: 12,
                                    lineHeight: 1.6,
                                  }}
                                >
                                  {res.summary}
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: 6,
                                    flexWrap: "wrap",
                                  }}
                                >
                                  {res.keywords?.map((k) => (
                                    <span
                                      key={k}
                                      style={{
                                        background: "#fff",
                                        border: "1px solid #e5d8c5",
                                        borderRadius: 20,
                                        padding: "3px 12px",
                                        fontSize: 10,
                                        color: "#8a7d6e",
                                        fontFamily: "monospace",
                                      }}
                                    >
                                      #{k}
                                    </span>
                                  ))}
                                </div>
                                {res.fromCache && (
                                  <div
                                    style={{
                                      display: "inline-flex",
                                      gap: 4,
                                      alignItems: "center",
                                      fontSize: 10,
                                      color: "#c8960a",
                                      border: "1px solid #e5d8c5",
                                      background: "#fff",
                                      borderRadius: 20,
                                      padding: "2px 10px",
                                      marginTop: 8,
                                      fontFamily: "monospace",
                                    }}
                                  >
                                    ⚡ cached
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* INSIGHTS */}
          {tab === "insights" &&
            (!insights ? (
              <p
                style={{
                  color: "#8a7d6e",
                  fontStyle: "italic",
                  paddingTop: 40,
                  fontFamily: "Georgia,serif",
                  fontSize: 16,
                }}
              >
                Loading…
              </p>
            ) : insights.totalEntries === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "80px 0",
                  color: "#8a7d6e",
                }}
              >
                <div style={{ fontSize: 44, marginBottom: 16, opacity: 0.3 }}>
                  ◎
                </div>
                <div
                  style={{
                    fontFamily: "Georgia,serif",
                    fontStyle: "italic",
                    fontSize: 19,
                  }}
                >
                  Write and analyze entries to unlock insights.
                </div>
              </div>
            ) : (
              <>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4,1fr)",
                    gap: 14,
                    marginBottom: 16,
                  }}
                >
                  {[
                    ["📓", "Total Entries", insights.totalEntries, false],
                    ["😌", "Top Emotion", insights.topEmotion || "—", true],
                    [
                      AMBIENCE[insights.mostUsedAmbience]?.emoji || "🌿",
                      "Fav Ambience",
                      insights.mostUsedAmbience || "—",
                      true,
                    ],
                    [
                      "✦",
                      "Keywords Tracked",
                      insights.recentKeywords?.length || 0,
                      false,
                    ],
                  ].map(([icon, label, val, sm]) => (
                    <div
                      key={label}
                      className="icard"
                      style={{
                        background: "#fff",
                        border: "1.5px solid #e5d8c5",
                        borderRadius: 16,
                        padding: 24,
                        transition: "all 0.2s",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                      }}
                    >
                      <div
                        className="emoji"
                        style={{ fontSize: 28, marginBottom: 12 }}
                      >
                        {icon}
                      </div>
                      <div
                        style={{
                          fontSize: 10,
                          color: "#8a7d6e",
                          letterSpacing: 2,
                          textTransform: "uppercase",
                          marginBottom: 8,
                          fontFamily: "monospace",
                        }}
                      >
                        {label}
                      </div>
                      <div
                        style={{
                          fontFamily: "Georgia,serif",
                          fontSize: sm ? 20 : 32,
                          fontStyle: sm ? "italic" : "normal",
                          fontWeight: sm ? 400 : 700,
                          color: sm ? "#1a1510" : "#c8960a",
                          lineHeight: 1,
                          textTransform: "capitalize",
                        }}
                      >
                        {val}
                      </div>
                    </div>
                  ))}
                </div>
                {insights.recentKeywords?.length > 0 && (
                  <div
                    style={{
                      background: "#fff",
                      border: "1.5px solid #e5d8c5",
                      borderRadius: 16,
                      padding: 24,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "Georgia,serif",
                        fontSize: 17,
                        color: "#1a1510",
                        marginBottom: 16,
                      }}
                    >
                      Recent <em style={{ color: "#c8960a" }}>keywords</em>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {insights.recentKeywords.map((k) => (
                        <span
                          key={k}
                          className="kpill"
                          style={{
                            display: "inline-block",
                            background: "#faf7f2",
                            border: "1.5px solid #e5d8c5",
                            borderRadius: 20,
                            padding: "7px 18px",
                            fontSize: 13,
                            color: "#6a5a4a",
                            fontWeight: 600,
                            cursor: "default",
                            fontFamily: "Outfit,sans-serif",
                            transition: "all 0.2s",
                          }}
                        >
                          #{k}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ))}
        </div>

        {/* RIGHT PANEL */}
        <div
          style={{
            width: 240,
            minWidth: 240,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            paddingTop: 80,
          }}
        >
          {/* Nature tip card */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e5d8c5",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#c8960a",
                textTransform: "uppercase",
                fontFamily: "monospace",
                marginBottom: 10,
              }}
            >
              Today's Tip
            </div>
            <p
              style={{
                fontFamily: "Georgia,serif",
                fontStyle: "italic",
                fontSize: 13,
                color: "#6a5a4a",
                lineHeight: 1.7,
              }}
            >
              {
                [
                  "Spending just 20 minutes in nature significantly lowers cortisol — your body's stress hormone.",
                  "Writing about your feelings helps your brain process emotions and reduces mental load.",
                  "Nature restores attention and reduces mental fatigue better than any screen.",
                  "Journaling daily for 5 minutes improves emotional clarity over time.",
                  "The sound of water — rain, rivers, oceans — naturally calms the nervous system.",
                  "Trees release compounds called phytoncides that boost your immune system.",
                  "Walking in a forest lowers blood pressure and heart rate within minutes.",
                  "Expressing gratitude in writing rewires the brain toward positivity.",
                  "Sunlight in nature resets your body clock and improves sleep quality.",
                  "Being in green spaces reduces symptoms of anxiety and depression.",
                ][new Date().getDate() % 10]
              }
            </p>
          </div>

          {/* Ambience guide */}
          <div
            style={{
              background: "#fff",
              border: "1.5px solid #e5d8c5",
              borderRadius: 16,
              padding: 20,
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#c8960a",
                textTransform: "uppercase",
                fontFamily: "monospace",
                marginBottom: 12,
              }}
            >
              Ambience Guide
            </div>
            {[
              { emoji: "🌲", label: "Forest", desc: "Calm & focus" },
              { emoji: "🌊", label: "Ocean", desc: "Release & peace" },
              { emoji: "⛰️", label: "Mountain", desc: "Strength & clarity" },
            ].map((a) => (
              <div
                key={a.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                <span className="emoji" style={{ fontSize: 22 }}>
                  {a.emoji}
                </span>
                <div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#1a1510",
                      fontFamily: "Outfit,sans-serif",
                    }}
                  >
                    {a.label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "#8a7d6e",
                      fontFamily: "Outfit,sans-serif",
                    }}
                  >
                    {a.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Streak card */}
          <div
            style={{
              background: "linear-gradient(135deg,#fdf0e0,#fff7ed)",
              border: "1.5px solid #ead9b0",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <div
              style={{
                fontSize: 10,
                letterSpacing: 2,
                color: "#c8960a",
                textTransform: "uppercase",
                fontFamily: "monospace",
                marginBottom: 8,
              }}
            >
              Your Journey
            </div>
            <div
              style={{
                fontFamily: "Georgia,serif",
                fontSize: 28,
                fontWeight: 700,
                color: "#c8960a",
                lineHeight: 1,
              }}
            >
              MindLog
            </div>
            <p
              style={{
                fontFamily: "Outfit,sans-serif",
                fontSize: 12,
                color: "#8a7d6e",
                marginTop: 8,
                lineHeight: 1.5,
              }}
            >
              Write daily, grow mindfully.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
