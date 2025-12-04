"use client";

import { useState } from "react";

export default function HomePage() {
  const [originalQuestion, setOriginalQuestion] = useState("");
  const [sessionActive, setSessionActive] = useState(false);
  const [messages, setMessages] = useState([]); // { sender: 'student' | 'tutor', text: string }[]
  const [stepInput, setStepInput] = useState("");
  const [hintLevel, setHintLevel] = useState(1);
  const [hasUserAttempted, setHasUserAttempted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [infoText, setInfoText] = useState("");
  const [problemDone, setProblemDone] = useState(false);

  async function callTutor(userAction, studentMessageOverride) {
    setIsLoading(true);
    setErrorText("");
    setInfoText("");

    try {
      const studentMessage =
        studentMessageOverride !== undefined ? studentMessageOverride : stepInput;

      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalQuestion,
          hintLevel,
          hasUserAttempted,
          studentMessage,
          userAction
        })
      });

      if (!res.ok) {
        throw new Error("Server error. Please try again.");
      }

      const data = await res.json();

      const tutorMessage = data.messageToStudent || "I could not generate a response.";
      const suggestedHintLevel =
        typeof data.suggestedHintLevel === "number" ? data.suggestedHintLevel : hintLevel;
      const isCompleted = Boolean(data.problemCompleted);

      setMessages((prev) => {
        const updated = [...prev];

        if (userAction === "start") {
          // Show the original question as the first student message
          updated.push({ sender: "student", text: originalQuestion });
        } else if (studentMessage && studentMessage.trim().length > 0) {
          updated.push({ sender: "student", text: studentMessage });
        }

        updated.push({ sender: "tutor", text: tutorMessage });
        return updated;
      });

      setHintLevel(suggestedHintLevel);
      if (userAction !== "start") {
        setHasUserAttempted(true);
      }

      if (isCompleted) {
        setProblemDone(true);
        setSessionActive(false);
        setInfoText(
          "Nice work. The tutor thinks this problem is done. You can start a new one above."
        );
      }

      setStepInput("");
    } catch (err) {
      console.error(err);
      setErrorText(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  function handleStartSession(e) {
    e.preventDefault();
    if (!originalQuestion.trim()) {
      setErrorText("Please type a math question first.");
      return;
    }
    setMessages([]);
    setHintLevel(1);
    setHasUserAttempted(false);
    setProblemDone(false);
    setSessionActive(true);
    callTutor("start", ""); // no immediate student step, just the question
  }

  function handleCheckStep() {
    if (!sessionActive) return;
    if (!stepInput.trim()) {
      setErrorText("Try to write something for this step, even if you are not sure.");
      return;
    }
    callTutor("attempt");
  }

  function handleGentleHint() {
    if (!sessionActive) return;
    // Gentle hint can be asked even if stepInput is empty
    callTutor("gentle_hint");
  }

  function handleStuck() {
    if (!sessionActive) return;
    callTutor("stuck");
  }

  function handleNewProblem() {
    setOriginalQuestion("");
    setMessages([]);
    setStepInput("");
    setHintLevel(1);
    setHasUserAttempted(false);
    setSessionActive(false);
    setProblemDone(false);
    setErrorText("");
    setInfoText("");
  }

  return (
    <div className="tutor-shell">
      {/* Top: problem input */}
      <section className="tutor-top">
        <form className="problem-form" onSubmit={handleStartSession}>
          <div className="label-row">
            <div className="label-main">1. Type or paste your math question</div>
            <div className="badge">
              <span className="badge-dot" />
              <span>Step-by-step • no instant answers</span>
            </div>
          </div>
          <input
            className="input-question"
            placeholder="Example: Solve 2x + 3 = 11 or Find the derivative of 3x² + 5x − 1"
            value={originalQuestion}
            onChange={(e) => setOriginalQuestion(e.target.value)}
          />
          <div className="problem-actions">
            <div className="small-note">
              Tamarini will ask you questions and give hints. It avoids giving the final answer
              immediately.
            </div>
            <div style={{ display: "flex", gap: "0.4rem" }}>
              {sessionActive || problemDone ? (
                <button
                  type="button"
                  className="button-primary-ghost"
                  onClick={handleNewProblem}
                  disabled={isLoading}
                >
                  New problem
                </button>
              ) : null}
              <button
                type="submit"
                className="button-primary"
                disabled={isLoading || !originalQuestion.trim()}
              >
                {isLoading && sessionActive ? "Thinking…" : "Start / Restart"}
              </button>
            </div>
          </div>
        </form>
      </section>

      {/* Middle: chat + sidebar */}
      <section className="tutor-middle">
        <div className="chat-panel">
          <div className="chat-header">
            <div className="chat-title">Tutor chat</div>
            <div className="hint-level-pill">Hint level: {hintLevel}</div>
          </div>
          <div className="chat-body">
            {messages.length === 0 ? (
              <div className="chat-empty">
                When you start a problem, Tamarini will ask what the question is really asking,
                then guide you step by step.
              </div>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={index}
                  className={
                    "message-row " + (msg.sender === "student" ? "student" : "tutor")
                  }
                >
                  <div
                    className={
                      "message-bubble " + (msg.sender === "student" ? "student" : "tutor")
                    }
                  >
                    {msg.text}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <aside className="sidebar-panel">
          <div className="sidebar-section-title">
            <span>How Tamarini works</span>
            <span className="sidebar-chip">Math only</span>
          </div>
          <div className="sidebar-body">
            <div>
              • First, you write your own attempt (even if it is a guess).
              <br />
              • Then Tamarini gives a gentle hint instead of the final answer.
            </div>
            <div>
              Hint ladder:
              <br />• Level 1 – big-picture question
              <br />• Level 2 – key idea / formula
              <br />• Level 3 – plan in steps
              <br />• Level 4 – partial solution to your problem
              <br />• Level 5 – fully worked similar example
            </div>
            <div>
              Goal: use fewer and fewer hints over time so you can solve similar problems on your
              own.
            </div>
          </div>
        </aside>
      </section>

      {/* Bottom: current step input + controls */}
      <section className="tutor-bottom">
        <div className="step-label-row">
          <div className="step-label-main">2. Work on the current step</div>
          <div className="step-label-hint">
            Write what you think the next step is, or ask for a hint.
          </div>
        </div>
        <textarea
          className="step-input"
          placeholder="Example: I will subtract 3 from both sides, so 2x = 8..."
          value={stepInput}
          onChange={(e) => setStepInput(e.target.value)}
          disabled={!sessionActive}
        />
        <div className="step-actions-row">
          <div className="step-actions-buttons">
            <button
              type="button"
              className="btn-small main"
              onClick={handleCheckStep}
              disabled={!sessionActive || isLoading}
            >
              Check this step
            </button>
            <button
              type="button"
              className="btn-small"
              onClick={handleGentleHint}
              disabled={!sessionActive || isLoading}
            >
              Gentle hint
            </button>
            <button
              type="button"
              className="btn-small"
              onClick={handleStuck}
              disabled={!sessionActive || isLoading}
            >
              I am really stuck
            </button>
          </div>
          <div className={"status-text" + (problemDone ? " done" : "")}>
            {sessionActive
              ? "Tutor will focus on why and how, not just answers."
              : problemDone
              ? "Problem finished. Start a new one when you are ready."
              : "Type a math question above to begin."}
          </div>
        </div>
        {errorText && <div className="error-banner">{errorText}</div>}
        {infoText && <div className="info-banner">{infoText}</div>}
      </section>
    </div>
  );
}
