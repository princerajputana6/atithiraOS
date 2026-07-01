import type { SiteBlock, SiteBlockAlign, SiteForm } from "@atithira/types";
import { PublicForm } from "@/components/website/public-form";
import { PublicBooking, servicesFromItems } from "@/components/website/public-booking";
import { PublicOrder, productsFromItems } from "@/components/website/public-order";

/**
 * Renderer for a page's content blocks — shared by the public site (fully
 * interactive) and the page editor's live preview (`preview` swaps the real
 * PublicForm for a static mock so editing never triggers a real submission).
 */
export function SiteRenderer({
  blocks,
  forms,
  slug,
  businessName = "This business",
  preview = false,
}: {
  blocks: SiteBlock[];
  forms: SiteForm[];
  slug: string;
  businessName?: string;
  preview?: boolean;
}) {
  const formById = new Map(forms.map((f) => [f._id, f]));
  return (
    <div className="flex flex-col">
      {blocks.map((block) => (
        <BlockView
          key={block.id}
          block={block}
          form={block.formId ? formById.get(block.formId) : undefined}
          slug={slug}
          businessName={businessName}
          preview={preview}
        />
      ))}
    </div>
  );
}

const FLEX_ALIGN: Record<SiteBlockAlign, string> = {
  left: "items-start text-left",
  center: "items-center text-center",
  right: "items-end text-right",
};

const TEXT_ALIGN: Record<SiteBlockAlign, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

