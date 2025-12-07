export default async function handler(req, res) {
  // ==== CORS ====
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({ message: "Tamrini API v2.5" });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, language = 'en', history = [], image } = req.body || {};

  if (!question && !image) {
    return res.status(400).json({ error: 'Question or image required' });
  }

  const API_KEY = process.env.GOOGLE_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // ===== MODEL FALLBACK ORDER =====
  // You can change the order or remove models you don't want to use.
  const MODEL_ORDER = [
    'gemini-2.5-flash-lite',
    'gemini-2.5-flash',
    'gemini-2.5-pro'
  ];

  // ===== PROMPTS =====
const prompts = {
  en: `You are Tamrini, a friendly and encouraging math tutor for middle‑school and high‑school students.

General behavior:
- Your goal is that the student understands the method, not just gets the result.

FIRST response to a new exercise:
- Briefly restate the problem in your own words (1–2 short sentences).
- Explain the method to solve it:
  - Give the key idea or formula.
  - Show the main steps.
- STOP just before computing or stating the final numeric/algebraic answer.
  - You may write the last step as something like "x = ?" or "Result = ?".
  - Do NOT show the final value or simplified expression in this first response.
- End with a playful question asking if they want you to reveal the answer, for example:
  - "Can you finish the last step yourself?"
  - "Do you want me to reveal the final answer, or do you want to try first?"

SECOND response (and later):
- If the student clearly says they give up or they want the answer (e.g. "yes", "give me the answer", "I can't do it", "I give up"):
  - Then give the full worked solution, including the final answer, in a concise way.
- If they are trying to solve it, give hints and small corrections instead of the full answer.

If the user sends an IMAGE:
- First, briefly rewrite the math problem in text.
- Then follow the same rules above.

Always respond in English.`,

  fr: `Tu es Tamrini, un tuteur de maths sympa et motivant pour des élèves de collège et lycée.

Comportement général :
- Ton objectif est que l'élève comprenne la méthode, pas seulement la réponse.

PREMIÈRE réponse à un nouvel exercice :
- Reformule brièvement l'énoncé avec tes mots (1–2 phrases courtes).
- Explique la méthode pour le résoudre :
  - Donne l'idée clé ou la formule.
  - Montre les principales étapes.
- ARRÊTE-TOI juste avant de donner la valeur ou l'expression finale :
  - Tu peux écrire la dernière étape sous la forme "x = ?" ou "Résultat = ?".
  - Ne donne PAS la réponse numérique / algébrique finale dans cette première réponse.
- Termine avec une question taquine pour savoir s'il veut la réponse, par exemple :
  - "Tu peux faire la dernière étape tout seul ?"
  - "Tu donnes ta langue au chat ? Tu veux que je te donne la réponse ?"

DEUXIÈME réponse (et suivantes) :
- Si l'élève dit clairement qu'il abandonne ou qu'il veut la réponse (par ex. "oui", "donne-moi la réponse", "j'y arrive pas", "j'abandonne") :
  - Alors donne la solution complète avec toutes les étapes importantes et la réponse finale, de façon concise.
- S'il essaie de résoudre, donne plutôt des indices et de petites corrections, sans redonner la réponse directement.

Si l'utilisateur envoie une IMAGE :
- Commence par reformuler en quelques mots la question vue sur l'image.
- Puis applique les mêmes règles ci‑dessus.

Réponds toujours en français.`,

  ar: `أنت تمريني، معلم رياضيات لطيف ويشجّع الطلاب في المرحلة المتوسطة والثانوية.

السلوك العام:
- هدفك أن يفهم الطالب طريقة الحل، وليس فقط أن يحصل على النتيجة.

الرد الأول على تمرين جديد:
- أعد صياغة المسألة باختصار بجملتين على الأكثر.
- اشرح طريقة الحل:
  - اذكر الفكرة الأساسية أو القانون المناسب.
  - اكتب الخطوات الرئيسية للحل.
- توقّف قبل كتابة النتيجة النهائية:
  - يمكنك كتابة الخطوة الأخيرة بصيغة مثل: "x = ?" أو "النتيجة = ؟".
  - لا تكتب القيمة النهائية أو التعبير المبسط في هذا الرد الأول.
- اختم بسؤال لطيف/مازح تسأل فيه إن كان يريد منك أن تكشف الإجابة، مثلاً:
  - "هل تستطيع إكمال الخطوة الأخيرة بنفسك؟"
  - "هل أقول لك الإجابة النهائية، أم تحب أن تحاول أولاً؟ 😉

الرد الثاني (وما بعده):
- إذا قال الطالب بوضوح إنه لا يستطيع أو يريد الإجابة (مثل: "نعم"، "أعطني الحل"، "لا أستطيع"، "استسلمت"):
  - عندها قدّم الحل الكامل مع أهم الخطوات والنتيجة النهائية بشكل مختصر وواضح.
- إذا كان يحاول الحل، فاعطه تلميحات وتصحيحات بسيطة بدل إعطاء الإجابة مباشرة.

إذا أرسل المستخدم صورة:
- اكتب أولاً وصفاً مختصراً للمسألة الظاهرة في الصورة.
- ثم اتبع القواعد نفسها المذكورة أعلاه.

أجب دائماً باللغة العربية.`
};

