let _client: any = null;

export async function getOpenAI() {
  if (_client) return _client;
  const OpenAI = (await import("openai")).default;
  _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
  return _client;
}
