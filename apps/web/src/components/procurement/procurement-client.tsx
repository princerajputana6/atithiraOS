"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  PageHeader,
  Button,
  Card,
  CardBody,
  Input,
  Select,
  Field,
  Table,
  Th,
  Td,
  Badge,
  EmptyState,
} from "@/components/ui";

interface Vendor {
  _id: string;
  name: string;
  email?: string;
}
interface Product {
  _id: string;
  name: string;
  sku: string;
  unitPrice: number;
  stockQty: number;
}
interface POLine {
  productId: string;
  productName: string;
  qty: number;
  unitPrice: number;
}
interface PurchaseOrder {
  _id: string;
  number: string;
  vendorName: string;
  status: "draft" | "sent" | "received" | "cancelled";
  lines: POLine[];
  total: number;
  currency: string;
}

const PO_TONE: Record<PurchaseOrder["status"], "gray" | "blue" | "green" | "red"> = {
  draft: "gray",
  sent: "blue",
  received: "green",
  cancelled: "red",
};

interface DraftLine {
  productId: string;
  qty: string;
  unitPrice: string;
}

export function ProcurementClient() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [vendorForm, setVendorForm] = useState({ name: "", email: "" });
  const [poVendorId, setPoVendorId] = useState("");
  const [draftLines, setDraftLines] = useState<DraftLine[]>([
    { productId: "", qty: "1", unitPrice: "" },
  ]);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const [vRes, pRes, oRes] = await Promise.all([
      fetch("/api/v1/procurement/vendors"),
      fetch("/api/v1/inventory/products"),
      fetch("/api/v1/procurement/purchase-orders"),
    ]);
    if (vRes.ok) {
      const v = ((await vRes.json()).vendors ?? []) as Vendor[];
      setVendors(v);
      if (!poVendorId && v[0]) setPoVendorId(v[0]._id);
    }
    if (pRes.ok) setProducts((await pRes.json()).products ?? []);
    if (oRes.ok) setOrders((await oRes.json()).purchaseOrders ?? []);
  }
  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addVendor(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/v1/procurement/vendors", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(vendorForm),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not add vendor");
      return;
    }
    setVendorForm({ name: "", email: "" });
    await load();
  }

  function updateLine(index: number, patch: Partial<DraftLine>) {
    setDraftLines((lines) =>
      lines.map((l, i) => (i === index ? { ...l, ...patch } : l)),
    );
  }

  function onPickProduct(index: number, productId: string) {
    const product = products.find((p) => p._id === productId);
    updateLine(index, {
      productId,
      unitPrice: product ? String(product.unitPrice) : "",
    });
  }

  async function createPO(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const lines = draftLines
      .filter((l) => l.productId && Number(l.qty) > 0)
      .map((l) => ({
        productId: l.productId,
        qty: Number(l.qty),
        unitPrice: Number(l.unitPrice) || 0,
      }));
    if (!poVendorId || lines.length === 0) {
      setError("Pick a vendor and at least one product.");
      return;
    }
    const res = await fetch("/api/v1/procurement/purchase-orders", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ vendorId: poVendorId, lines }),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not create PO");
      return;
    }
    setDraftLines([{ productId: "", qty: "1", unitPrice: "" }]);
    await load();
  }

  async function receive(po: PurchaseOrder) {
    const res = await fetch(`/api/v1/procurement/purchase-orders/${po._id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "receive" }),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Could not receive PO");
      return;
    }
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Procurement"
        description="Vendors and purchase orders. Receiving a PO pushes its quantities straight into inventory stock."
      />

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Add vendor</h2>
            <form onSubmit={addVendor} className="flex flex-col gap-3">
              <Field label="Name">
                <Input
                  required
                  value={vendorForm.name}
                  onChange={(e) => setVendorForm({ ...vendorForm, name: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <Input
                  type="email"
                  value={vendorForm.email}
                  onChange={(e) => setVendorForm({ ...vendorForm, email: e.target.value })}
                />
              </Field>
              <Button type="submit">Add vendor</Button>
            </form>
            {vendors.length > 0 && (
              <ul className="mt-4 flex flex-col gap-1 text-sm text-slate-600">
                {vendors.map((v) => (
                  <li key={v._id}>• {v.name}</li>
                ))}
              </ul>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <h2 className="mb-3 text-sm font-semibold text-slate-900">
              New purchase order
            </h2>
            {vendors.length === 0 || products.length === 0 ? (
              <p className="text-sm text-slate-500">
                Add a vendor and at least one product first.
              </p>
            ) : (
              <form onSubmit={createPO} className="flex flex-col gap-3">
                <Field label="Vendor">
                  <Select value={poVendorId} onChange={(e) => setPoVendorId(e.target.value)}>
                    {vendors.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name}
                      </option>
                    ))}
                  </Select>
                </Field>
                {draftLines.map((line, i) => (
                  <div key={i} className="grid grid-cols-[1fr_70px_90px] gap-2">
                    <Select
                      value={line.productId}
                      onChange={(e) => onPickProduct(i, e.target.value)}
                    >
                      <option value="">Product…</option>
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                    <Input
                      type="number"
                      min={1}
                      value={line.qty}
                      onChange={(e) => updateLine(i, { qty: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="₹"
                      value={line.unitPrice}
                      onChange={(e) => updateLine(i, { unitPrice: e.target.value })}
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    setDraftLines((l) => [...l, { productId: "", qty: "1", unitPrice: "" }])
                  }
                  className="self-start text-sm font-medium text-brand-600 hover:text-brand-700"
                >
                  + Add line
                </button>
                <Button type="submit">Create purchase order</Button>
              </form>
            )}
          </CardBody>
        </Card>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No purchase orders yet" description="Create one above." />
      ) : (
        <Table>
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <Th>PO</Th>
              <Th>Vendor</Th>
              <Th>Items</Th>
              <Th>Total</Th>
              <Th>Status</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((po) => (
              <tr key={po._id}>
                <Td className="font-mono text-xs">{po.number}</Td>
                <Td className="font-medium text-slate-900">{po.vendorName}</Td>
                <Td>{po.lines.reduce((n, l) => n + l.qty, 0)}</Td>
                <Td>₹{po.total.toLocaleString("en-IN")}</Td>
                <Td>
                  <Badge tone={PO_TONE[po.status]}>{po.status}</Badge>
                </Td>
                <Td>
                  {po.status === "received" || po.status === "cancelled" ? (
                    <span className="text-sm text-slate-400">—</span>
                  ) : (
                    <button
                      onClick={() => receive(po)}
                      className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      Receive → stock
                    </button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
