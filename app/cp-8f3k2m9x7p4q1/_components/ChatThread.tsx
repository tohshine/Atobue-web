"use client";

import type { ChatMessage } from "../_lib/conflicts";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function rolePill(role: ChatMessage["senderRole"]) {
  const common = "inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium uppercase";
  if (role === "tenant") return `${common} bg-cyan-400/15 text-cyan-200`;
  if (role === "landlord") return `${common} bg-violet-400/15 text-violet-200`;
  if (role === "caretaker") return `${common} bg-amber-400/15 text-amber-200`;
  return `${common} bg-white/10 text-white/60`;
}

export default function ChatThread({ messages }: { messages: ChatMessage[] }) {
  if (messages.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-8 text-center text-sm text-white/60">
        No messages in this thread yet.
      </div>
    );
  }

  return (
    <div className="max-h-[320px] space-y-3 overflow-y-auto rounded-xl border border-white/10 bg-black/20 p-4">
      {messages.map((message) => {
        const isSystem = message.senderRole === "system";
        return (
          <article
            key={message.id}
            className={[
              "rounded-xl px-3 py-2.5",
              isSystem
                ? "border border-dashed border-white/15 bg-white/5 text-center"
                : "border border-white/10 bg-white/5",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-white/90">{message.senderName}</p>
              <span className={rolePill(message.senderRole)}>{message.senderRole}</span>
              <span className="text-[10px] text-white/45">{formatTime(message.sentAt)}</span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-white/80">{message.content}</p>
          </article>
        );
      })}
    </div>
  );
}
