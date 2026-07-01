import Link from "next/link";
import { MODULE_CATALOG, type ModuleKey } from "@atithira/types";

/* --------------------------------- Icons --------------------------------- */
/* Small inline stroke icons — no icon package dependency for a single page. */

function Icon({ path, className }: { path: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? "h-5 w-5"}
    >
      <path d={path} />
    </svg>
  );
}

const ICONS = {
  users: "M15 19c0-3-2.5-5-5.5-5S4 16 4 19M9.5 12a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM19 19c0-2.3-1.6-4.2-3.8-4.8M14.5 5.2A3.5 3.5 0 0117 8.5c0 1.3-.7 2.5-1.8 3.1",
  storefront: "M4 9l1-5h14l1 5M4 9a2 2 0 002 2 2 2 0 002-2 2 2 0 002 2 2 2 0 002-2 2 2 0 002 2 2 2 0 002-2M5 11v8h14v-8M10 19v-5h4v5",
  box: "M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3zM4 7.5l8 4.5 8-4.5M12 12v9",
  chart: "M4 19V5M4 19h16M8 19v-6M13 19V9M18 19v-4",
  globe: "M12 21a9 9 0 100-18 9 9 0 000 18zM3 12h18M12 3c2.4 2.5 3.6 5.6 3.6 9s-1.2 6.5-3.6 9c-2.4-2.5-3.6-5.6-3.6-9S9.6 5.5 12 3z",
  sparkles: "M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15zM5 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z",
  plug: "M9 3v5M15 3v5M6 8h12v3a6 6 0 01-6 6 6 6 0 01-6-6V8zM12 17v4M9 21h6",
  shield: "M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3zM9 12l2 2 4-4",
  bolt: "M13 3L4 14h6l-1 7 9-11h-6l1-7z",
  check: "M5 12l4 4 10-10",
} as const;

/* ------------------------------- Module data ------------------------------ */

const CATEGORIES: {
  title: string;
  blurb: string;
  icon: keyof typeof ICONS;
  keys: ModuleKey[];
}[] = [
  {
    title: "Customer",
    blurb: "Every contact, lead, and deal in one shared record — not siloed per tool.",
    icon: "users",
    keys: ["crm"],
  },
  {
    title: "Front of house",
    blurb: "Vertical operating modules for the businesses that run on foot traffic and bookings.",
    icon: "storefront",
    keys: ["restaurant", "hotel", "clinic", "retail"],
  },
  {
    title: "Operations",
    blurb: "Stock, vendors, and project work — wired to the same ledger and the same CRM.",
    icon: "box",
    keys: ["inventory", "procurement", "projects"],
  },
  {
    title: "Finance",
    blurb: "Invoicing, expenses, and the general ledger, built GST-first for India.",
    icon: "chart",
    keys: ["finance"],
  },
  {
    title: "People",
    blurb: "Employees, attendance, leave, and payroll for the whole employee lifecycle.",
    icon: "users",
    keys: ["people"],
  },
  {
    title: "Digital",
    blurb: "A tenant-hosted website builder with forms that feed straight into CRM leads.",
    icon: "globe",
    keys: ["website"],
  },
  {
    title: "Intelligence",
    blurb: "Cross-module dashboards, reports, and an AI Copilot that reasons over it all.",
    icon: "sparkles",
    keys: ["intelligence"],
  },
  {
    title: "Platform",
    blurb: "No-code automation, a marketplace, and API access for extending the OS itself.",
    icon: "plug",
    keys: ["automation", "marketplace", "developer"],
  },
];

const moduleByKey = new Map(MODULE_CATALOG.map((m) => [m.key, m]));

const INDUSTRY_PACKS = [
  {
    name: "Restaurant",
    detail: "Guests, ingredients, suppliers, billing, and an online menu — bundled from CRM, Inventory, Procurement, Finance, and Website.",
  },
  {
    name: "Hotel",
    detail: "Rooms, guest bookings, check-in/out, and folio billing — bundled from CRM, Hotel, and Finance.",
  },
  {
    name: "Retail",
    detail: "POS checkout that decrements stock in real time, tied to Inventory and Finance.",
  },
  {
    name: "Professional Services",
    detail: "Client pipeline, project delivery, and invoicing — bundled from CRM, Projects, and Finance.",
  },
];

const AI_CAPABILITIES = [
  "Ask a question in plain English and get an answer computed over your live tenant data",
  "Semantic search across every module — contacts, invoices, tickets, documents",
  "Draft content: marketing copy, email replies, product descriptions",
  "Surface anomalies and trends before you'd notice them in a report",
];