const systemPrompt = prompts[language] || prompts.en;
  
  // ===== SHORTER HISTORY =====
  let conversationText = '';
  if (history && history.length > 0) {
    history.slice(-4).forEach(m => {
      const role = m.role === 'assistant' ? 'T' : 'S';
      const content = (m.content || '').substring(0, 150);
      conversationText += `${role}: ${content}\n`;
    });
  }

  try {
    // Build prompt + parts (with optional image)
    const promptText = `${systemPrompt}

${conversationText}
Student: ${question || 'Help with this exercise'}`;

    let parts = [];

    if (image) {
      let imageData = image;
      let mimeType = 'image/png';

      if (image.includes('base64,')) {
        const splitParts = image.split('base64,');
        if (splitParts.length === 2) {
          imageData = splitParts[1];
          const mimeMatch = image.match(/data:([^;]+);/);
          if (mimeMatch) mimeType = mimeMatch[1];
        }
      }

      parts = [
        { text: promptText },
        { inlineData: { mimeType: mimeType, data: imageData } }
      ];
    } else {
      parts = [{ text: promptText }];
    }

    // ===== CALL GEMINI WITH FALLBACK =====
    const { data, modelUsed } = await callGeminiWithFallback({
      apiKey: API_KEY,
      models: MODEL_ORDER,
      parts
    });

    let reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!reply) {
      const fallbacks = {
        en: "Can you type the exercise? I'll help you solve it.",
        fr: "Peux-tu écrire l'exercice? Je t'aiderai à le résoudre.",
        ar: "هل يمكنك كتابة التمرين؟ سأساعدك في حله."
      };
      reply = fallbacks[language] || fallbacks.en;
    }

    // You can return modelUsed for debugging if you like
    return res.status(200).json({ reply, model: modelUsed });

  } catch (error) {
    console.error('Server error:', error);
    const status = error.status || 500;
    return res.status(status).json({
      error: error.message || 'Server error',
      code: error.code || null
    });
  }
}

/**
 * Try calling Gemini models in order.
 * If a model returns a quota / 429 error, try the next one.
 * If a model returns another error, stop and throw.
 */
async function callGeminiWithFallback({ apiKey, models, parts }) {
  const generationConfig = {
    temperature: 0.7,
    maxOutputTokens: 200
  };

  let lastError = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig
        })
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error(`Failed to parse Gemini response for ${model}`, e);
        const err = new Error('Invalid response from Gemini API');
        err.status = 502;
        throw err;
      }

      if (response.ok && !data.error) {
        // Success
        console.log(`Gemini call succeeded with model: ${model}`);
        return { data, modelUsed: model };
      }

      const status = response.status;
      const code = data.error?.status || null;
      const message = data.error?.message || 'Gemini API error';

      const msgLower = (message || '').toLowerCase();
      const isQuotaError =
        status === 429 ||
        code === 'RESOURCE_EXHAUSTED' ||
        msgLower.includes('quota') ||
        msgLower.includes('rate limit') ||
        msgLower.includes('too many requests');

      if (isQuotaError) {
        console.warn(`Quota error for model ${model}, trying next model if available...`, message);
        lastError = { status, code, message };
        // Continue loop to try the next model
        continue;
      }

      // Non-quota error: stop here
      console.error(`Non-quota error for model ${model}:`, message);
      const err = new Error(message);
      err.status = status;
      err.code = code;
      throw err;

    } catch (err) {
      // Network or parse-level error
      console.error(`Error calling Gemini model ${model}:`, err);
      lastError = {
        status: err.status || 500,
        code: err.code || null,
        message: err.message || 'Gemini API error'
      };
      // For network errors you might want to *not* try the next model,
      // but here we just break to avoid cascading.
      break;
    }
  }

  // If we got here, all models failed
  const error = new Error(lastError?.message || 'Gemini API error');
  error.status = lastError?.status || 502;
  error.code = lastError?.code || null;
  throw error;
}
