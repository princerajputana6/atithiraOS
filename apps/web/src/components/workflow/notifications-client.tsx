"use client";

import { useEffect, useState } from "react";
import { PageHeader, Card, CardBody, EmptyState } from "@/components/ui";

interface Notification {
  _id: string;
  message: string;
  read: boolean;
  source?: string;
  createdAt: string;
}

export function NotificationsClient() {
  const [items, setItems] = useState<Notification[]>([]);

  async function load() {
    const res = await fetch("/api/v1/workflow/notifications");
    if (res.ok) setItems((await res.json()).notifications ?? []);
  }
  useEffect(() => {
    void load();
  }, []);

  async function markRead(n: Notification) {
    await fetch(`/api/v1/workflow/notifications/${n._id}`, { method: "PATCH" });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Alerts raised by your automation rules."
      />
      {items.length === 0 ? (
        <EmptyState
          title="No notifications yet"
          description="When an automation rule fires a notification, it shows up here."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((n) => (
            <Card key={n._id}>
              <CardBody className="flex items-center justify-between">
                <div>
                  <p
                    className={`text-sm ${n.read ? "text-slate-500" : "font-medium text-slate-900"}`}
                  >
                    {n.message}
                  </p>
                  {n.source && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      via {n.source}
                    </p>
                  )}
                </div>
                {!n.read && (
                  <button
                    onClick={() => markRead(n)}
                    className="text-xs font-medium text-brand-600 hover:text-brand-700"
                  >
                    Mark read
                  </button>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
