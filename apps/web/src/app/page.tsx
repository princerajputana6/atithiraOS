import Link from "next/link";
import { MODULE_CATALOG, type ModuleKey } from "@atithira/types";
import { BrandLogoBadge } from "@/components/brand-logo";
import { ServiceRequestForm } from "@/components/service-request-form";

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
    a: "You can request the services you need from the landing page. Our team reviews the request and provisions the right workspace with you.",
  },
];

/* --------------------------------- Page ---------------------------------- */

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-mesh-glow" />

      <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/90 shadow-card backdrop-blur-xl">
        <div className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center" aria-label="Atithira">
            <BrandLogoBadge priority />
          </div>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#modules" className="transition hover:text-brand-700">Modules</a>
            <a href="#industries" className="transition hover:text-brand-700">Industries</a>
            <a href="#ai" className="transition hover:text-brand-700">AI Copilot</a>
            <a href="#security" className="transition hover:text-brand-700">Security</a>
            <a href="#request" className="transition hover:text-brand-700">Request</a>
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="rounded-lg px-3 py-2 font-medium text-slate-600 transition hover:text-brand-700">
              Log in
            </Link>
            <a href="#request" className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-brand-700">
              Request access
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 pb-16 pt-14 lg:grid-cols-[1fr_420px] lg:pt-20">
        <div className="text-center lg:text-left">
        <span className="mb-6 inline-flex rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-medium text-brand-700">
          Built for India-first SMEs — restaurants, hotels, retail &amp; services
        </span>
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
          One operating system
          <br />
          <span className="text-brand-700">
            for how your business runs
          </span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-slate-600 lg:mx-0">
          Stop gluing together 10 different tools. Atithira unifies your customers, money,
          people, and operations in one platform — with one login, no-code automation, and
          an AI Copilot that reasons over all of it.
        </p>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
          <a
            href="#request"
            className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-brand-700"
          >
            Request services
          </a>
          <Link
            href="/login"
            className="rounded-xl border border-blue-100 bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-blue-50"
          >
            Log in
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 lg:justify-start">
          <span className="flex items-center gap-1.5"><Icon path={ICONS.check} className="h-4 w-4 text-emerald-500" /> 15 modules, one login</span>
          <span className="flex items-center gap-1.5"><Icon path={ICONS.check} className="h-4 w-4 text-emerald-500" /> Tenant-isolated by design</span>
          <span className="flex items-center gap-1.5"><Icon path={ICONS.check} className="h-4 w-4 text-emerald-500" /> India GST built in</span>
          <span className="flex items-center gap-1.5"><Icon path={ICONS.check} className="h-4 w-4 text-emerald-500" /> AI Copilot available</span>
        </div>
        </div>

        <ServiceRequestForm />

        {/* Product mockup */}
        <div className="relative w-full lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white text-left shadow-xl shadow-blue-900/10">
            <div className="flex items-center gap-1.5 border-b border-blue-100 bg-blue-50 px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
              <span className="ml-4 text-xs text-slate-500">app.atithira.com/dashboard</span>
            </div>
            <div className="flex">
              <div className="hidden w-44 shrink-0 flex-col gap-1 bg-sidebar-gradient p-4 sm:flex">
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
                    <span className={`h-1.5 w-1.5 rounded-full ${item.on ? "bg-emerald-300" : "bg-blue-200/40"}`} />
                    <span className={item.on ? "text-white" : "text-blue-100/60"}>{item.label}</span>
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
                    <div key={stat.label} className="rounded-xl border border-blue-100 bg-blue-50 p-3">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500">{stat.label}</div>
                      <div className="mt-1 text-lg font-semibold text-slate-950">{stat.value}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex h-24 items-end gap-1.5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                  {[40, 65, 50, 80, 60, 90, 70, 95].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="w-full rounded-t bg-gradient-to-t from-brand-600 to-sky-400"
                    />
                  ))}
                </div>
                <div className="mt-3 space-y-2 rounded-xl border border-blue-100 bg-white p-3">
                  {["Invoice #1042 paid — notify project team", "New lead from website form", "Low stock: Basmati Rice 5kg"].map((row) => (
                    <div key={row} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
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
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Without Atithira</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-500">
              {["A CRM here, payroll there, accounting in a third silo", "Spreadsheets gluing it all together", "No single system has the full picture", "AI adoption is nearly impossible — context is scattered"].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400/70" />
                  <span className="line-through decoration-slate-300">{line}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-card">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-brand-700">With Atithira</h3>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
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
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Everything your business needs, in one place
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Select the modules you need in your service request. Our team configures the right workspace after review.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <div
              key={category.title}
              className="flex flex-col rounded-2xl border border-blue-100 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-brand-700">
                <Icon path={ICONS[category.icon]} />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-950">{category.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{category.blurb}</p>
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
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                          : "bg-blue-50 text-slate-600 ring-1 ring-blue-100"
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
            <span className="h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-emerald-200" /> Common core module
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-blue-100 ring-1 ring-blue-200" /> Available by request
          </span>
        </p>
      </section>

      {/* How it works */}
      <section className="relative mx-auto max-w-5xl px-6 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Onboarding</h2>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            From request to go-live with the right setup
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            "Submit service request",
            "Talk to our team",
            "Workspace is configured",
            "Enable your modules",
            "Invite your team",
            "Go live",
          ].map((step, i) => (
            <div key={step} className="relative rounded-xl border border-blue-100 bg-white p-4 shadow-card">
              <span className="text-xs font-semibold text-brand-700">0{i + 1}</span>
              <p className="mt-2 text-sm text-slate-700">{step}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Industry packs */}
      <section id="industries" className="relative mx-auto max-w-6xl px-6 pb-24 scroll-mt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Industry solution packs</h2>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Pre-wired for how your industry actually works
          </p>
          <p className="mt-3 text-sm text-slate-600">
            A pack is configuration, not a separate product — the same modules, preset with the fields,
            workflows, and dashboards your industry needs on day one.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {INDUSTRY_PACKS.map((pack) => (
            <div key={pack.name} className="rounded-2xl border border-blue-100 bg-white p-6 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover">
              <h3 className="text-base font-semibold text-slate-950">{pack.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{pack.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI Copilot */}
      <section id="ai" className="relative mx-auto max-w-6xl px-6 pb-24 scroll-mt-20">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">AI Copilot</h2>
            <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
              AI that sees your whole business, not one tool at a time
            </p>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              Every module flows through one AI Engine that reasons over your unified data —
              the same advantage a stack of disconnected tools can never replicate.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-slate-700">
              {AI_CAPABILITIES.map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <Icon path={ICONS.sparkles} className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {line}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-xl shadow-blue-900/10">
            <div className="space-y-3 text-sm">
              <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-brand-600 px-4 py-2.5 text-white">
                What was our food cost % last month, and which supplier drove the increase?
              </div>
              <div className="max-w-[90%] rounded-2xl rounded-tl-sm border border-blue-100 bg-blue-50 px-4 py-2.5 text-slate-700">
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
        <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-card sm:p-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Automation, no code</h2>
          <p className="mt-3 max-w-2xl text-xl font-semibold tracking-tight text-slate-950">
            Wire up cross-module workflows in a sentence
          </p>
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            {[
              { label: "Trigger", value: "invoice.paid", color: "bg-blue-50 text-brand-700 ring-blue-100" },
              { label: "Condition", value: "amount > ₹50,000", color: "bg-sky-50 text-sky-700 ring-sky-100" },
              { label: "Action", value: "notify + update project", color: "bg-indigo-50 text-indigo-700 ring-indigo-100" },
            ].map((step, i, arr) => (
              <div key={step.label} className="flex flex-1 items-center gap-3">
                <div className={`w-full rounded-xl ${step.color} p-4 ring-1`}>
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
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Secure and compliant by default, not retrofitted
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SECURITY_ITEMS.map((item) => (
            <div key={item.title} className="flex gap-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-card">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Icon path={ICONS.shield} />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-950">{item.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Service model */}
      <section className="relative mx-auto max-w-6xl px-6 pb-24 scroll-mt-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">Service model</h2>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Request the services your business needs
          </p>
          <p className="mt-3 text-sm text-slate-600">
            Atithira is not self-serve workspace creation from the public website. Submit your requirements and we configure the workspace with the right modules, access, and rollout plan.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Discover", tag: "Request", detail: "Tell us the services, industry pack, and modules you want to use." },
            { name: "Configure", tag: "Setup", detail: "We map your requirements to modules, roles, workflows, and data." },
            { name: "Launch", tag: "Go live", detail: "Your workspace is provisioned after review and handoff." },
            { name: "Scale", tag: "Grow", detail: "Add more services, automations, users, and integrations as needed." },
          ].map((tier) => (
            <div key={tier.name} className="flex flex-col rounded-2xl border border-blue-100 bg-white p-6 shadow-card">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{tier.tag}</span>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">{tier.name}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">{tier.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="relative mx-auto max-w-3xl px-6 pb-24">
        <div className="text-center">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500">FAQ</h2>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Common questions</p>
        </div>
        <div className="mt-10 space-y-3">
          {FAQ.map((item) => (
            <details
              key={item.q}
              className="group rounded-xl border border-blue-100 bg-white p-5 shadow-card [&_summary::-webkit-details-marker]:hidden"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-slate-950">
                {item.q}
                <Icon path="M6 9l6 6 6-6" className="h-4 w-4 shrink-0 text-slate-500 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative mx-auto max-w-4xl px-6 pb-28">
        <div className="rounded-3xl border border-blue-100 bg-blue-50 p-10 text-center shadow-xl shadow-blue-900/10">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            Run your whole business on one platform
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-slate-600">
            Submit the services you need, and our team will help configure the right Atithira workspace before launch.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a
              href="#request"
              className="rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-brand-700"
            >
              Request services
            </a>
            <Link
              href="/login"
              className="rounded-xl border border-blue-100 bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-sm transition hover:bg-blue-100"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-blue-100 bg-white px-6 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
            <BrandLogoBadge logoClassName="h-6 w-auto max-w-[7rem] object-contain" />
          </div>
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500">
            <a href="#modules" className="transition hover:text-brand-700">Modules</a>
            <a href="#industries" className="transition hover:text-brand-700">Industries</a>
            <a href="#ai" className="transition hover:text-brand-700">AI Copilot</a>
            <a href="#security" className="transition hover:text-brand-700">Security</a>
            <a href="#request" className="transition hover:text-brand-700">Request</a>
          </nav>
          <div className="text-xs text-slate-500">
            © {new Date().getFullYear()} Biztreck Solutions
          </div>
        </div>
      </footer>
    </main>
  );
}
