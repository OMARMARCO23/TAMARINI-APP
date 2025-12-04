import { useState } from "react";

export default function HomePage() {
  const [question, setQuestion] = useState("Résous 2x + 5 = 17");
  const [attempt, setAttempt] = useState("");
  const [stage, setStage] = useState("initial");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function callApi(selectedStage) {
    setLoading(true);
    setResponse("");
    setStage(selectedStage);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          language: "French",
          level: "college",
          attempt,
          stage: selectedStage
        })
      });

      const data = await res.json();
      setResponse(JSON.stringify(data, null, 2));
    } catch (err) {
      setResponse("Network error: " + String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Tamarini Backend – Test</h1>

      <p>
        This page calls <code>/api/tutor</code> directly. Use it to check that
        the AI works.
      </p>

      <div style={{ marginBottom: 10 }}>
        <label>
          <strong>Question :</strong>
        </label>
        <br />
        <textarea
          style={{ width: "100%", height: 70 }}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <label>
          <strong>Ce que tu as essayé :</strong>
        </label>
        <br />
        <textarea
          style={{ width: "100%", height: 70 }}
          value={attempt}
          onChange={(e) => setAttempt(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: 10 }}>
        <button onClick={() => callApi("initial")}>Commencer l'aide</button>
        <button onClick={() => callApi("hint1")} style={{ marginLeft: 8 }}>
          Indice suivant
        </button>
        <button onClick={() => callApi("full")} style={{ marginLeft: 8 }}>
          Explication complète
        </button>
      </div>

      {loading && <p>Chargement...</p>}

      <h2>Réponse brute de l'API :</h2>
      <pre
        style={{
          background: "#f5f5f5",
          padding: 10,
          borderRadius: 4,
          minHeight: 80,
          whiteSpace: "pre-wrap"
        }}
      >
{response}
      </pre>
    </main>
  );
}