const SECURITY_ITEMS = [
  {
    title: "Multi-tenant isolation by design",
    detail: "Every query is scoped to a tenant at the repository layer — not by convention, and covered by an automated cross-tenant isolation test.",
  },
  {
    title: "Centralized RBAC",
    detail: "Resource-action permissions grouped into roles, scoped by organization, branch, and department — custom roles per tenant.",
  },
  {
    title: "Immutable audit log",
    detail: "Every action — who, what, when, in which tenant — is append-only and never edited after the fact.",
  },
  {
    title: "Encryption everywhere",
    detail: "TLS in transit, encryption at rest for the database and object storage, with SSO/SAML available for enterprise tenants.",
  },
];

const FAQ = [
  {
    q: "Do I need to buy every module?",
    a: "No. A handful of core modules (CRM, Finance, People, Inventory, Projects, Intelligence) are on by default. Everything else — Restaurant, Hotel, Clinic, Retail POS, Procurement, Automation, Website, Marketplace, Developer — is an add-on you turn on when you need it.",
  },
  {
    q: "Can I run more than one industry pack at once?",
    a: "Yes. Packs are just configuration on top of shared modules, so a hotel with a restaurant on-site can run both without duplicating data.",
  },
  {
    q: "What happens to my data if I leave?",
    a: "Your data is yours. Export it at any time from Settings — we don't hold it hostage to keep you subscribed.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes — create a workspace, install the modules you need, and upgrade in-product as your team or usage grows.",
  },
];

