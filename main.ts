const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// HTML Homepage
const homepage = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tamrini API</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(135deg, #2C3E50, #3498DB);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .container { max-width: 500px; }
    .logo { font-size: 80px; margin-bottom: 20px; }
    h1 { font-size: 2.5rem; margin-bottom: 10px; }
    .tagline { color: #BDC3C7; margin-bottom: 30px; }
    .status {
      background: rgba(255,255,255,0.1);
      padding: 20px;
      border-radius: 15px;
    }
    .badge {
      background: #27AE60;
      padding: 5px 15px;
      border-radius: 20px;
      font-size: 0.9rem;
      display: inline-block;
      margin-bottom: 15px;
    }
    code {
      background: rgba(0,0,0,0.3);
      padding: 10px 20px;
      border-radius: 8px;
      font-family: monospace;
      display: block;
    }
    .powered {
      margin-top: 30px;
      font-size: 0.8rem;
      color: #BDC3C7;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">📐</div>
    <h1>Tamrini API</h1>
    <p class="tagline">Math Tutoring for Students 12-18</p>
    <div class="status">
      <span class="badge">✓ Online</span>
      <p>API Endpoint:</p>
      <code>POST /api/chat</code>
    </div>
    <p class="powered">🦕 Powered by Deno Deploy</p>
  </div>
</body>
</html>
`;

// Chat handler
async function handleChat(req: Request): Promise<Response> {
  try {
    const body = await req.json();
    const { question, language = "en", history = [] } = body;

    if (!question) {
      return new Response(
        JSON.stringify({ error: "Question is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!GOOGLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

    const languageInstructions: Record<string, string> = {
      en: "Respond in English.",
      fr: "Réponds en français.",
      ar: "أجب باللغة العربية.",
    };

    const systemPrompt = `
You are Tamrini, a friendly and encouraging math tutor for students aged 12-18.

YOUR RULES:
1. NEVER give direct answers to math problems
2. Ask guiding questions to help students think
3. Break problems into smaller steps
4. Celebrate small wins and encourage them
5. Use simple, age-appropriate language
6. If they're stuck, give gentle hints
7. Use emojis occasionally to be friendly 😊

${languageInstructions[language] || languageInstructions.en}

CONVERSATION HISTORY:
${history.map((msg: {role: string, content: string}) => `${msg.role}: ${msg.content}`).join("\n") || "New conversation"}

STUDENT'S QUESTION: ${question}

YOUR HELPFUL RESPONSE:
`;

    const response = await fetch(`${API_URL}?key=${GOOGLE_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: systemPrompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini Error:", data);
      return new Response(
        JSON.stringify({ error: "Gemini API error", details: data.error?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return new Response(
        JSON.stringify({ error: "No response from Gemini" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process request" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

// Main handler
Deno.serve((req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Homepage
  if (path === "/" && req.method === "GET") {
    return new Response(homepage, {
      headers: { ...corsHeaders, "Content-Type": "text/html" },
    });
  }

  // Health check
  if (path === "/api/health") {
    return new Response(
      JSON.stringify({ status: "ok", timestamp: new Date().toISOString() }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Chat endpoint
  if (path === "/api/chat" && req.method === "POST") {
    return handleChat(req);
  }

  // 404 for everything else
  return new Response(
    JSON.stringify({ error: "Not found" }),
    { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
