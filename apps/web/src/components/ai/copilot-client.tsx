"use client";

import { useState, type FormEvent } from "react";
import { PageHeader, Card, CardBody, Button, Input } from "@/components/ui";

interface Turn {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "How much revenue have we collected from paid invoices?",
  "How many deals have we won versus still open?",
  "Do we have any products low on stock?",
  "Summarize the health of the business.",
];

export function CopilotClient() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask(question: string) {
    if (!question.trim()) return;
    setTurns((t) => [...t, { role: "user", text: question }]);
    setInput("");
    setLoading(true);
    const res = await fetch("/api/v1/ai/copilot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    setTurns((t) => [
      ...t,
      { role: "assistant", text: data.answer ?? data.error ?? "Something went wrong." },
    ]);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void ask(input);
  }

  return (
    <div>
      <PageHeader
        title="AI Copilot"
        description="Ask questions about your business in plain language."
      />

      {turns.length === 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="mb-4 flex flex-col gap-3">
        {turns.map((turn, i) => (
          <Card
            key={i}
            className={turn.role === "user" ? "bg-slate-50" : ""}
          >
            <CardBody>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
                {turn.role === "user" ? "You" : "Copilot"}
              </p>
              <p className="whitespace-pre-wrap text-sm text-slate-800">
                {turn.text}
              </p>
            </CardBody>
          </Card>
        ))}
        {loading && (
          <Card>
            <CardBody>
              <p className="text-sm text-slate-400">Copilot is thinking…</p>
            </CardBody>
          </Card>
        )}
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <Input
          placeholder="Ask about revenue, deals, stock, team…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <Button type="submit" loading={loading}>
          Ask
        </Button>
      </form>
    </div>
  );
}
