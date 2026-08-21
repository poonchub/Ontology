"use client";

import { useEffect, useState } from "react";
import {
  chatWithBackend,
  defaultMessages,
  fetchConversationMessages,
  fetchConversations,
  graphNodes,
  suggestedQuestions,
  type ChatMessage,
  type ConversationSummary,
  type GraphNode,
} from "@/lib/graphmind-data";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleHelp,
  Clipboard,
  Check,
  Database,
  GitBranch,
  Menu,
  MoreHorizontal,
  Network,
  PanelRight,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  X,
} from "lucide-react";

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Network className="size-4" />
      </div>
      <span className="font-semibold tracking-tight">GraphMind</span>
    </div>
  );
}
function Status() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/60 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      <span className="size-1.5 rounded-full bg-emerald-500" /> Knowledge Graph
      Ready
    </span>
  );
}
function Sidebar({ onClose, onNewChat, conversations, onSelectConversation }: { onClose?: () => void; onNewChat: () => void; conversations: ConversationSummary[]; onSelectConversation: (id: number) => void }) {
  const [query, setQuery] = useState("");
  return (
    <aside className="flex h-full w-[260px] shrink-0 flex-col border-r border-border bg-card/70 p-4 max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-30 max-md:shadow-2xl">
      <div className="mb-1 flex items-center justify-between">
        <button
          aria-label="Close sidebar"
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted md:hidden"
        >
          <X className="size-4" />
        </button>
      </div>
      <button onClick={onNewChat} className="mb-5 flex h-10 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90">
        <Plus className="size-4" /> New Chat
      </button>
      <label className="relative mb-6 block">
        <span className="sr-only">Search conversations</span>
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search conversations..."
          className="h-9 w-full rounded-lg border border-input bg-background pl-9 pr-3 text-xs outline-none ring-ring focus:ring-2"
        />
      </label>
      <div className="flex flex-1 flex-col gap-6 overflow-auto">
        {conversations.length ? (
          <>
            <ConversationGroup
              label="Today"
              items={conversations.slice(0, 1)}
              onSelect={onSelectConversation}
            />
            <ConversationGroup
              label="Yesterday"
              items={conversations.slice(1, 3)}
              onSelect={onSelectConversation}
            />
            <ConversationGroup label="Earlier" items={conversations.slice(3)} onSelect={onSelectConversation} />
          </>
        ) : (
          <p className="px-2 text-xs text-muted-foreground">
            No conversations yet.
          </p>
        )}
      </div>
      <div className="mt-4 flex items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
        <div className="flex size-8 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground">
          KG
        </div>
        <div className="flex-1">
          <p className="font-medium text-foreground">Fruit Knowledge Graph</p>
          <p>Live data workspace</p>
        </div>
        <MoreHorizontal className="size-4" />
      </div>
    </aside>
  );
}
function ConversationGroup({
  label,
  items,
  onSelect,
}: {
  label: string;
  items: ConversationSummary[];
  onSelect: (id: number) => void;
}) {
  return (
    <section>
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <button
            key={item.title}
            onClick={() => onSelect(item.id)}
            className="group flex items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <span className="min-w-0 flex-1 truncate">{item.title}</span>
            <span className="hidden text-[10px] group-hover:block">
              {new Date(item.updated_at).toLocaleDateString()}
            </span>
            <MoreHorizontal className="size-3.5 shrink-0 opacity-50" />
          </button>
        ))}
      </div>
    </section>
  );
}
function Header({
  onMenu,
  onSettings,
  onGraph,
}: {
  onMenu: () => void;
  onSettings: () => void;
  onGraph: () => void;
}) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border px-5 md:px-7">
      <div className="flex items-center gap-3">
        <button
          aria-label="Open sidebar"
          onClick={onMenu}
          className="rounded-lg p-2 hover:bg-muted md:hidden"
        >
          <Menu className="size-4" />
        </button>
        <Logo />
        <button className="flex items-center gap-2 text-left text-xs">
          <div>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Knowledge domain
            </p>
            <p className="font-medium">Fruit Knowledge Graph</p>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </div>
      <div className="flex items-center gap-3">
        <Status />
        <button
          aria-label="Open knowledge graph"
          onClick={onGraph}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted lg:hidden"
        >
          <PanelRight className="size-4" />
        </button>
        <button
          aria-label="Open settings"
          onClick={onSettings}
          className="rounded-lg p-2 text-muted-foreground hover:bg-muted"
        >
          <Settings className="size-4" />
        </button>
        <div className="flex size-8 items-center justify-center rounded-full border border-border bg-secondary text-[11px] font-semibold">
          KG
        </div>
      </div>
    </header>
  );
}
function EmptyState({ ask }: { ask: (text: string) => void }) {
  return (
    <div className="flex min-h-[430px] flex-1 flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-6 flex size-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/8 text-primary">
        <Sparkles className="size-6" />
      </div>
      <h1 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
        Ask the knowledge graph anything.
      </h1>
      <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
        Explore fruits, colors, categories, countries, and sweetness from the
        verified fruit knowledge graph.
      </p>
      <div className="mt-8 flex max-w-xl flex-wrap justify-center gap-2">
        {suggestedQuestions.map((q) => (
          <button
            key={q}
            onClick={() => ask(q)}
            className="rounded-full border border-border bg-card px-3.5 py-2 text-xs text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
function AnswerCard({
  message,
  onGraph,
}: {
  message: ChatMessage;
  onGraph: () => void;
}) {
  const [evidence, setEvidence] = useState(true);
  const [sparql, setSparql] = useState(false);
  const [copied, setCopied] = useState(false);
  return (
    <div className="max-w-2xl">
      <div className="mb-2 flex items-center gap-2 text-xs font-medium">
        <div className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-3" />
        </div>{" "}
        GraphMind{" "}
        <span className="text-[10px] font-normal text-muted-foreground">
          {message.time}
        </span>
      </div>
      <p className="text-sm leading-7 text-foreground">{message.content}</p>
      {message.structured && (
        <div className="mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border text-xs sm:grid-cols-4">
          {Object.entries(message.structured).map(([key, value]) => (
            <div key={key} className="bg-card px-3 py-3">
              <p className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                {key}
              </p>
              <p className="font-medium">{value}</p>
            </div>
          ))}
        </div>
      )}
      <div className="mt-5 overflow-hidden rounded-xl border border-border bg-muted/30">
        <button
          onClick={() => setEvidence(!evidence)}
          className="flex w-full items-center justify-between px-4 py-3 text-xs font-medium"
        >
          <span className="flex items-center gap-2">
            <GitBranch className="size-3.5 text-primary" /> Knowledge Graph
            Evidence
          </span>
          {evidence ? (
            <ChevronUp className="size-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="size-4 text-muted-foreground" />
          )}
        </button>
        {evidence && (
          <div className="border-t border-border px-4 pb-4 pt-3">
            <div className="mb-3 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" />{" "}
              {message.evidence?.[0] ?? "Evidence available"}
            </div>
            <div className="flex flex-col gap-2">
              {message.results?.length ? (
                message.results.map((result, index) => (
                  <div
                    key={index}
                    className="rounded-lg bg-background p-3 text-[11px]"
                  >
                    {Object.entries(result).map(([key, value]) => (
                      <div key={key} className="flex gap-2 leading-5">
                        <span className="min-w-20 font-medium text-primary">
                          {key}
                        </span>
                        <span className="break-all text-muted-foreground">
                          {String(value ?? "")}
                        </span>
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                <p className="rounded-lg bg-background p-3 text-[11px] text-muted-foreground">
                  No matching evidence found.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      <div className="mt-2 overflow-hidden rounded-xl border border-border">
        <button
          onClick={() => setSparql(!sparql)}
          className="flex w-full items-center justify-between px-4 py-3 text-xs text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <Database className="size-3.5" /> View SPARQL Query
          </span>
          {sparql ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>
        {sparql && (
          <div className="border-t border-border bg-slate-950 p-4 text-[11px] text-slate-300">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-emerald-400">
                ✓ Query executed successfully · 42 ms
              </span>
              <button
                aria-label="Copy SPARQL query"
                onClick={() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1200);
                }}
                className="text-slate-400 hover:text-white"
              >
                {copied ? (
                  <Check className="size-3.5" />
                ) : (
                  <Clipboard className="size-3.5" />
                )}
              </button>
            </div>
            <pre className="overflow-auto whitespace-pre-wrap leading-5">
              {message.sparql}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
function ChatArea({
  messages,
  ask,
  loading,
  onGraph,
}: {
  messages: ChatMessage[];
  ask: (text: string) => void;
  loading: boolean;
  onGraph: () => void;
}) {
  const [input, setInput] = useState("");
  const submit = () => {
    if (input.trim() && !loading) {
      ask(input.trim());
      setInput("");
    }
  };
  return (
    <section className="flex min-w-0 flex-1 flex-col overflow-y-auto bg-background">
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col">
        <div className="flex-1 px-5 py-8 md:px-10">
          {messages.length === 0 ? (
            <EmptyState ask={ask} />
          ) : (
            <div className="flex flex-col gap-8">
              {messages.map((message) =>
                message.role === "user" ? (
                  <div key={message.id} className="flex justify-end">
                    <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm leading-6 text-primary-foreground">
                      {message.content}
                    </div>
                  </div>
                ) : (
                  <AnswerCard
                    key={message.id}
                    message={message}
                    onGraph={onGraph}
                  />
                ),
              )}
              {loading && <Pipeline />}
            </div>
          )}
        </div>
        <div className="px-5 pb-5 pt-3 md:px-10 md:pb-7">
          <div className="rounded-2xl border border-border bg-card p-2 shadow-[0_8px_30px_-18px_hsl(var(--foreground)/.3)]">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing &&
                  e.keyCode !== 229
                ) {
                  e.preventDefault();
                  submit();
                }
              }}
              rows={1}
              aria-label="Ask the knowledge graph"
              placeholder="Ask the knowledge graph anything..."
              className="max-h-28 min-h-10 w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between px-2">
              <span className="text-[10px] text-muted-foreground">
                Enter to send · Shift + Enter for a new line
              </span>
              <button
                aria-label="Send message"
                onClick={submit}
                disabled={!input.trim() || loading}
                className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Send className="size-3.5" />
              </button>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] text-muted-foreground">
            GraphMind can make mistakes. Verify important information with your
            institution.
          </p>
        </div>
      </div>
    </section>
  );
}
function Pipeline() {
  return (
    <div className="max-w-sm rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium">
        <div className="flex size-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Sparkles className="size-3" />
        </div>{" "}
        Analyzing your question...
      </div>
      <div className="flex flex-col gap-2 text-[11px] text-muted-foreground">
        <span className="text-foreground">✓ Understanding question</span>
        <span className="text-foreground">✓ Generating SPARQL</span>
        <span className="flex items-center gap-2 text-primary">
          <span className="size-1.5 animate-pulse rounded-full bg-primary" />{" "}
          Querying Knowledge Graph
        </span>
        <span>○ Generating answer</span>
      </div>
    </div>
  );
}
function GraphPanel({
  selected,
  setSelected,
  onClose,
}: {
  selected: GraphNode;
  setSelected: (node: GraphNode) => void;
  onClose?: () => void;
}) {
  return (
    <aside className="flex w-[330px] shrink-0 flex-col border-l border-border bg-card/60 max-lg:fixed max-lg:inset-y-16 max-lg:right-0 max-lg:z-20 max-lg:shadow-2xl">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold">Knowledge Graph</h2>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Explore connected concepts
          </p>
        </div>
        <button
          aria-label="Close graph panel"
          onClick={onClose}
          className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted lg:hidden"
        >
          <X className="size-4" />
        </button>
      </div>
      <div className="relative mx-4 mt-4 h-[330px] overflow-hidden rounded-2xl border border-border bg-background">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle, hsl(var(--muted-foreground) / .22) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 330 330"
          aria-hidden="true"
        >
          <path
            d="M165 78 L165 123 M165 169 L165 207 M165 253 L165 280 M113 146 L70 146"
            stroke="hsl(var(--border))"
            strokeWidth="1.5"
          />
          <path
            d="M165 116 l-4 -7 M165 116 l4 -7 M165 200 l-4 -7 M165 200 l4 -7 M165 273 l-4 -7 M165 273 l4 -7"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
        <GraphNodeView
          node={graphNodes[0]}
          selected={selected.id === "somchai"}
          style={{ left: "50%", top: 35 }}
          onClick={() => setSelected(graphNodes[0])}
        />
        <GraphNodeView
          node={graphNodes[1]}
          selected={selected.id === "cs201"}
          style={{ left: "50%", top: 125 }}
          onClick={() => setSelected(graphNodes[1])}
        />
        <GraphNodeView
          node={graphNodes[2]}
          selected={selected.id === "cs101"}
          style={{ left: "50%", top: 212 }}
          onClick={() => setSelected(graphNodes[2])}
        />
        <GraphNodeView
          node={graphNodes[4]}
          selected={selected.id === "cs"}
          style={{ left: "50%", top: 282 }}
          onClick={() => setSelected(graphNodes[4])}
        />
        <span className="absolute left-3 top-[112px] text-[9px] text-muted-foreground">
          teaches
        </span>
        <span className="absolute left-[185px] top-[195px] text-[9px] text-muted-foreground">
          prerequisite
        </span>
        <span className="absolute left-[182px] top-[267px] text-[9px] text-muted-foreground">
          belongsTo
        </span>
      </div>
      <div className="border-b border-border px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Selected node
        </p>
        <div className="flex items-center gap-2">
          <span
            className={`size-2 rounded-full ${selected.type === "person" ? "bg-amber-500" : selected.type === "department" ? "bg-emerald-500" : "bg-primary"}`}
          />
          <div>
            <p className="text-sm font-medium">{selected.label}</p>
            <p className="text-[11px] text-muted-foreground">{selected.meta}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-2 text-[11px] text-muted-foreground">
          <div className="flex justify-between">
            <span>Type</span>
            <span className="font-medium capitalize text-foreground">
              {selected.type}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Relationships</span>
            <span className="font-medium text-primary">3 connected</span>
          </div>
        </div>
      </div>
      <div className="px-5 py-4">
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Legend
        </p>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-muted-foreground">
          <span>
            <i className="mr-1.5 inline-block size-2 rounded-full bg-amber-500" />
            Person
          </span>
          <span>
            <i className="mr-1.5 inline-block size-2 rounded-full bg-primary" />
            Course
          </span>
          <span>
            <i className="mr-1.5 inline-block size-2 rounded-full bg-emerald-500" />
            Department
          </span>
          <span>
            <i className="mr-1.5 inline-block h-px w-3 bg-border align-middle" />
            relationship
          </span>
        </div>
      </div>
    </aside>
  );
}
function GraphNodeView({
  node,
  style,
  selected,
  onClick,
}: {
  node: GraphNode;
  style: React.CSSProperties;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={`Select ${node.label}`}
      style={{ transform: "translateX(-50%)", ...style }}
      className={`absolute z-10 max-w-[145px] rounded-xl border px-3 py-2 text-left transition ${selected ? "border-primary bg-primary/10 shadow-md" : "border-border bg-card hover:border-primary/50"}`}
    >
      <p className="truncate text-[11px] font-medium">{node.label}</p>
      <p className="mt-0.5 truncate text-[9px] text-muted-foreground">
        {node.meta}
      </p>
    </button>
  );
}
function SettingsModal({
  onClose,
  theme,
  setTheme,
}: {
  onClose: () => void;
  theme: "light" | "dark" | "system";
  setTheme: (theme: "light" | "dark" | "system") => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 id="settings-title" className="font-semibold">
              Settings
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Customize your GraphMind workspace
            </p>
          </div>
          <button
            aria-label="Close settings"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-6">
          <div>
            <p className="mb-3 text-xs font-medium">Appearance</p>
            <div className="grid grid-cols-3 gap-2">
              {(["light", "dark", "system"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setTheme(item)}
                  aria-pressed={theme === item}
                  className={`rounded-lg border px-3 py-2 text-xs capitalize transition ${theme === item ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:bg-muted"}`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-3 text-xs font-medium">Chat</p>
            <div className="flex flex-col gap-3 text-xs">
              {[
                "Show Knowledge Graph Evidence",
                "Show SPARQL Query",
                "Show Processing Steps",
              ].map((item) => (
                <label key={item} className="flex items-center justify-between">
                  <span>{item}</span>
                  <input
                    type="checkbox"
                    defaultChecked
                    className="accent-primary"
                  />
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-muted/50 p-4">
            <p className="text-xs font-medium">Knowledge Graph</p>
            <div className="mt-3 flex justify-between text-xs">
              <span className="text-muted-foreground">Domain</span>
              <span>Fruit Knowledge Graph</span>
            </div>
            <div className="mt-2 flex justify-between text-xs">
              <span className="text-muted-foreground">Status</span>
              <span className="text-emerald-600">Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default function GraphMindApp() {
  const [messages, setMessages] = useState<ChatMessage[]>(defaultMessages);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [conversationId, setConversationId] = useState<number>();
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [graphOpen, setGraphOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [selected, setSelected] = useState(graphNodes[1]);
  useEffect(() => {
    fetchConversations().then(setConversations).catch(() => setConversations([]));
  }, []);
  const ask = async (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `u-${Date.now()}`, role: "user", content: text, time: "Now" },
    ]);
    setLoading(true);
    const response = await chatWithBackend(text, conversationId);
    setConversationId(response.conversationId || undefined);
    setMessages((prev) => [...prev, response.message]);
    fetchConversations().then(setConversations).catch(() => undefined);
    setLoading(false);
  };
  const themeClass = theme === "dark" ? "dark" : "";
  return (
    <main
      className={`${themeClass} flex h-dvh min-h-[680px] flex-col overflow-hidden bg-background text-foreground`}
    >
      <Header
        onMenu={() => setSidebarOpen(true)}
        onSettings={() => setSettingsOpen(true)}
        onGraph={() => setGraphOpen(true)}
      />
      <div className="flex min-h-0 flex-1">
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-foreground/20 md:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
        <div
          className={`${sidebarOpen ? "max-md:block" : "max-md:hidden"} md:block`}
        >
          <Sidebar
            onClose={() => setSidebarOpen(false)}
            onNewChat={() => {
              setMessages([]);
              setConversationId(undefined);
              setSidebarOpen(false);
            }}
            conversations={conversations}
            onSelectConversation={async (id) => {
              const loaded = await fetchConversationMessages(id);
              setConversationId(id);
              setMessages(loaded);
              setSidebarOpen(false);
            }}
          />
        </div>
        <ChatArea
          messages={messages}
          ask={ask}
          loading={loading}
          onGraph={() => setGraphOpen(true)}
        />
        {graphOpen && graphNodes.length > 0 && (
          <GraphPanel
            selected={selected}
            setSelected={setSelected}
            onClose={() => setGraphOpen(false)}
          />
        )}
      </div>
      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          theme={theme}
          setTheme={setTheme}
        />
      )}
    </main>
  );
}
