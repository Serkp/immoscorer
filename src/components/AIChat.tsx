"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { AIOrb } from "@/components/ui/AIOrb";
import { C } from "@/lib/theme";

/* ═══════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════ */

export interface AIChatContext {
  type: "analysis" | "portfolio" | "compare" | "general";
  data: Record<string, unknown> | Record<string, unknown>[] | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AIChatProps {
  context: AIChatContext;
  suggestedQuestions: string[];
  title?: string;
  subtitle?: string;
  compact?: boolean;
  defaultOpen?: boolean;
}

/* ═══════════════════════════════════════════════════════
   FORMAT HELPERS
   ═══════════════════════════════════════════════════════ */

function formatMessage(text: string) {
  const parts: React.ReactNode[] = [];
  const paragraphs = text.split(/\n\n+/);

  paragraphs.forEach((para, pi) => {
    if (pi > 0) parts.push(<br key={`br-${pi}`} />);

    // Check if this is a numbered list item
    const lines = para.split("\n");
    const listItems: string[] = [];
    const nonListLines: string[] = [];

    for (const line of lines) {
      if (/^\d+\.\s/.test(line.trim())) {
        listItems.push(line.trim().replace(/^\d+\.\s*/, ""));
      } else if (line.trim().startsWith("- ")) {
        listItems.push(line.trim().replace(/^-\s*/, ""));
      } else {
        if (listItems.length > 0) {
          // Flush accumulated list items
          parts.push(
            <ol
              key={`ol-${pi}-${parts.length}`}
              style={{ paddingLeft: 20, margin: "6px 0" }}
            >
              {listItems.map((item, li) => (
                <li
                  key={li}
                  style={{
                    color: C.sub,
                    fontSize: 13,
                    lineHeight: "1.6",
                    marginBottom: 2,
                  }}
                >
                  {renderInline(item)}
                </li>
              ))}
            </ol>,
          );
          listItems.length = 0;
        }
        nonListLines.push(line);
      }
    }

    // Flush remaining list items
    if (listItems.length > 0) {
      if (nonListLines.length > 0) {
        parts.push(
          <span key={`t-${pi}`} style={{ display: "block", marginBottom: 4 }}>
            {renderInline(nonListLines.join(" "))}
          </span>,
        );
        nonListLines.length = 0;
      }
      parts.push(
        <ol
          key={`ol-${pi}-end`}
          style={{ paddingLeft: 20, margin: "6px 0" }}
        >
          {listItems.map((item, li) => (
            <li
              key={li}
              style={{
                color: C.sub,
                fontSize: 13,
                lineHeight: "1.6",
                marginBottom: 2,
              }}
            >
              {renderInline(item)}
            </li>
          ))}
        </ol>,
      );
    } else if (nonListLines.length > 0) {
      parts.push(
        <span key={`p-${pi}`} style={{ display: "block" }}>
          {renderInline(nonListLines.join("\n"))}
        </span>,
      );
    }
  });

  return <>{parts}</>;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold** text
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  if (boldParts.length > 1) {
    return (
      <>
        {boldParts.map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return (
              <strong key={i} style={{ color: C.text, fontWeight: 600 }}>
                {part.slice(2, -2)}
              </strong>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </>
    );
  }
  return text;
}

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */

export function AIChat({
  context,
  suggestedQuestions,
  title = "KI-Investitionsberater",
  subtitle = "Stellen Sie Fragen zu Immobilien, Finanzierung, Steuern, Recht und mehr.",
  compact = false,
  defaultOpen = false,
}: AIChatProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const contextRef = useRef(context);

  // Keep context ref in sync
  useEffect(() => {
    contextRef.current = context;
  }, [context]);

  // Auto scroll to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;

      const userMsg: ChatMessage = { role: "user", content: text.trim() };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setShowSuggestions(false);
      setIsLoading(true);

      try {
        const res = await fetch("/api/ai-advisor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: text.trim(),
            context: contextRef.current,
            conversationHistory: [...messages, userMsg].slice(-8),
          }),
        });

        const data = await res.json();
        const answer =
          data.answer || data.error || "Keine Antwort erhalten.";
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: answer },
        ]);
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Verbindungsfehler. Bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.",
          },
        ]);
      }

      setIsLoading(false);
    },
    [isLoading, messages],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  function clearChat() {
    setMessages([]);
    setShowSuggestions(true);
  }

  // Public method to set context and open with auto-question
  const openWithQuestion = useCallback(
    (question: string, newContext?: AIChatContext) => {
      if (newContext) {
        contextRef.current = newContext;
      }
      setIsOpen(true);
      // Small delay to let panel open before sending
      setTimeout(() => sendMessage(question), 100);
    },
    [sendMessage],
  );

  // Expose methods via ref-like pattern with data attribute
  useEffect(() => {
    const el = document.getElementById("ai-chat-controller");
    if (el) {
      (el as unknown as { openWithQuestion: typeof openWithQuestion }).openWithQuestion =
        openWithQuestion;
    }
  }, [openWithQuestion]);

  const maxChatH = compact ? 300 : 500;

  return (
    <div
      id="ai-chat-controller"
      className="rounded-2xl overflow-hidden transition-all"
      style={{
        background: C.surface2,
        border: `1px solid ${C.border}`,
        borderImage: isOpen
          ? `linear-gradient(135deg, ${C.accent}44, ${C.border}, ${C.cyan}44) 1`
          : undefined,
      }}
    >
      {/* Header — clickable toggle */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="w-full flex items-center gap-3 p-4 text-left cursor-pointer transition-colors"
        style={{
          borderBottom: isOpen ? `1px solid ${C.border}` : "none",
        }}
      >
        <AIOrb size={compact ? 22 : 26} active />
        <div className="flex-1 min-w-0">
          <p
            className={`${compact ? "text-xs" : "text-sm"} font-bold`}
            style={{ color: C.text }}
          >
            {title}
          </p>
          {!compact && (
            <p className="text-xs mt-0.5" style={{ color: C.sub }}>
              {subtitle}
            </p>
          )}
        </div>
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke={C.dim}
          strokeWidth="2"
          strokeLinecap="round"
          className="shrink-0 transition-transform"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Body — collapsible */}
      <div
        style={{
          maxHeight: isOpen ? 9999 : 0,
          overflow: "hidden",
          transition: "max-height 0.3s ease",
        }}
      >
        <div className="p-4 space-y-4">
          {/* Suggestions */}
          {showSuggestions && suggestedQuestions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="rounded-lg px-3 py-2 text-xs text-left transition-all"
                  style={{
                    background: C.surface,
                    border: `1px solid ${C.border}`,
                    color: C.sub,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = C.accent;
                    e.currentTarget.style.color = C.text;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = C.border;
                    e.currentTarget.style.color = C.sub;
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Chat messages */}
          {messages.length > 0 && (
            <div
              className="space-y-3 overflow-y-auto"
              style={{
                maxHeight: maxChatH,
                scrollBehavior: "smooth",
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-xl px-3.5 py-2.5 ${compact ? "text-xs" : "text-[13px]"} leading-relaxed`}
                    style={{
                      maxWidth: "88%",
                      background:
                        msg.role === "user" ? C.accentMid : C.surface3,
                      color: msg.role === "user" ? C.accent : C.sub,
                      fontWeight: msg.role === "user" ? 500 : 400,
                    }}
                  >
                    {msg.role === "assistant"
                      ? formatMessage(msg.content)
                      : msg.content}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div
                    className="rounded-xl px-4 py-3 flex items-center gap-1.5"
                    style={{ background: C.surface3 }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
                      style={{
                        background: C.accent,
                        animationDelay: "0s",
                      }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
                      style={{
                        background: C.accent,
                        animationDelay: "0.2s",
                      }}
                    />
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse-dot"
                      style={{
                        background: C.accent,
                        animationDelay: "0.4s",
                      }}
                    />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          )}

          {/* Input area */}
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ihre Frage..."
              rows={1}
              className="flex-1 rounded-xl px-4 py-2.5 text-sm resize-none outline-none transition-all"
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                color: C.text,
                minHeight: 42,
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = C.accent;
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = C.border;
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="rounded-xl px-4 py-2.5 text-sm font-bold transition-all disabled:opacity-30 shrink-0"
              style={{
                background: `linear-gradient(135deg, ${C.accent}, ${C.blue})`,
                color: "#fff",
              }}
            >
              <svg
                width={18}
                height={18}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>

          {/* Clear chat */}
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-[11px] transition-opacity hover:opacity-80"
              style={{ color: C.dim }}
            >
              Chat leeren
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
