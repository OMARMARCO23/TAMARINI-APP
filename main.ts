const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  // Homepage
  if (path === "/") {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tamrini API</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #2C3E50, #3498DB);
            color: white;
            text-align: center;
          }
          h1 { font-size: 3rem; }
          .badge { background: #27AE60; padding: 8px 20px; border-radius: 20px; }
          code { background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; display: block; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div>
          <h1>📐 Tamrini API</h1>
          <p>Math Tutoring for Students</p>
          <p class="badge">✓ Online</p>
          <code>POST /api/chat</code>
        </div>
      </body>
      </html>
    `;
    return new Response(html, { 
      headers: { ...headers, "Content-Type": "text/html" } 
    });
  }

  // Health check
  if (path === "/api/health") {
    return new Response(JSON.stringify({ status: "ok" }), { headers });
  }

  // Chat endpoint
  if (path === "/api/chat" && req.method === "POST") {
    try {
      const body = await req.json();
      const { question, language = "en", history = [] } = body;

      if (!question) {
        return new Response(
          JSON.stringify({ error: "Question is required" }),
          { status: 400, headers }
        );
      }

      if (!GOOGLE_API_KEY) {
        return new Response(
          JSON.stringify({ error: "API key not configured" }),
          { status: 500, headers }
        );
      }

      const langText: Record<string, string> = {
        en: "Respond in English.",
        fr: "Réponds en français.",
        ar: "أجب باللغة العربية.",
      };

      const prompt = `
You are Tamrini, a friendly math tutor for students aged 12-18.

RULES:
- NEVER give direct answers
- Ask guiding questions
- Break problems into steps
- Encourage the student
- Use simple language
- Use emojis occasionally 😊

${langText[language] || langText.en}

History: ${JSON.stringify(history)}

Student: ${question}

Your response:`;

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GOOGLE_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        return new Response(
          JSON.stringify({ error: "Gemini error", details: data.error?.message }),
          { status: 500, headers }
        );
      }

      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

      return new Response(JSON.stringify({ reply }), { headers });

    } catch (err) {
      return new Response(
        JSON.stringify({ error: "Server error", details: String(err) }),
        { status: 500, headers }
      );
    }
  }

  // 404
  return new Response(
    JSON.stringify({ error: "Not found" }),
    { status: 404, headers }
  );
});
