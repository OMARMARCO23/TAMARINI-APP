import { useState } from "react";

const INITIAL_MESSAGE =
  "Salut, je suis TAMARINI.\nEnvoie une photo claire de ton exercice de maths, ou écris-le ici, puis explique-moi ce que tu as compris. Je vais te guider étape par étape, et à la fin on vérifiera ta réponse ensemble.";

export default function HomePage() {
  // First message of the student = original exercise
  const [exercise, setExercise] = useState("");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { from: "tamarini", text: INITIAL_MESSAGE },
  ]);
  const [hintLevel, setHintLevel] = useState(0); // 0 -> initial, 1 -> hint1, 2 -> hint2, 3+ -> full
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function resetConversation() {
    setExercise("");
    setInput("");
    setHintLevel(0);
    setError("");
    setMessages([{ from: "tamarini", text: INITIAL_MESSAGE }]);
  }

  async function handleSend() {
    if (!input.trim()) {
      setError(
        "Écris ce que tu comprends, ta démarche, ou ta réponse avant d'envoyer."
      );
      return;
    }

    const text = input.trim();
    setError("");
    setLoading(true);

    // Add student's message to chat
    setMessages((prev) => [...prev, { from: "student", text }]);
    setInput("");

    const isFirst = !exercise; // no exercise yet
    const question = isFirst ? text : exercise;
    const attempt = isFirst ? "" : text;

    // Decide how much help to ask from Tamarini
    let stage;
    if (isFirst) {
      stage = "initial";
    } else if (hintLevel === 0) {
      stage = "hint1";
    } else if (hintLevel === 1) {
      stage = "hint2";
    } else {
      stage = "full";
    }

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question,
          language: "French",
          level: "college",
          attempt,
          stage,
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { from: "tamarini", text: data.reply }]);
        if (isFirst) {
          setExercise(text); // store original exercise
        } else {
          setHintLevel((prev) => Math.min(prev + 1, 3));
        }
      } else if (data.error) {
        setError("Erreur serveur : " + data.error);
      } else {
        setError("Réponse inconnue du serveur.");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError(
        "Impossible de contacter le serveur. Vérifie ta connexion internet."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSimilar() {
    if (!exercise) {
      setError("Envoie d'abord l'exercice (ton premier message) avant de demander un similaire.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: exercise,
          language: "French",
          level: "college",
          attempt: "",
          stage: "similar",
        }),
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { from: "tamarini", text: data.reply }]);
      } else if (data.error) {
        setError("Erreur serveur : " + data.error);
      } else {
        setError("Réponse inconnue du serveur.");
      }
    } catch (err) {
      console.error("Network error:", err);
      setError(
        "Impossible de contacter le serveur. Vérifie ta connexion internet."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleImageClick() {
    alert(
      "La fonctionnalité d'image sera disponible dans l'application mobile. Pour l'instant, colle simplement ton exercice en texte."
    );
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
          </div>
        </section>

        {/* Bottom input & controls */}
        <section style={styles.bottomPanel}>
          <div style={styles.bottomTopRow}>
            <button
              type="button"
              style={styles.imageBtn}
              onClick={handleImageClick}
            >
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
                type="button"
                style={{
                  ...styles.secondaryBtn,
                  opacity: exercise ? 1 : 0.5,
                  cursor: exercise ? "pointer" : "not-allowed",
                }}
                onClick={handleSimilar}
                disabled={!exercise || loading}
              >
                Similaire
              </button>
              <button
                type="button"
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

        {/* Bottom nav (static) */}
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
    background: "#0f172a",
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
    boxShadow: "0 18px 50px rgba(15, 23, 42, 0.35)",
    display: "flex",
    flexDirection: "column",
    padding: 16,
    gap: 12,
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
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
  chatSection: {
    flex: 1,
    minHeight: 260,
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