function BlockView({
  block,
  form,
  slug,
  businessName,
  preview,
}: {
  block: SiteBlock;
  form?: SiteForm;
  slug: string;
  businessName: string;
  preview: boolean;
}) {
  const items = block.items ?? [];
  switch (block.type) {
    case "navbar":
      return (
        <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
            <span className="text-lg font-bold text-slate-900">{block.heading}</span>
            <nav className="hidden items-center gap-6 text-sm text-slate-600 sm:flex">
              {items.map((it) => (
                <a key={it.id} href={it.href || "#"} className="transition hover:text-slate-900">
                  {it.text}
                </a>
              ))}
            </nav>
            {block.buttonLabel && (
              <a
                href={block.buttonHref || "#"}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
              >
                {block.buttonLabel}
              </a>
            )}
          </div>
        </header>
      );

    case "hero":
      return (
        <section
          className={`relative flex flex-col justify-center gap-4 px-6 py-24 text-white ${FLEX_ALIGN[block.align ?? "center"]}`}
          style={{
            backgroundImage: block.imageUrl
              ? `linear-gradient(rgba(15,23,42,0.6),rgba(15,23,42,0.6)), url(${block.imageUrl})`
              : block.bgColor
                ? undefined
                : "linear-gradient(135deg,#4f46e5,#0ea5e9)",
            backgroundColor: !block.imageUrl ? block.bgColor : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <h1 className="max-w-3xl text-4xl font-bold leading-tight sm:text-5xl">{block.heading}</h1>
          {block.text && <p className="max-w-xl text-lg text-white/85">{block.text}</p>}
          {block.buttonLabel && (
            <a
              href={block.buttonHref || "#"}
              className="mt-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              {block.buttonLabel}
            </a>
          )}
        </section>
      );

    case "heading":
      return (
        <section className={`mx-auto max-w-3xl px-6 pt-12 ${TEXT_ALIGN[block.align ?? "left"]}`}>
          <h2 className="text-2xl font-bold text-slate-900">{block.text}</h2>
        </section>
      );

    case "text":
      return (
        <section className={`mx-auto max-w-3xl px-6 py-4 ${TEXT_ALIGN[block.align ?? "left"]}`}>
          <p className="whitespace-pre-wrap leading-relaxed text-slate-700">{block.text}</p>
        </section>
      );

    case "image":
      return (
        <section className="mx-auto max-w-4xl px-6 py-6">
          {block.imageUrl && (
            <img src={block.imageUrl} alt={block.text ?? ""} className="w-full rounded-xl" />
          )}
          {block.text && <p className="mt-2 text-center text-sm text-slate-500">{block.text}</p>}
        </section>
      );

    case "features":
      return (
        <section className="px-6 py-16" style={{ backgroundColor: block.bgColor || undefined }}>
          <div className="mx-auto max-w-5xl">
            {block.heading && (
              <div className={`mb-10 ${TEXT_ALIGN[block.align ?? "center"]}`}>
                <h2 className="text-3xl font-bold text-slate-900">{block.heading}</h2>
                {block.text && <p className="mt-2 text-slate-500">{block.text}</p>}
              </div>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((it) => (
                <div key={it.id} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                  {it.icon && <div className="text-3xl">{it.icon}</div>}
                  <div className="mt-3 flex items-baseline justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{it.title}</h3>
                    {it.heading && <span className="text-sm font-semibold text-indigo-600">{it.heading}</span>}
                  </div>
                  {it.text && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{it.text}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "gallery":
      return (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-5xl">
            {block.heading && (
              <h2 className={`mb-8 text-3xl font-bold text-slate-900 ${TEXT_ALIGN[block.align ?? "center"]}`}>
                {block.heading}
              </h2>
            )}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {items.map((it) =>
                it.imageUrl ? (
                  <img
                    key={it.id}
                    src={it.imageUrl}
                    alt={it.title ?? ""}
                    className="aspect-[4/3] w-full rounded-xl object-cover"
                  />
                ) : null,
              )}
            </div>
          </div>
        </section>
      );

    case "stats":
      return (
        <section className="px-6 py-14 text-white" style={{ backgroundColor: block.bgColor || "#0f172a" }}>
          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 text-center sm:grid-cols-3">
            {items.map((it) => (
              <div key={it.id}>
                <div className="text-4xl font-bold">{it.title}</div>
                {it.text && <div className="mt-1 text-sm text-white/70">{it.text}</div>}
              </div>
            ))}
          </div>
        </section>
      );

    case "testimonials":
      return (
        <section className="px-6 py-16">
          <div className="mx-auto max-w-4xl">
            {block.heading && (
              <h2 className={`mb-8 text-3xl font-bold text-slate-900 ${TEXT_ALIGN[block.align ?? "center"]}`}>
                {block.heading}
              </h2>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {items.map((it) => (
                <figure key={it.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-6">
                  <blockquote className="text-slate-700">“{it.text}”</blockquote>
                  {it.title && <figcaption className="mt-3 text-sm font-semibold text-slate-500">— {it.title}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        </section>
      );

    case "pricing":
      return (
        <section className="px-6 py-16" style={{ backgroundColor: block.bgColor || undefined }}>
          <div className="mx-auto max-w-5xl">
            {block.heading && (
              <div className={`mb-10 ${TEXT_ALIGN[block.align ?? "center"]}`}>
                <h2 className="text-3xl font-bold text-slate-900">{block.heading}</h2>
                {block.text && <p className="mt-2 text-slate-500">{block.text}</p>}
              </div>
            )}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {items.map((it) => (
                <div key={it.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 text-center">
                  <h3 className="text-lg font-semibold text-slate-900">{it.title}</h3>
                  {it.heading && <div className="mt-2 text-3xl font-bold text-slate-900">{it.heading}</div>}
                  {it.text && <p className="mt-3 text-sm leading-relaxed text-slate-500">{it.text}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      );

    case "cta":
      return (
        <section
          className={`mx-auto my-10 max-w-4xl rounded-3xl px-8 py-14 text-white ${TEXT_ALIGN[block.align ?? "center"]}`}
          style={{ backgroundColor: block.bgColor || "#0f172a" }}
        >
          <h3 className="text-3xl font-bold">{block.heading}</h3>
          {block.text && <p className="mt-2 text-white/80">{block.text}</p>}
          {block.buttonLabel && (
            <a
              href={block.buttonHref || "#"}
              className="mt-5 inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
            >
              {block.buttonLabel}
            </a>
          )}
        </section>
      );

    case "booking":
      return (
        <section id="book" className="px-6 py-16" style={{ backgroundColor: block.bgColor || undefined }}>
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-slate-900">{block.heading || "Book an appointment"}</h2>
              {block.text && <p className="mt-2 text-slate-500">{block.text}</p>}
            </div>
            {preview ? (
              <ActionPreviewStub
                label="Booking form"
                lines={items.map((it) => `${it.title ?? "Service"}${it.heading ? ` — ${it.heading}` : ""}`)}
              />
            ) : (
              <PublicBooking slug={slug} businessName={businessName} services={servicesFromItems(items)} />
            )}
          </div>
        </section>
      );

    case "menu":
      return (
        <section id="order" className="px-6 py-16" style={{ backgroundColor: block.bgColor || undefined }}>
          <div className="mx-auto max-w-3xl">
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-slate-900">{block.heading || "Order online"}</h2>
              {block.text && <p className="mt-2 text-slate-500">{block.text}</p>}
            </div>
            {preview ? (
              <ActionPreviewStub
                label="Order form"
                lines={items.map((it) => `${it.title ?? "Item"}${it.heading ? ` — ${it.heading}` : ""}`)}
              />
            ) : (
              <PublicOrder slug={slug} businessName={businessName} products={productsFromItems(items)} />
            )}
          </div>
        </section>
      );

    case "form":
      return (
        <section id="contact" className="mx-auto max-w-3xl px-6 py-16">
          {block.heading && (
            <div className="mb-6 text-center">
              <h2 className="text-3xl font-bold text-slate-900">{block.heading}</h2>
              {block.text && <p className="mt-2 text-slate-500">{block.text}</p>}
            </div>
          )}
          {preview ? (
            <FormPreviewStub form={form} />
          ) : form ? (
            <PublicForm slug={slug} form={form} />
          ) : (
            <p className="text-center text-sm text-slate-400">Select a form to embed it here.</p>
          )}
        </section>
      );

    case "footer":
      return (
        <footer className="border-t border-slate-100 bg-slate-50 px-6 py-10">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center">
            <span className="text-base font-bold text-slate-900">{block.heading}</span>
            {block.text && <p className="text-sm text-slate-500">{block.text}</p>}
            {items.length > 0 && (
              <nav className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-slate-500">
                {items.map((it) => (
                  <a key={it.id} href={it.href || "#"} className="hover:text-slate-800">
                    {it.text}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </footer>
      );

    default:
      return null;
  }
}

function ActionPreviewStub({ label, lines }: { label: string; lines: string[] }) {
  return (
    <div className="mx-auto max-w-md rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <div className="mt-3 flex flex-col gap-2">
        {lines.length === 0 ? (
          <p className="text-xs text-slate-400">Add items in the editor to offer them here.</p>
        ) : (
          lines.map((line, i) => (
            <div key={i} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
              {line}
            </div>
          ))
        )}
        <span className="mt-1 inline-block w-fit rounded-lg bg-slate-300 px-4 py-2 text-xs font-semibold text-slate-600">
          Live &amp; interactive on the published site
        </span>
      </div>
    </div>
  );
}

function FormPreviewStub({ form }: { form?: SiteForm }) {
  if (!form) {
    return <p className="text-center text-sm text-slate-400">Select a form to embed it here.</p>;
  }
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6">
      <p className="text-sm font-semibold text-slate-700">{form.name}</p>
      <div className="mt-3 flex flex-col gap-2">
        {form.fields.map((field) => (
          <div key={field.key} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-400">
            {field.label}
            {field.required && <span className="text-red-400"> *</span>}
          </div>
        ))}
        <span className="mt-1 inline-block w-fit rounded-lg bg-slate-300 px-4 py-2 text-xs font-semibold text-slate-600">
          {form.submitText || "Submit"}
        </span>
      </div>
      <p className="mt-2 text-[11px] text-slate-400">Preview only — live on the published page.</p>
    </div>
  );
}
