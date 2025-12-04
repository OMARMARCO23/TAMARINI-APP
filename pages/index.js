import { useEffect, useRef, useState } from "react";

const INITIAL_MESSAGE =
  "Salut, je suis TAMARINI.\nEnvoie une photo claire de ton exercice de maths, ou écris-le ici, puis explique-moi ce que tu as compris. Je vais te guider étape par étape, et à la fin on vérifiera ta réponse ensemble.";

export default function HomePage() {
  const [exercise, setExercise] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "tamarini", text: INITIAL_MESSAGE },
  ]);
  const [stage, setStage] = useState("initial"); // "initial" → "hint1" → "hint2"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const chatEndRef = useRef(null);

  // Auto‑scroll to latest message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  function resetConversation() {
    setExercise("");
    setInput("");
    setStage("initial");
    setError("");
    setMessages([{ from: "tamarini", text: INITIAL_MESSAGE }]);
  }

  async function callApi(selectedStage) {
    // We always need an exercise statement
    if (!exercise.trim()) {
      setError("Ajoute d'abord l'énoncé de ton exercice en haut.");
      return;
    }

    // For normal help, we expect the student to write something
    if (!input.trim() && selectedStage !== "similar") {
      setError("Écris ce que tu comprends, ta démarche, ou ta réponse avant d'envoyer.");
      return;
    }

    setError("");
    setLoading(true);

    const outgoingMessages = [...messages];

    // For "Similaire", we don't add a new student bubble
    if (selectedStage !== "similar" && input.trim()) {
      outgoingMessages.push({ from: "student", text: input.trim() });
    }

    setMessages(outgoingMessages);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: exercise,       // énoncé de l'exercice
          language: "French",
          level: "college",         // à affiner plus tard
          attempt: input.trim() || "",
          stage: selectedStage,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [
          ...prev,
          { from: "tamarini", text: data.reply },
        ]);
        setInput("");

        // Faire avancer le niveau d'aide automatiquement
        if (selectedStage === "initial") {
          setStage("hint1");
        } else if (selectedStage === "hint1") {
          setStage("hint2");
        }
      } else if (data.error) {
        setError("Erreur serveur : " + data.error);
      } else {
        setError("Réponse inconnue du serveur.");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError("Impossible de contacter le serveur. Vérifie ta connexion internet.");
    } finally {
      setLoading(false);
    }
  }

  function handleSend() {
    // Utilise le stage courant pour déterminer la profondeur des indices
    callApi(stage);
  }

  function handleSimilar() {
    // Demande un exercice similaire
    callApi("similar");
  }

  function handleImageClick() {
    alert("La fonctionnalité d'image arrivera bientôt dans l'application mobile.");
  }

  return (
    <div style={styles.page}>
      <div style={styles.shell}>
        {/* Top bar */}
        <header style={styles.topBar}>
          <div style={styles.brand}>
            <div style={styles.logoCircle}>T</div>
            <div>
              <div style={styles.appName}>Tamarini</div>
              <div style={styles.appSubtitle}>Ton coach de devoirs intelligent</div>
            </div>
          </div>
          <button style={styles.newExerciseBtn} onClick={resetConversation}>
            Nouvel exercice
          </button>
        </header>

        {/* Exercise input */}
        <section style={styles.exerciseSection}>
          <label style={styles.sectionLabel}>Énoncé de l'exercice</label>
          <textarea
            style={styles.exerciseInput}
            placeholder="Colle ici l’énoncé de ton exercice (texte). Pour une photo, tu pourras bientôt utiliser l’application mobile."
            value={exercise}
            onChange={(e) => setExercise(e.target.value)}
          />
        </section>

        {/* Chat area */}
        <section style={styles.chatSection}>
          <div style={styles.chatWindow}>
            {messages.map((m, index) => (
              <div
                key={index}
                style={{
                  ...styles.messageRow,
                  justifyContent:
                    m.from === "tamarini" ? "flex-start" : "flex-end",
                }}
              >
                <div
                  style={{
                    ...styles.bubble,
                    ...(m.from === "tamarini"
                      ? styles.tamariniBubble
                      : styles.studentBubble),
                  }}
                >
                  {m.text.split("\n").map((line, i) => (
                    <p key={i} style={styles.bubbleText}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        </section>

        {/* Bottom input & controls */}
        <section style={styles.bottomPanel}>
          <div style={styles.bottomTopRow}>
            <button style={styles.imageBtn} onClick={handleImageClick}>
              <span style={{ marginRight: 6 }}>📷</span> Image
            </button>
          </div>

          <div style={styles.inputRow}>
            <textarea
              style={styles.inputBox}
              placeholder="Écris ce que tu comprends, ta démarche, ou ta réponse finale..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />

            <div style={styles.sendButtons}>
              <button
                style={styles.secondaryBtn}
                onClick={handleSimilar}
                disabled={loading || !exercise.trim()}
              >
                Similaire
              </button>
              <button
                style={styles.primaryBtn}
                onClick={handleSend}
                disabled={loading}
              >
                {loading ? "Tamarini réfléchit..." : "Envoyer"}
              </button>
            </div>
          </div>

          {error && <div style={styles.errorText}>{error}</div>}
        </section>

        {/* Bottom nav (static for now) */}
        <footer style={styles.bottomNav}>
          <div style={{ ...styles.navItem, ...styles.navItemActive }}>
            <span style={styles.navIcon}>🏠</span>
            <span>Accueil</span>
          </div>
          <div style={styles.navItem}>
            <span style={styles.navIcon}>⚙️</span>
            <span>Paramètres</span>
          </div>
          <div style={styles.navItem}>
            <span style={styles.navIcon}>ℹ️</span>
            <span>À propos</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #eef2ff, #e3f2fd)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  shell: {
    width: "100%",
    maxWidth: 960,
    background: "#ffffff",
    borderRadius: 24,
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.12)",
    display: "flex",
    flexDirection: "column",
    padding: 16,
    gap: 12,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "4px 4px 8px 4px",
    borderBottom: "1px solid #e5e7eb",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  logoCircle: {
    width: 40,
    height: 40,
    borderRadius: "999px",
    background:
      "radial-gradient(circle at 30% 30%, #ffffff, #0b5ed7 60%, #051b4a)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 20,
  },
  appName: {
    fontSize: 18,
    fontWeight: 700,
    color: "#0f172a",
  },
  appSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  newExerciseBtn: {
    padding: "8px 14px",
    borderRadius: 999,
    border: "none",
    background: "#0b5ed7",
    color: "#fff",
    fontWeight: 600,
    cursor: "pointer",
    fontSize: 14,
  },
  exerciseSection: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: 600,
    color: "#4b5563",
  },
  exerciseInput: {
    width: "100%",
    minHeight: 70,
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    padding: 10,
    fontSize: 14,
    resize: "vertical",
    outline: "none",
  },
  chatSection: {
    flex: 1,
    minHeight: 220,
    borderRadius: 18,
    border: "1px solid #e5e7eb",
    background: "#f9fafb",
    padding: 12,
    overflow: "hidden",
  },
  chatWindow: {
    height: 260,
    overflowY: "auto",
    paddingRight: 4,
  },
  messageRow: {
    display: "flex",
    marginBottom: 8,
  },
  bubble: {
    maxWidth: "80%",
    borderRadius: 18,
    padding: "10px 12px",
    fontSize: 14,
    lineHeight: 1.45,
    whiteSpace: "pre-wrap",
  },
  tamariniBubble: {
    background: "#e0ecff",
    color: "#0f172a",
    borderTopLeftRadius: 4,
  },
  studentBubble: {
    background: "#0b5ed7",
    color: "#ffffff",
    borderTopRightRadius: 4,
  },
  bubbleText: {
    margin: 0,
  },
  bottomPanel: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    paddingTop: 4,
  },
  bottomTopRow: {
    display: "flex",
    justifyContent: "flex-start",
  },
  imageBtn: {
    borderRadius: 999,
    border: "1px solid #d1d5db",
    padding: "6px 12px",
    background: "#ffffff",
    cursor: "pointer",
    fontSize: 13,
    display: "flex",
    alignItems: "center",
  },
  inputRow: {
    display: "flex",
    gap: 8,
    alignItems: "flex-end",
  },
  inputBox: {
    flex: 1,
    minHeight: 60,
    maxHeight: 120,
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    padding: 10,
    fontSize: 14,
    resize: "vertical",
    outline: "none",
  },
  sendButtons: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    minWidth: 120,
  },
  secondaryBtn: {
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid #d1d5db",
    background: "#ffffff",
    fontSize: 13,
    cursor: "pointer",
  },
  primaryBtn: {
    padding: "8px 10px",
    borderRadius: 999,
    border: "none",
    background: "#0b5ed7",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  errorText: {
    marginTop: 4,
    color: "#b91c1c",
    fontSize: 12,
  },
  bottomNav: {
    marginTop: 8,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 6,
    display: "flex",
    justifyContent: "space-around",
    fontSize: 12,
  },
  navItem: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    color: "#6b7280",
    padding: 4,
    borderRadius: 999,
    minWidth: 70,
  },
  navItemActive: {
    background: "#0b5ed7",
    color: "#ffffff",
  },
  navIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
};
