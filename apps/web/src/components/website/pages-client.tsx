"use client";

import { useCallback, useEffect, useState, type DragEvent, type FormEvent } from "react";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Field,
  Badge,
  EmptyState,
} from "@/components/ui";
import { SiteRenderer } from "@/components/website/site-renderer";
import {
  templatesForCategory,
  type SiteBlock,
  type SiteBlockType,
  type SiteBlockItem,
  type SiteBlockAlign,
  type PageStatus,
  type SiteForm,
  type WebsiteTemplate,
} from "@atithira/types";

interface SitePage {
  _id: string;
  title: string;
  slug: string;
  blocks: SiteBlock[];
  status: PageStatus;
  isHome: boolean;
}

const BLOCK_TYPES: { type: SiteBlockType; label: string }[] = [
  { type: "navbar", label: "Nav bar" },
  { type: "hero", label: "Hero" },
  { type: "heading", label: "Heading" },
  { type: "text", label: "Text" },
  { type: "image", label: "Image" },
  { type: "features", label: "Features" },
  { type: "gallery", label: "Gallery" },
  { type: "stats", label: "Stats" },
  { type: "testimonials", label: "Testimonials" },
  { type: "pricing", label: "Pricing" },
  { type: "booking", label: "Booking" },
  { type: "menu", label: "Menu / Order" },
  { type: "cta", label: "Call to action" },
  { type: "form", label: "Form" },
  { type: "footer", label: "Footer" },
];

const uid = () => crypto.randomUUID();

/** Block types that hold a repeatable list of items, with a default new-item shape. */
const ITEM_BLOCKS: Partial<Record<SiteBlockType, () => Omit<SiteBlockItem, "id">>> = {
  navbar: () => ({ text: "Link", href: "#" }),
  features: () => ({ icon: "⭐", title: "Feature", text: "Describe this feature." }),
  gallery: () => ({ imageUrl: "" }),
  stats: () => ({ title: "100+", text: "Label" }),
  testimonials: () => ({ text: "A short quote from a happy customer.", title: "Name" }),
  pricing: () => ({ title: "Plan", heading: "₹0", text: "What's included." }),
  booking: () => ({ title: "Service", heading: "₹500", text: "30 min" }),
  menu: () => ({ title: "Item", heading: "₹200", text: "Short description." }),
  footer: () => ({ text: "Link", href: "#" }),
};

function seedBlock(type: SiteBlockType): SiteBlock {
  const base: SiteBlock = { id: uid(), type };
  const make = ITEM_BLOCKS[type];
  if (make) {
    const count = type === "gallery" ? 3 : type === "stats" ? 3 : 2;
    base.items = Array.from({ length: count }, () => ({ id: uid(), ...make() }));
  }
  if (type === "navbar") base.heading = "Brand";
  if (type === "footer") base.heading = "Brand";
  if (type === "booking") {
    base.heading = "Book an appointment";
    base.text = "Choose a service and a time that works for you.";
  }
  if (type === "menu") {
    base.heading = "Order online";
    base.text = "Pick your items and check out.";
  }
  if (type === "features" || type === "pricing" || type === "gallery" || type === "testimonials") {
    base.heading = "Section title";
  }
  return base;
}

/** Clone a template's blocks with fresh ids so they become an editable page. */
function instantiateTemplate(tpl: WebsiteTemplate): SiteBlock[] {
  return tpl.blocks.map((b) => ({
    ...b,
    id: uid(),
    items: b.items?.map((it) => ({ ...it, id: uid() })),
  }));
}

