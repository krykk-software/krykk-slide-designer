import { ReplitConnectors } from "@replit/connectors-sdk";

// HubSpot integration using Replit connectors SDK (connection: conn_hubspot_01KN7JFJBT250Q5555CYB3GZ4J)
const connectors = new ReplitConnectors();

interface HubSpotObjectResult {
  id: string;
  properties: Record<string, string | null>;
}

interface HubSpotListResponse {
  results: HubSpotObjectResult[];
  total?: number;
  paging?: {
    next?: {
      after: string;
      link: string;
    };
  };
}

async function hubspotGet(path: string, params?: Record<string, string>): Promise<HubSpotListResponse> {
  const url = params
    ? `${path}?${new URLSearchParams(params).toString()}`
    : path;
  const response = await connectors.proxy("hubspot", url, { method: "GET" });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`HubSpot API error ${response.status}: ${body.slice(0, 200)}`);
  }
  return response.json() as Promise<HubSpotListResponse>;
}

async function fetchAllDeals(): Promise<HubSpotObjectResult[]> {
  const results: HubSpotObjectResult[] = [];
  let after: string | undefined;

  do {
    const params: Record<string, string> = {
      limit: "100",
      properties: "dealname,amount,dealstage,closedate",
    };
    if (after) params.after = after;

    const data = await hubspotGet("/crm/v3/objects/deals", params);
    results.push(...(data.results ?? []));
    after = data.paging?.next?.after;
  } while (after);

  return results;
}

async function fetchObjectCount(objectType: string): Promise<number> {
  // HubSpot CRM v3 search endpoint returns accurate 'total' count
  // filterGroups: [] means no filters — return all objects
  const response = await connectors.proxy("hubspot", `/crm/v3/objects/${objectType}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ limit: 1, filterGroups: [] }),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`HubSpot API error ${response.status}: ${body.slice(0, 200)}`);
  }
  const data = await response.json() as { total?: number };
  if (typeof data.total === "number") return data.total;
  // Fallback: list endpoint total field
  const list = await hubspotGet(`/crm/v3/objects/${objectType}`, { limit: "1" });
  return typeof list.total === "number" ? list.total : list.results.length;
}

function formatStageName(stage: string): string {
  return stage
    .replace(/([A-Z])/g, " $1")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export interface DealSummary {
  totalCount: number;
  wonCount: number;
  lostCount: number;
  openCount: number;
  totalValue: number;
  wonValue: number;
}

export interface PipelineStageBreakdown {
  label: string;
  value: number;
  count: number;
}

export interface PipelineData {
  months: { month: string; opportunities: { id: string; name: string; amount: number; color?: string }[] }[];
  prefix?: string;
}

export async function getDealSummary(): Promise<DealSummary> {
  const deals = await fetchAllDeals();

  const won = deals.filter(
    (d) => (d.properties.dealstage ?? "").toLowerCase().includes("closedwon")
  );
  const lost = deals.filter(
    (d) => (d.properties.dealstage ?? "").toLowerCase().includes("closedlost")
  );
  const open = deals.filter(
    (d) =>
      !(d.properties.dealstage ?? "").toLowerCase().includes("closedwon") &&
      !(d.properties.dealstage ?? "").toLowerCase().includes("closedlost")
  );

  const totalValue = deals.reduce(
    (sum, d) => sum + parseFloat(d.properties.amount ?? "0"),
    0
  );
  const wonValue = won.reduce(
    (sum, d) => sum + parseFloat(d.properties.amount ?? "0"),
    0
  );

  return {
    totalCount: deals.length,
    wonCount: won.length,
    lostCount: lost.length,
    openCount: open.length,
    totalValue,
    wonValue,
  };
}

export async function getPipelineStageBreakdown(): Promise<PipelineStageBreakdown[]> {
  const deals = await fetchAllDeals();
  const stageMap: Record<string, { count: number; value: number }> = {};

  for (const deal of deals) {
    const stage = deal.properties.dealstage ?? "unknown";
    const amount = parseFloat(deal.properties.amount ?? "0");
    if (!stageMap[stage]) stageMap[stage] = { count: 0, value: 0 };
    stageMap[stage].count += 1;
    stageMap[stage].value += amount;
  }

  return Object.entries(stageMap).map(([label, { count, value }]) => ({
    label: formatStageName(label),
    value,
    count,
  }));
}

export async function getContactCount(): Promise<number> {
  return fetchObjectCount("contacts");
}

export async function getCompanyCount(): Promise<number> {
  return fetchObjectCount("companies");
}

export async function getDealsByMonth(): Promise<PipelineData> {
  const deals = await fetchAllDeals();

  const colors = [
    "hsl(217, 91%, 60%)",
    "hsl(160, 84%, 39%)",
    "hsl(43, 96%, 56%)",
    "hsl(280, 67%, 63%)",
    "hsl(175, 84%, 32%)",
    "hsl(330, 81%, 60%)",
    "hsl(25, 95%, 53%)",
    "hsl(0, 84%, 60%)",
  ];

  const monthMap: Record<string, { name: string; amount: number }[]> = {};

  for (const deal of deals) {
    const closedate = deal.properties.closedate;
    if (!closedate) continue;
    const amount = parseFloat(deal.properties.amount ?? "0");
    const name = deal.properties.dealname ?? "Deal";
    const date = new Date(closedate);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    if (!monthMap[monthKey]) monthMap[monthKey] = [];
    monthMap[monthKey].push({ name, amount });
  }

  const sortedKeys = Object.keys(monthMap).sort();
  const months = sortedKeys.map((key, ki) => ({
    month: new Date(key + "-01").toLocaleDateString("en-US", { month: "short", year: "numeric" }),
    opportunities: monthMap[key].map((opp, i) => ({
      id: `${key}-${i}`,
      name: opp.name,
      amount: opp.amount,
      color: colors[(ki * 3 + i) % colors.length],
    })),
  }));

  if (months.length === 0) {
    return {
      months: [
        {
          month: "No Data",
          opportunities: [{ id: "placeholder", name: "No deals with close dates", amount: 0, color: colors[0] }],
        },
      ],
      prefix: "$",
    };
  }

  return { months, prefix: "$" };
}

export async function checkHubSpotConnection(): Promise<boolean> {
  try {
    await hubspotGet("/crm/v3/objects/contacts", { limit: "1" });
    return true;
  } catch {
    return false;
  }
}
