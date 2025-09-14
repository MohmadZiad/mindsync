let _client: any = null;

export async function getOpenAI() {
  if (_client) return _client;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("❌ OPENAI_API_KEY is missing. Add it in your .env file");
  }

  const OpenAI = (await import("openai")).default;
  _client = new OpenAI({ apiKey });
  console.log("✅ OpenAI client initialized with model:", process.env.LLM_MODEL ?? "default");
  return _client;
}