export function PagesClient({ industry }: { industry?: string | null }) {
  const [pages, setPages] = useState<SitePage[]>([]);
  const [forms, setForms] = useState<SiteForm[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SitePage | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const templates = templatesForCategory(industry);

  const load = useCallback(async () => {
    const [pRes, fRes] = await Promise.all([
      fetch("/api/v1/website/pages"),
      fetch("/api/v1/website/forms"),
    ]);
    if (pRes.ok) {
      const list = ((await pRes.json()).pages ?? []) as SitePage[];
      setPages(list);
      setActiveId((cur) => cur ?? list[0]?._id ?? null);
    }
    if (fRes.ok) setForms(((await fRes.json()).forms ?? []) as SiteForm[]);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const page = pages.find((p) => p._id === activeId);
    setDraft(page ? structuredClone(page) : null);
  }, [activeId, pages]);

  async function createPage(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/v1/website/pages", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: newTitle, isHome: pages.length === 0 }),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not create page");
      return;
    }
    const { page } = await res.json();
    setNewTitle("");
    await load();
    setActiveId(page._id);
    setShowTemplates(true);
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/v1/website/pages/${draft._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        title: draft.title,
        slug: draft.slug,
        blocks: draft.blocks,
        isHome: draft.isHome,
      }),
    });
    setSaving(false);
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not save");
      return;
    }
    await load();
  }

  async function togglePublish() {
    if (!draft) return;
    const status: PageStatus = draft.status === "published" ? "draft" : "published";
    const res = await fetch(`/api/v1/website/pages/${draft._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) await load();
  }

  async function remove() {
    if (!draft) return;
    if (!confirm(`Delete “${draft.title}”?`)) return;
    const res = await fetch(`/api/v1/website/pages/${draft._id}`, { method: "DELETE" });
    if (res.ok) {
      setActiveId(null);
      await load();
    }
  }

  function applyTemplate(tpl: WebsiteTemplate) {
    if (
      draft &&
      draft.blocks.length > 0 &&
      !confirm("Replace the current page content with this template?")
    ) {
      return;
    }
    setDraft((d) => (d ? { ...d, blocks: instantiateTemplate(tpl) } : d));
    setShowTemplates(false);
  }

  /* block ops */
  function patchBlock(id: string, patch: Partial<SiteBlock>) {
    setDraft((d) =>
      d ? { ...d, blocks: d.blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) } : d,
    );
  }
  function addBlock(type: SiteBlockType) {
    setDraft((d) => (d ? { ...d, blocks: [...d.blocks, seedBlock(type)] } : d));
  }
  function removeBlock(id: string) {
    setDraft((d) => (d ? { ...d, blocks: d.blocks.filter((b) => b.id !== id) } : d));
  }
  function moveBlock(id: string, dir: -1 | 1) {
    setDraft((d) => {
      if (!d) return d;
      const i = d.blocks.findIndex((b) => b.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= d.blocks.length) return d;
      const blocks = [...d.blocks];
      const a = blocks[i]!;
      blocks[i] = blocks[j]!;
      blocks[j] = a;
      return { ...d, blocks };
    });
  }
  function reorderBlocks(draggedId: string, targetId: string) {
    if (draggedId === targetId) return;
    setDraft((d) => {
      if (!d) return d;
      const blocks = [...d.blocks];
      const fromIdx = blocks.findIndex((b) => b.id === draggedId);
      const toIdx = blocks.findIndex((b) => b.id === targetId);
      if (fromIdx < 0 || toIdx < 0) return d;
      const moved = blocks.splice(fromIdx, 1)[0]!;
      blocks.splice(toIdx, 0, moved);
      return { ...d, blocks };
    });
  }
  function handleDrop(e: DragEvent, targetId: string) {
    e.preventDefault();
    if (dragId) reorderBlocks(dragId, targetId);
    setDragId(null);
  }

  /* item ops */
  function addItem(blockId: string, type: SiteBlockType) {
    const make = ITEM_BLOCKS[type];
    if (!make) return;
    setDraft((d) =>
      d
        ? {
            ...d,
            blocks: d.blocks.map((b) =>
              b.id === blockId ? { ...b, items: [...(b.items ?? []), { id: uid(), ...make() }] } : b,
            ),
          }
        : d,
    );
  }
  function patchItem(blockId: string, itemId: string, patch: Partial<SiteBlockItem>) {
    setDraft((d) =>
      d
        ? {
            ...d,
            blocks: d.blocks.map((b) =>
              b.id === blockId
                ? { ...b, items: (b.items ?? []).map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
                : b,
            ),
          }
        : d,
    );
  }
  function removeItem(blockId: string, itemId: string) {
    setDraft((d) =>
      d
        ? {
            ...d,
            blocks: d.blocks.map((b) =>
              b.id === blockId ? { ...b, items: (b.items ?? []).filter((it) => it.id !== itemId) } : b,
            ),
          }
        : d,
    );
  }

  return (
    <div>
      <PageHeader
        title="Website builder"
        description="Start from a template, drag blocks to rearrange, edit content, and watch the preview update live — then publish."
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Pages</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{pages.length}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Published</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700">
              {pages.filter((page) => page.status === "published").length}
            </p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Current blocks</p>
            <p className="mt-2 text-2xl font-semibold text-brand-700">{draft?.blocks.length ?? 0}</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        {/* Page list + create */}
        <div className="flex flex-col gap-3 lg:sticky lg:top-20 lg:self-start">
          <Card className="overflow-hidden p-0">
            <div className="bg-sidebar-gradient px-5 py-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-100/70">Site pages</p>
              <p className="mt-1 text-sm text-blue-50/80">Create pages, pick one, then build it block by block.</p>
            </div>
            <CardBody>
              <form onSubmit={createPage} className="flex flex-col gap-2">
                <Field label="New page title">
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />
                </Field>
                <Button type="submit">Add page</Button>
              </form>
            </CardBody>
          </Card>
          <div className="flex flex-col gap-2">
            {pages.map((p) => (
              <button
                key={p._id}
                onClick={() => setActiveId(p._id)}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                  activeId === p._id
                    ? "border-brand-300 bg-blue-50 shadow-sm"
                    : "border-blue-100 bg-white hover:border-brand-200 hover:bg-blue-50"
                }`}
              >
                <span className="min-w-0 truncate font-medium text-slate-800">
                  {p.title}
                  {p.isHome && <span className="ml-1 text-xs text-slate-400">(home)</span>}
                </span>
                <Badge tone={p.status === "published" ? "green" : "gray"}>{p.status}</Badge>
              </button>
            ))}
          </div>
        </div>

        {/* Editor + preview */}
        {!draft ? (
          <EmptyState title="No page selected" description="Create or pick a page to edit." />
        ) : (
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_440px] xl:items-start">
            <div className="flex flex-col gap-4">
              <Card className="overflow-hidden p-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-blue-50 px-5 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">Page settings</p>
                    <p className="mt-0.5 text-xs text-slate-600">Metadata, status, templates, and publishing controls.</p>
                  </div>
                  <Badge tone={draft.status === "published" ? "green" : "gray"}>{draft.status}</Badge>
                </div>
                <CardBody className="flex flex-col gap-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Field label="Title">
                      <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
                    </Field>
                    <Field label="URL slug">
                      <Input value={draft.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
                    </Field>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={draft.isHome}
                      onChange={(e) => setDraft({ ...draft, isHome: e.target.checked })}
                    />
                    Home page
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <Button onClick={save} loading={saving}>Save</Button>
                    <Button variant="secondary" onClick={togglePublish}>
                      {draft.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button variant="secondary" onClick={() => setShowTemplates((s) => !s)}>
                      {showTemplates ? "Hide templates" : "Templates"}
                    </Button>
                    <Button variant="danger" onClick={remove}>Delete</Button>
                  </div>
                </CardBody>
              </Card>

              {/* Template gallery */}
              {showTemplates && (
                <Card>
                  <CardBody>
                    <p className="mb-1 text-sm font-semibold text-slate-800">Start from a template</p>
                    <p className="mb-3 text-xs text-slate-500">
                      Pick a ready-made design{industry ? " for your industry" : ""} — then just edit the content.
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {templates.map((tpl) => (
                        <button
                          key={tpl.key}
                          onClick={() => applyTemplate(tpl)}
                          className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-brand-400 hover:shadow-card-hover"
                        >
                          <span
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
                            style={{ backgroundColor: `${tpl.accent}1a` }}
                          >
                            {tpl.emoji}
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-slate-900">{tpl.name}</span>
                            <span className="mt-0.5 block text-xs text-slate-500">{tpl.description}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              )}

              {/* Blocks */}
              <div className="flex flex-col gap-3">
                {draft.blocks.map((block) => (
                  <div
                    key={block.id}
                    onDragOver={(e: DragEvent) => e.preventDefault()}
                    onDrop={(e: DragEvent) => handleDrop(e, block.id)}
                    className={dragId === block.id ? "opacity-50" : undefined}
                  >
                    <Card>
                      <CardBody className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              draggable
                              onDragStart={() => setDragId(block.id)}
                              onDragEnd={() => setDragId(null)}
                              title="Drag to reorder"
                              className="cursor-grab select-none text-slate-400 hover:text-slate-600 active:cursor-grabbing"
                            >
                              ⠿
                            </span>
                            <Badge tone="blue">{block.type}</Badge>
                          </div>
                          <div className="flex gap-2 text-xs">
                            <button onClick={() => moveBlock(block.id, -1)} className="text-slate-500 hover:text-slate-800">↑</button>
                            <button onClick={() => moveBlock(block.id, 1)} className="text-slate-500 hover:text-slate-800">↓</button>
                            <button onClick={() => removeBlock(block.id)} className="text-red-500 hover:text-red-700">Remove</button>
                          </div>
                        </div>
                        <BlockEditor
                          block={block}
                          forms={forms}
                          onChange={(patch) => patchBlock(block.id, patch)}
                          onAddItem={() => addItem(block.id, block.type)}
                          onPatchItem={(itemId, patch) => patchItem(block.id, itemId, patch)}
                          onRemoveItem={(itemId) => removeItem(block.id, itemId)}
                        />
                      </CardBody>
                    </Card>
                  </div>
                ))}
              </div>

              <Card className="overflow-hidden p-0">
                <div className="border-b border-blue-100 bg-blue-50 px-5 py-4">
                  <p className="text-sm font-semibold text-slate-950">Block library</p>
                  <p className="mt-0.5 text-xs text-slate-600">Add a section to the selected page.</p>
                </div>
                <CardBody>
                  <div className="flex flex-wrap gap-2">
                    {BLOCK_TYPES.map((b) => (
                      <button
                        key={b.type}
                        onClick={() => addBlock(b.type)}
                        className="rounded-lg border border-blue-100 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:border-brand-200 hover:bg-blue-50"
                      >
                        + {b.label}
                      </button>
                    ))}
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Live preview */}
            <div className="xl:sticky xl:top-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">Live preview</p>
              <div className="overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-xl shadow-blue-900/10">
                <div className="flex items-center gap-1.5 border-b border-blue-100 bg-blue-50 px-3 py-2">
                  <span className="h-2 w-2 rounded-full bg-red-300" />
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span className="ml-2 truncate font-mono text-[11px] text-slate-500">/{draft.slug}</span>
                </div>
                <div className="max-h-[75vh] overflow-y-auto">
                  {draft.blocks.length === 0 ? (
                    <p className="p-8 text-center text-sm text-slate-400">
                      Apply a template or add a block to see it here.
                    </p>
                  ) : (
                    <SiteRenderer blocks={draft.blocks} forms={forms} slug="preview" preview />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------------------- editors -------------------------------- */

const ALIGN_OPTIONS: { value: SiteBlockAlign; label: string }[] = [
  { value: "left", label: "Left" },
  { value: "center", label: "Center" },
  { value: "right", label: "Right" },
];

function BlockEditor({
  block,
  forms,
  onChange,
  onAddItem,
  onPatchItem,
  onRemoveItem,
}: {
  block: SiteBlock;
  forms: SiteForm[];
  onChange: (patch: Partial<SiteBlock>) => void;
  onAddItem: () => void;
  onPatchItem: (itemId: string, patch: Partial<SiteBlockItem>) => void;
  onRemoveItem: (itemId: string) => void;
}) {
  const t = block.type;
  const hasHeading = ["navbar", "hero", "cta", "features", "pricing", "gallery", "testimonials", "footer", "form", "booking", "menu"].includes(t);
  const hasText = ["hero", "text", "heading", "cta", "image", "features", "pricing", "footer", "form", "booking", "menu"].includes(t);
  const hasImage = t === "hero" || t === "image";
  const hasButton = t === "hero" || t === "cta" || t === "navbar";
  const supportsAlign = ["hero", "cta", "heading", "text", "features", "pricing", "gallery", "testimonials"].includes(t);
  const supportsColor = ["hero", "cta", "features", "pricing", "stats", "booking", "menu"].includes(t);
  const headingLabel =
    t === "navbar" || t === "footer" ? "Brand" : t === "image" ? "" : "Heading";
  const textLabel =
    t === "image"
      ? "Caption"
      : t === "footer"
        ? "Tagline"
        : t === "form" || t === "booking" || t === "menu"
          ? "Subtitle"
          : "Text";

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {hasHeading && headingLabel && (
          <Field label={headingLabel}>
            <Input value={block.heading ?? ""} onChange={(e) => onChange({ heading: e.target.value })} />
          </Field>
        )}
        {hasText && (
          <Field label={textLabel}>
            <Input value={block.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
        )}
        {hasImage && (
          <Field label="Image URL">
            <Input value={block.imageUrl ?? ""} onChange={(e) => onChange({ imageUrl: e.target.value })} />
          </Field>
        )}
        {hasButton && (
          <>
            <Field label="Button label">
              <Input value={block.buttonLabel ?? ""} onChange={(e) => onChange({ buttonLabel: e.target.value })} />
            </Field>
            <Field label="Button link">
              <Input value={block.buttonHref ?? ""} onChange={(e) => onChange({ buttonHref: e.target.value })} />
            </Field>
          </>
        )}
        {t === "form" && (
          <Field label="Form">
            <Select value={block.formId ?? ""} onChange={(e) => onChange({ formId: e.target.value })}>
              <option value="">Select a form…</option>
              {forms.map((f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ))}
            </Select>
          </Field>
        )}
        {supportsAlign && (
          <Field label="Alignment">
            <Select
              value={block.align ?? ""}
              onChange={(e) => onChange({ align: (e.target.value || undefined) as SiteBlockAlign | undefined })}
            >
              <option value="">Default</option>
              {ALIGN_OPTIONS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </Select>
          </Field>
        )}
        {supportsColor && (
          <Field label="Background color">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={block.bgColor ?? "#0f172a"}
                onChange={(e) => onChange({ bgColor: e.target.value })}
                className="h-9 w-12 cursor-pointer rounded border border-slate-300 bg-white p-1"
              />
              {block.bgColor && (
                <button type="button" onClick={() => onChange({ bgColor: undefined })} className="text-xs text-slate-500 hover:text-slate-800">
                  Reset
                </button>
              )}
            </div>
          </Field>
        )}
      </div>

      {/* Repeatable items */}
      {block.items && ITEM_BLOCKS[t] && (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            {t === "gallery"
              ? "Images"
              : t === "navbar" || t === "footer"
                ? "Links"
                : t === "booking"
                  ? "Services (name, price, duration)"
                  : t === "menu"
                    ? "Menu items (name, price, description)"
                    : "Items"}
          </p>
          <div className="flex flex-col gap-2">
            {block.items.map((it) => (
              <div key={it.id} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-2">
                <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-2">
                  <ItemFields type={t} item={it} onChange={(patch) => onPatchItem(it.id, patch)} />
                </div>
                <button
                  onClick={() => onRemoveItem(it.id)}
                  className="mt-1 shrink-0 text-xs text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={onAddItem}
            className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            + Add {t === "gallery" ? "image" : t === "navbar" || t === "footer" ? "link" : t === "booking" ? "service" : "item"}
          </button>
        </div>
      )}
    </div>
  );
}

function ItemFields({
  type,
  item,
  onChange,
}: {
  type: SiteBlockType;
  item: SiteBlockItem;
  onChange: (patch: Partial<SiteBlockItem>) => void;
}) {
  switch (type) {
    case "navbar":
    case "footer":
      return (
        <>
          <Field label="Label">
            <Input value={item.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
          <Field label="Link">
            <Input value={item.href ?? ""} onChange={(e) => onChange({ href: e.target.value })} />
          </Field>
        </>
      );
    case "features":
      return (
        <>
          <Field label="Icon (emoji)">
            <Input value={item.icon ?? ""} onChange={(e) => onChange({ icon: e.target.value })} />
          </Field>
          <Field label="Title">
            <Input value={item.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Badge / price (optional)">
            <Input value={item.heading ?? ""} onChange={(e) => onChange({ heading: e.target.value })} />
          </Field>
          <Field label="Description">
            <Input value={item.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
        </>
      );
    case "gallery":
      return (
        <Field label="Image URL">
          <Input value={item.imageUrl ?? ""} onChange={(e) => onChange({ imageUrl: e.target.value })} />
        </Field>
      );
    case "stats":
      return (
        <>
          <Field label="Value">
            <Input value={item.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Label">
            <Input value={item.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
        </>
      );
    case "testimonials":
      return (
        <>
          <Field label="Quote">
            <Input value={item.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
          <Field label="Author">
            <Input value={item.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
        </>
      );
    case "pricing":
      return (
        <>
          <Field label="Plan name">
            <Input value={item.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Price">
            <Input value={item.heading ?? ""} onChange={(e) => onChange({ heading: e.target.value })} />
          </Field>
          <Field label="Details">
            <Input value={item.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
        </>
      );
    case "booking":
      return (
        <>
          <Field label="Service name">
            <Input value={item.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Price (blank = free)">
            <Input placeholder="₹500" value={item.heading ?? ""} onChange={(e) => onChange({ heading: e.target.value })} />
          </Field>
          <Field label="Duration / note">
            <Input placeholder="30 min" value={item.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
        </>
      );
    case "menu":
      return (
        <>
          <Field label="Item name">
            <Input value={item.title ?? ""} onChange={(e) => onChange({ title: e.target.value })} />
          </Field>
          <Field label="Price">
            <Input placeholder="₹200" value={item.heading ?? ""} onChange={(e) => onChange({ heading: e.target.value })} />
          </Field>
          <Field label="Description">
            <Input value={item.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} />
          </Field>
        </>
      );
    default:
      return null;
  }
}
