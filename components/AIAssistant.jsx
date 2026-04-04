"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { buildSystemPrompt } from "../lib/systemPrompt";

const CLAUDE_ENDPOINT = "/api/claude";

/* ── helpers ── */
function parseAction(text) {
  const match = text.match(/```action\s*([\s\S]*?)```/);
  if (!match) return null;
  try { return JSON.parse(match[1].trim()); } catch { return null; }
}

function stripAction(text) {
  return text.replace(/```action[\s\S]*?```/g, "").trim();
}

function relTime(ts) {
  const m = Math.floor((Date.now() - new Date(ts)) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

/* ── Action chip renderer ── */
function ActionChip({ action, onApply, applied }) {
  if (!action) return null;
  const labels = {
    ADD_INITIATIVE: "➕ Add Initiative",
    UPDATE_INITIATIVE: "✏️ Update Initiative",
    ADD_CAMPAIGN: "🚀 Add Campaign",
    UPDATE_STRATEGY: "🎯 Update Strategy",
    SUGGEST_BRIEF: "📋 View Brief",
  };
  return (
    <div style={{
      marginTop: 10,
      padding: "10px 12px",
      background: applied ? "rgba(77,158,142,.12)" : "rgba(201,168,76,.08)",
      border: `1px solid ${applied ? "rgba(77,158,142,.3)" : "rgba(201,168,76,.25)"}`,
      borderRadius: 9,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 10,
    }}>
      <div>
        <div style={{ fontSize: 10, color: applied ? "#4d9e8e" : "#c9a84c", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 2 }}>
          {applied ? "✓ Applied" : "Proposed Change"}
        </div>
        <div style={{ fontSize: 12, color: "#ede8df" }}>{labels[action.type] || action.type}</div>
        {action.payload?.title && <div style={{ fontSize: 11, color: "#8a86a0", marginTop: 1 }}>{action.payload.title}</div>}
      </div>
      {!applied && (
        <button onClick={onApply} style={{
          padding: "6px 14px", borderRadius: 7,
          background: "#c9a84c", color: "#07070f",
          border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700,
          letterSpacing: ".05em", textTransform: "uppercase", whiteSpace: "nowrap",
          transition: "background .15s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = "#e2c06a"}
          onMouseLeave={e => e.currentTarget.style.background = "#c9a84c"}
        >
          Apply →
        </button>
      )}
    </div>
  );
}

/* ── Suggestion pills ── */
const SUGGESTIONS = [
  "Write a campaign brief for Headchange live rosin launch",
  "What initiatives are overdue?",
  "Add a Bubbles social media initiative for Q3",
  "Suggest 3 new campaign ideas for SafeBet",
  "How is the brand portfolio differentiated?",
  "Create a brand awareness campaign for all 3 brands",
];

/* ── Main component ── */
export default function AIAssistant({ hubState, onAction, isOpen, onToggle }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [appliedActions, setAppliedActions] = useState(new Set());
  const bottomRef = useRef();
  const textareaRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 200);
  }, [isOpen]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");

    const userMsg = { role: "user", content: msg, ts: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    const history = [...messages, userMsg].map(m => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

    try {
      const res = await fetch(CLAUDE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2048,
          system: buildSystemPrompt(hubState),
          messages: history,
        }),
      });

      const data = await res.json();
      const fullText = data.content?.find(c => c.type === "text")?.text || "Sorry, something went wrong.";
      const action = parseAction(fullText);
      const display = stripAction(fullText);

      setMessages(prev => [...prev, {
        role: "assistant",
        content: display,
        action,
        ts: new Date().toISOString(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: `Error: ${err.message}. Check your API key in .env.local.`,
        ts: new Date().toISOString(),
      }]);
    }
    setLoading(false);
  }, [input, loading, messages, hubState]);

  const applyAction = useCallback((msgIdx, action) => {
    onAction?.(action);
    setAppliedActions(prev => new Set([...prev, msgIdx]));
  }, [onAction]);

  const clearChat = () => { setMessages([]); setAppliedActions(new Set()); };

  return (
    <>
      {/* ── Toggle button ── */}
      <button
        onClick={onToggle}
        style={{
          position: "fixed", bottom: 28, left: 28, zIndex: 200,
          width: 52, height: 52, borderRadius: "50%",
          background: isOpen ? "#3e3c52" : "linear-gradient(135deg,#c9a84c,#a07030)",
          border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,.4)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, transition: "all .2s",
        }}
        title={isOpen ? "Close AI Assistant" : "Open AI Assistant"}
      >
        {isOpen ? "×" : "✦"}
      </button>

      {/* ── Panel ── */}
      <div style={{
        position: "fixed", bottom: 0, left: 0, zIndex: 190,
        width: 400, height: "100vh",
        background: "rgba(10,11,20,.9)",
        backdropFilter: "blur(24px) saturate(1.3)",
        borderRight: "1px solid rgba(255,255,255,.06)",
        display: "flex", flexDirection: "column",
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .3s cubic-bezier(.4,0,.2,1)",
        boxShadow: "8px 0 40px rgba(0,0,0,.4)",
        fontFamily: "'Inter',system-ui,sans-serif",
      }}>

        {/* Header */}
        <div style={{
          padding: "14px 18px 12px",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          background: "rgba(4,5,11,.6)",
          backdropFilter: "blur(24px) saturate(1.4)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: "linear-gradient(135deg,#c9a84c,#a07030)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, color: "#07070f", fontWeight: 700,
                fontFamily: "'Cormorant Garamond',serif",
              }}>✦</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#ede8df" }}>North Star AI</div>
                <div style={{ fontSize: 10, color: "#3e3c52", textTransform: "uppercase", letterSpacing: ".1em" }}>CÚRADOR Marketing Assistant</div>
              </div>
            </div>
            {messages.length > 0 && (
              <button onClick={clearChat} style={{ fontSize: 10, color: "#3e3c52", background: "none", border: "none", cursor: "pointer", textTransform: "uppercase", letterSpacing: ".07em", padding: "4px 8px" }}
                onMouseEnter={e => e.currentTarget.style.color = "#8a86a0"}
                onMouseLeave={e => e.currentTarget.style.color = "#3e3c52"}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Context pill */}
        <div style={{
          padding: "8px 16px", borderBottom: "1px solid rgba(255,255,255,.035)",
          display: "flex", gap: 6, flexWrap: "wrap", flexShrink: 0,
        }}>
          {[
            `${Object.keys(hubState?.brands || {}).length} brands`,
            `${hubState?.initiatives?.length || 0} initiatives`,
            `${hubState?.campaigns?.length || 0} campaigns`,
          ].map(label => (
            <span key={label} style={{
              fontSize: 9, padding: "2px 8px", borderRadius: 100,
              background: "rgba(201,168,76,.08)", color: "#c9a84c",
              border: "1px solid rgba(201,168,76,.15)",
              letterSpacing: ".06em", textTransform: "uppercase",
            }}>{label}</span>
          ))}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: 14 }}>

          {messages.length === 0 && (
            <div>
              <div style={{ fontSize: 13, color: "#8a86a0", lineHeight: 1.7, marginBottom: 16 }}>
                I have full context of your brands, initiatives, and campaigns. Ask me anything or tell me to make a change.
              </div>
              <div style={{ fontSize: 10, color: "#3e3c52", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 9 }}>Try asking</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => sendMessage(s)} style={{
                    textAlign: "left", padding: "8px 11px", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,.07)",
                    background: "rgba(255,255,255,.02)", color: "#8a86a0",
                    cursor: "pointer", fontSize: 11, lineHeight: 1.4,
                    transition: "all .13s", fontFamily: "'Inter',sans-serif",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(201,168,76,.25)"; e.currentTarget.style.color = "#ede8df"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,.07)"; e.currentTarget.style.color = "#8a86a0"; }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start", gap: 4 }}>
              <div style={{
                maxWidth: "88%",
                padding: "10px 13px",
                borderRadius: msg.role === "user" ? "13px 13px 3px 13px" : "3px 13px 13px 13px",
                background: msg.role === "user" ? "rgba(201,168,76,.12)" : "rgba(255,255,255,.04)",
                border: `1px solid ${msg.role === "user" ? "rgba(201,168,76,.2)" : "rgba(255,255,255,.07)"}`,
                fontSize: 13, color: "#ede8df", lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}>
                {msg.content}
                {msg.action && (
                  <ActionChip
                    action={msg.action}
                    applied={appliedActions.has(i)}
                    onApply={() => applyAction(i, msg.action)}
                  />
                )}
              </div>
              <div style={{ fontSize: 9, color: "#3e3c52" }}>{relTime(msg.ts)}</div>
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 13px" }}>
              {[0, 150, 300].map(d => (
                <div key={d} style={{
                  width: 7, height: 7, borderRadius: "50%", background: "#c9a84c",
                  animation: "pulse 1s ease-in-out infinite",
                  animationDelay: `${d}ms`,
                  opacity: .6,
                }} />
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: "12px 14px", borderTop: "1px solid rgba(255,255,255,.07)",
          background: "rgba(7,7,15,.6)", backdropFilter: "blur(12px)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              placeholder="Ask anything or say 'Add a Headchange initiative for…'"
              rows={2}
              style={{
                flex: 1, padding: "9px 12px",
                background: "rgba(255,255,255,.05)",
                border: "1px solid rgba(255,255,255,.09)",
                borderRadius: 10, color: "#ede8df",
                fontFamily: "'Inter',sans-serif", fontSize: 13, lineHeight: 1.5,
                resize: "none", outline: "none", transition: "border-color .15s",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(201,168,76,.4)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,.09)"}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              style={{
                width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                background: input.trim() && !loading ? "#c9a84c" : "rgba(255,255,255,.05)",
                border: "none", cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                color: input.trim() && !loading ? "#07070f" : "#3e3c52",
                fontSize: 16, transition: "all .15s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >↑</button>
          </div>
          <div style={{ fontSize: 10, color: "#3e3c52", marginTop: 6, textAlign: "center" }}>
            ↵ Send · Shift+↵ New line · Changes need your approval
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%,100%{opacity:.2;transform:scale(.8)}
          50%{opacity:1;transform:scale(1)}
        }
      `}</style>
    </>
  );
}
