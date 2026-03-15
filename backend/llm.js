const NodeCache = require("node-cache");
const analysisCache = new NodeCache({ stdTTL: 3600 });

const PROMPT = (text) =>
  `Analyze the emotion in this journal entry. Respond ONLY with valid JSON, no markdown:\n{\n  "emotion": "<single emotion word>",\n  "keywords": ["word1", "word2", "word3"],\n  "summary": "<one sentence about user mental state>"\n}\n\nJournal entry: "${text}"`;

// ── Standard (non-streaming) ──
async function analyzeEmotion(text) {
  const cacheKey = Buffer.from(text.trim().toLowerCase()).toString("base64").slice(0, 64);
  const cached = analysisCache.get(cacheKey);
  if (cached) return { ...cached, fromCache: true };

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      max_tokens: 300,
      messages: [{ role: "user", content: PROMPT(text) }],
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(JSON.stringify(data));

  const raw = data.choices[0].message.content.trim();
  let result;
  try { result = JSON.parse(raw); }
  catch { const m = raw.match(/\{[\s\S]*\}/); if (!m) throw new Error("Invalid JSON"); result = JSON.parse(m[0]); }

  analysisCache.set(cacheKey, result);
  return result;
}

// ── Streaming ── (bonus feature)
async function analyzeEmotionStream(text, onChunk) {
  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
    body: JSON.stringify({
      model: "llama-3.1-8b-instant",
      max_tokens: 300,
      stream: true,
      messages: [{ role: "user", content: PROMPT(text) }],
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(JSON.stringify(err));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const lines = decoder.decode(value).split("\n").filter(l => l.startsWith("data: "));
    for (const line of lines) {
      const payload = line.slice(6);
      if (payload === "[DONE]") break;
      try {
        const json = JSON.parse(payload);
        const chunk = json.choices?.[0]?.delta?.content;
        if (chunk) onChunk(chunk);
      } catch { /* skip malformed */ }
    }
  }
}

module.exports = { analyzeEmotion, analyzeEmotionStream };
