import type { ModuleManifest } from "./module";

export interface AtithiraClientOptions {
  apiKey: string;
  /** Platform base URL, e.g. https://app.atithira.com */
  baseUrl?: string;
  publisherName?: string;
}

/**
 * The developer SDK client. A third-party developer authenticates with a
 * tenant API key (atk_live_...) and calls the platform's versioned API on that
 * tenant's behalf — the same API the first-party UI uses. This is what makes
 * the marketplace a real platform rather than a closed product.
 */
export class AtithiraClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly publisherName: string;

  constructor(options: AtithiraClientOptions) {
    if (!options.apiKey?.startsWith("atk_")) {
      throw new Error("A valid Atithira API key (atk_...) is required");
    }
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? "http://localhost:3000").replace(/\/$/, "");
    this.publisherName = options.publisherName ?? "Third-party developer";
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
  ): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        authorization: `Bearer ${this.apiKey}`,
        "content-type": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = (await res.json().catch(() => ({}))) as T & { error?: string };
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? `HTTP ${res.status}`);
    }
    return data;
  }

  /** Generic escape hatch for any versioned endpoint. */
  get<T>(path: string) {
    return this.request<T>("GET", path);
  }
  post<T>(path: string, body?: unknown) {
    return this.request<T>("POST", path, body);
  }

  /** Publish a module built with defineModule() to the marketplace. */
  publishModule(manifest: ModuleManifest) {
    return this.post<{ listing: { _id: string; slug: string } }>(
      "/api/v1/marketplace/listings",
      {
        type: "module",
        slug: manifest.slug,
        name: manifest.name,
        description: manifest.description,
        priceMonthly: manifest.priceMonthly ?? 0,
        publisherName: this.publisherName,
      },
    );
  }

  /** Read the authenticated tenant's CRM leads (example typed helper). */
  listLeads() {
    return this.get<{ leads: unknown[] }>("/api/v1/crm/leads");
  }
}