/* --------------------------------- Page ---------------------------------- */

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-mesh-glow" />

      <header className="sticky top-0 z-20 border-b border-white/5 bg-slate-950/70 backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400 to-sky-400 text-xs font-bold text-slate-950">
              A
            </span>
            Atithira Business OS
          </div>
          <nav className="hidden items-center gap-6 text-sm text-slate-400 md:flex">
            <a href="#modules" className="transition hover:text-white">Modules</a>
            <a href="#industries" className="transition hover:text-white">Industries</a>
            <a href="#ai" className="transition hover:text-white">AI Copilot</a>
            <a href="#security" className="transition hover:text-white">Security</a>
            <a href="#pricing" className="transition hover:text-white">Pricing</a>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="rounded-lg px-3 py-2 text-slate-300 transition hover:text-white">
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-white/10 px-4 py-2 font-medium text-white ring-1 ring-white/10 backdrop-blur transition hover:bg-white/20"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto flex max-w-4xl flex-col items-center px-6 pb-16 pt-16 text-center sm:pt-24">
        <span className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300 backdrop-blur">
          Built for India-first SMEs — restaurants, hotels, retail &amp; services
        </span>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          One operating system
          <br />
          <span className="bg-gradient-to-r from-indigo-400 via-sky-400 to-purple-400 bg-clip-text text-transparent">
            for how your business runs
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-400">
          Stop gluing together 10 different tools. Atithira unifies your customers, money,
          people, and operations in one platform — with one login, no-code automation, and
          an AI Copilot that reasons over all of it.
        </p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
          >
            Create your workspace — free
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur transition hover:bg-white/10"
          >
            Log in
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><Icon path={ICONS.check} className="h-4 w-4 text-emerald-400" /> 15 modules, one login</span>
          <span className="flex items-center gap-1.5"><Icon path={ICONS.check} className="h-4 w-4 text-emerald-400" /> Tenant-isolated by design</span>
          <span className="flex items-center gap-1.5"><Icon path={ICONS.check} className="h-4 w-4 text-emerald-400" /> India GST built in</span>
          <span className="flex items-center gap-1.5"><Icon path={ICONS.check} className="h-4 w-4 text-emerald-400" /> AI Copilot included</span>
        </div>

        {/* Product mockup */}
        <div className="relative mt-16 w-full max-w-5xl">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] text-left shadow-2xl shadow-black/40 backdrop-blur">
            <div className="flex items-center gap-1.5 border-b border-white/10 bg-white/5 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-4 text-xs text-slate-500">app.atithira.com/dashboard</span>
            </div>
            <div className="flex">
              <div className="hidden w-44 shrink-0 flex-col gap-1 border-r border-white/10 p-4 sm:flex">
                {[
                  { label: "CRM", on: true },
                  { label: "Finance", on: true },
                  { label: "People", on: true },
                  { label: "Inventory", on: true },
                  { label: "Projects", on: true },
                  { label: "Intelligence", on: true },
                  { label: "Restaurant", on: false },
                  { label: "Automation", on: false },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs">
                    <span className={`h-1.5 w-1.5 rounded-full ${item.on ? "bg-emerald-400" : "bg-slate-600"}`} />
                    <span className={item.on ? "text-slate-300" : "text-slate-600"}>{item.label}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 p-5 sm:p-6">
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Open deals", value: "₹18.4L" },
                    { label: "Invoices due", value: "₹4.2L" },
                    { label: "Active projects", value: "12" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">{stat.label}</div>
                      <div className="mt-1 text-lg font-semibold text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex h-24 items-end gap-1.5 rounded-xl border border-white/10 bg-white/5 p-4">
                  {[40, 65, 50, 80, 60, 90, 70, 95].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-full rounded-t bg-gradient-to-t from-indigo-500/60 to-sky-400/60"
                    />
                  ))}
                </div>
                <div className="mt-3 space-y-2 rounded-xl border border-white/10 bg-white/5 p-3">
                  {["Invoice #1042 paid — notify project team", "New lead from website form", "Low stock: Basmati Rice 5kg"].map((row) => (
                    <div key={row} className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                      {row}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem / solution */}
      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Without Atithira</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {["A CRM here, payroll there, accounting in a third silo", "Spreadsheets gluing it all together", "No single system has the full picture", "AI adoption is nearly impossible — context is scattered"].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400/70" />
                  <span className="line-through decoration-slate-600">{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-indigo-400/20 bg-gradient-to-br from-indigo-500/10 to-sky-500/10 p-6">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-indigo-300">With Atithira</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              {["One identity, one data model, every module wired in", "Automation replaces the spreadsheet glue", "One system holds the full picture — customers, money, people, ops", "AI reasons over your whole business, not one disconnected tool"].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <Icon path={ICONS.check} className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="relative mx-auto max-w-6xl px-6 pb-24 scroll-mt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Module catalog</h2>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Everything your business needs, in one place
          </p>
          <p className="mt-3 text-sm text-slate-400">
            A core set of modules is on by default for every new workspace. Turn on the rest — vertical modules,
            automation, marketplace — the moment you need them.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <div
              key={category.title}
              className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-black/20 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.07]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-400/20 to-sky-400/20 text-indigo-300">
                <Icon path={ICONS[category.icon]} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-white">{category.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{category.blurb}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {category.keys.map((key) => {
                  const mod = moduleByKey.get(key);
                  if (!mod) return null;
                  return (
                    <span
                      key={key}
                      title={mod.description}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        mod.defaultEnabled
                          ? "bg-emerald-400/10 text-emerald-300 ring-1 ring-emerald-400/20"
                          : "bg-white/5 text-slate-400 ring-1 ring-white/10"
                      }`}
                    >
                      {mod.label}
                    </span>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400/60 ring-1 ring-emerald-400/40" /> Included by default
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-white/10 ring-1 ring-white/20" /> Turn on anytime
          </span>
        </p>
      </section>

      {/* How it works */}
      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Onboarding</h2>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            From signup to go-live in minutes
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            "Create your organization",
            "Verify your email",
            "Workspace is provisioned",
            "Install an industry pack",
            "Invite your team",
            "Go live",
          ].map((step, i) => (
            <div key={step} className="relative rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="text-xs font-semibold text-indigo-300">0{i + 1}</span>
              <p className="mt-2 text-sm text-slate-300">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Industry packs */}
      <section id="industries" className="relative mx-auto max-w-6xl px-6 pb-24 scroll-mt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Industry solution packs</h2>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Pre-wired for how your industry actually works
          </p>
          <p className="mt-3 text-sm text-slate-400">
            A pack is configuration, not a separate product — the same modules, preset with the fields,
            workflows, and dashboards your industry needs on day one.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {INDUSTRY_PACKS.map((pack) => (
            <div key={pack.name} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-base font-semibold text-white">{pack.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{pack.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Copilot */}
      <section id="ai" className="relative mx-auto max-w-6xl px-6 pb-24 scroll-mt-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">AI Copilot</h2>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              AI that sees your whole business, not one tool at a time
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-400">
              Every module flows through one AI Engine that reasons over your unified data —
              the same advantage a stack of disconnected tools can never replicate.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-300">
              {AI_CAPABILITIES.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <Icon path={ICONS.sparkles} className="mt-0.5 h-4 w-4 shrink-0 text-indigo-300" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl shadow-black/20 backdrop-blur">
            <div className="space-y-3 text-sm">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-indigo-500/20 px-4 py-2.5 text-slate-100">
                What was our food cost % last month, and which supplier drove the increase?
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-white/10 bg-white/5 px-4 py-2.5 text-slate-300">
                Food cost was 31.2%, up from 27.8% — driven mainly by a 14% price increase from
                Shree Grains Supply on rice and lentils. Want me to flag it for renegotiation
                in Procurement?
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Automation */}
      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Automation, no code</h2>
          <p className="mt-3 max-w-2xl text-xl font-semibold tracking-tight text-white">
            Wire up cross-module workflows in a sentence
          </p>
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {[
              { label: "Trigger", value: "invoice.paid", color: "from-indigo-500/20 to-indigo-500/5 text-indigo-300" },
              { label: "Condition", value: "amount > ₹50,000", color: "from-sky-500/20 to-sky-500/5 text-sky-300" },
              { label: "Action", value: "notify + update project", color: "from-purple-500/20 to-purple-500/5 text-purple-300" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex flex-1 items-center gap-3">
                <div className={`w-full rounded-xl bg-gradient-to-br ${step.color} p-4 ring-1 ring-white/10`}>
                  <div className="text-[10px] uppercase tracking-wide opacity-70">{step.label}</div>
                  <div className="mt-1 font-mono text-sm">{step.value}</div>
                </div>
                {i < arr.length - 1 && (
                  <Icon path="M5 12h14M13 6l6 6-6 6" className="hidden h-5 w-5 shrink-0 text-slate-600 sm:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="relative mx-auto max-w-6xl px-6 pb-24 scroll-mt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Security &amp; trust</h2>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Secure and compliant by default, not retrofitted
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SECURITY_ITEMS.map((item) => (
            <div key={item.title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400/20 to-sky-400/20 text-emerald-300">
                <Icon path={ICONS.shield} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-white">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-400">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative mx-auto max-w-6xl px-6 pb-24 scroll-mt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Pricing</h2>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Start free, expand as you grow
          </p>
          <p className="mt-3 text-sm text-slate-400">
            Every tier shares the same core platform — you're never migrating to a different product as you scale.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Free", tag: "Get started", detail: "Core modules, one workspace, enough to run a small team." },
            { name: "Starter", tag: "Growing teams", detail: "More seats, add industry modules, and basic automation." },
            { name: "Growth", tag: "Scaling up", detail: "Full automation, AI Copilot at higher limits, and marketplace access." },
            { name: "Enterprise", tag: "Custom", detail: "SSO/SAML, data residency, white-label, and dedicated SLAs." },
          ].map((tier) => (
            <div key={tier.name} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-6">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{tier.tag}</span>
              <h3 className="mt-2 text-lg font-semibold text-white">{tier.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">{tier.detail}</p>
              <Link
                href="/signup"
                className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-center text-sm font-medium text-slate-200 transition hover:bg-white/10"
              >
                {tier.name === "Enterprise" ? "Talk to us" : "Get started"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative mx-auto max-w-3xl px-6 pb-24">
        <div className="text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">FAQ</h2>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Common questions</p>
        </div>
        <div className="mt-10 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-white/10 bg-white/5 p-5 [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-white">
                {item.q}
                <Icon path="M6 9l6 6 6-6" className="h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-400">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative mx-auto max-w-4xl px-6 pb-28">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/15 via-sky-500/10 to-purple-500/15 p-10 text-center backdrop-blur">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Run your whole business on one platform
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-400">
            Create a workspace, install the modules you need, and invite your team — no
            credit card required to get started.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110"
            >
              Create your workspace — free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-slate-200 backdrop-blur transition hover:bg-white/10"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/10 px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-400 to-sky-400 text-[10px] font-bold text-slate-950">
              A
            </span>
            Atithira Business OS
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <a href="#modules" className="transition hover:text-slate-300">Modules</a>
            <a href="#industries" className="transition hover:text-slate-300">Industries</a>
            <a href="#ai" className="transition hover:text-slate-300">AI Copilot</a>
            <a href="#security" className="transition hover:text-slate-300">Security</a>
            <a href="#pricing" className="transition hover:text-slate-300">Pricing</a>
          </nav>
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} Atithira Business OS · Biztreck Solutions
          </div>
        </div>
      </footer>
    </main>
  );
}
