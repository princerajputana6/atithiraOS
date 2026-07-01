"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
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
  Table,
  Th,
  Td,
} from "@/components/ui";
import type { SiteFormField, FormFieldType } from "@atithira/types";

interface SiteForm {
  _id: string;
  name: string;
  fields: SiteFormField[];
  submitText: string;
  createsLead: boolean;
}
interface Submission {
  _id: string;
  formId: string;
  data: Record<string, string>;
  leadId: string | null;
  createdAt: string;
}

const FIELD_TYPES: FormFieldType[] = ["text", "email", "phone", "textarea"];

function slugKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "") || "field";
}

interface DraftField {
  label: string;
  type: FormFieldType;
  required: boolean;
}

export function FormsClient() {
  const [forms, setForms] = useState<SiteForm[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [name, setName] = useState("");
  const [createsLead, setCreatesLead] = useState(true);
  const [fields, setFields] = useState<DraftField[]>([
    { label: "Name", type: "text", required: true },
    { label: "Email", type: "email", required: true },
  ]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/v1/website/forms");
    if (res.ok) {
      const list = ((await res.json()).forms ?? []) as SiteForm[];
      setForms(list);
      setActiveId((cur) => cur ?? list[0]?._id ?? null);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!activeId) {
      setSubmissions([]);
      return;
    }
    void (async () => {
      const res = await fetch(`/api/v1/website/submissions?formId=${activeId}`);
      if (res.ok) setSubmissions((await res.json()).submissions ?? []);
    })();
  }, [activeId]);

  async function createForm(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      name,
      createsLead,
      fields: fields
        .filter((f) => f.label.trim())
        .map((f) => ({ key: slugKey(f.label), label: f.label, type: f.type, required: f.required })),
    };
    if (payload.fields.length === 0) {
      setError("Add at least one field.");
      return;
    }
    const res = await fetch("/api/v1/website/forms", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not create form");
      return;
    }
    const { form } = await res.json();
    setName("");
    setFields([
      { label: "Name", type: "text", required: true },
      { label: "Email", type: "email", required: true },
    ]);
    await load();
    setActiveId(form._id);
  }

  const activeForm = forms.find((f) => f._id === activeId);

  return (
    <div>
      <PageHeader
        title="Forms"
        description="Build a form; every submission is captured and — when enabled — becomes a CRM lead automatically."
      />
      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">New form</h2>
            <form onSubmit={createForm} className="flex flex-col gap-3">
              <Field label="Form name">
                <Input value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-slate-600">Fields</span>
                {fields.map((f, i) => (
                  <div key={i} className="grid grid-cols-[1fr_110px_auto_auto] items-center gap-2">
                    <Input
                      placeholder="Label"
                      value={f.label}
                      onChange={(e) =>
                        setFields((fs) => fs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))
                      }
                    />
                    <Select
                      value={f.type}
                      onChange={(e) =>
                        setFields((fs) =>
                          fs.map((x, j) => (j === i ? { ...x, type: e.target.value as FormFieldType } : x)),
                        )
                      }
                    >
                      {FIELD_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </Select>
                    <label className="flex items-center gap-1 text-xs text-slate-500">
                      <input
                        type="checkbox"
                        checked={f.required}
                        onChange={(e) =>
                          setFields((fs) => fs.map((x, j) => (j === i ? { ...x, required: e.target.checked } : x)))
                        }
                      />
                      req
                    </label>
                    <button
                      type="button"
                      onClick={() => setFields((fs) => fs.filter((_, j) => j !== i))}
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFields((fs) => [...fs, { label: "", type: "text", required: false }])}
                  className="self-start text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  + Add field
                </button>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={createsLead} onChange={(e) => setCreatesLead(e.target.checked)} />
                Create a CRM lead from each submission
              </label>
              <Button type="submit">Create form</Button>
            </form>
          </CardBody>
        </Card>

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {forms.map((f) => (
              <button
                key={f._id}
                onClick={() => setActiveId(f._id)}
                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                  activeId === f._id ? "border-brand-400 bg-brand-50" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                {f.name}
                {f.createsLead && <span className="ml-1 text-xs text-emerald-600">→ lead</span>}
              </button>
            ))}
          </div>

          {!activeForm ? (
            <EmptyState title="No form selected" description="Create a form to see its submissions here." />
          ) : (
            <Card>
              <CardBody>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-900">{activeForm.name} · submissions</h3>
                  <Badge tone="gray">{submissions.length}</Badge>
                </div>
                {submissions.length === 0 ? (
                  <p className="text-sm text-slate-500">No submissions yet.</p>
                ) : (
                  <Table>
                    <thead className="border-b border-slate-200 bg-slate-50">
                      <tr>
                        {activeForm.fields.map((f) => (
                          <Th key={f.key}>{f.label}</Th>
                        ))}
                        <Th>Lead</Th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {submissions.map((s) => (
                        <tr key={s._id}>
                          {activeForm.fields.map((f) => (
                            <Td key={f.key}>{s.data[f.key] ?? "—"}</Td>
                          ))}
                          <Td>{s.leadId ? <Badge tone="green">created</Badge> : "—"}</Td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
