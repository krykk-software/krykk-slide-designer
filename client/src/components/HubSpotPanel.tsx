import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BLOCK_COLORS, BlockTemplate, type ChartDataPoint, type StatData, type PipelineData } from "@/lib/types";
import { BarChart3, Users, Building2, Trophy, TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { SiHubspot } from "react-icons/si";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface HubSpotPanelProps {
  onAddBlock: (template: BlockTemplate) => void;
}

interface DealSummary {
  totalCount: number;
  wonCount: number;
  lostCount: number;
  openCount: number;
  totalValue: number;
  wonValue: number;
}

interface PipelineStage {
  label: string;
  value: number;
  count: number;
}

const CHART_COLORS = [
  BLOCK_COLORS.blue,
  BLOCK_COLORS.green,
  BLOCK_COLORS.yellow,
  BLOCK_COLORS.purple,
  BLOCK_COLORS.teal,
  BLOCK_COLORS.pink,
  BLOCK_COLORS.orange,
  BLOCK_COLORS.red,
];

async function fetchFresh<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include", cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
  return res.json();
}

export function HubSpotPanel({ onAddBlock }: HubSpotPanelProps) {
  const { toast } = useToast();
  const [importing, setImporting] = useState<string | null>(null);

  const { data: status, isLoading: statusLoading, refetch: refetchStatus } = useQuery<{ connected: boolean }>({
    queryKey: ["/api/hubspot/status"],
    staleTime: 0,
  });

  const connected = status?.connected ?? false;

  const handleRefresh = () => {
    refetchStatus();
  };

  const withFreshImport = async (
    key: string,
    fn: () => Promise<BlockTemplate>
  ) => {
    setImporting(key);
    try {
      const template = await fn();
      onAddBlock(template);
      toast({ title: "Block added from HubSpot", description: `"${template.title}" inserted onto your slide.` });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not fetch HubSpot data";
      toast({ title: "Import failed", description: message, variant: "destructive" });
    } finally {
      setImporting(null);
    }
  };

  const importDealsWon = () =>
    withFreshImport("deals-won", async () => {
      const summary = await fetchFresh<DealSummary>("/api/hubspot/deals/summary");
      return {
        type: "stat",
        title: "Deals Won",
        icon: "Trophy",
        category: "HubSpot",
        defaultData: { current: summary.wonCount, previous: 0 } as StatData,
        defaultSize: { width: 200, height: 120 },
        color: BLOCK_COLORS.green,
      };
    });

  const importDealsLost = () =>
    withFreshImport("deals-lost", async () => {
      const summary = await fetchFresh<DealSummary>("/api/hubspot/deals/summary");
      return {
        type: "stat",
        title: "Deals Lost",
        icon: "XCircle",
        category: "HubSpot",
        defaultData: { current: summary.lostCount, previous: 0 } as StatData,
        defaultSize: { width: 200, height: 120 },
        color: BLOCK_COLORS.red,
      };
    });

  const importRevenueWon = () =>
    withFreshImport("revenue-won", async () => {
      const summary = await fetchFresh<DealSummary>("/api/hubspot/deals/summary");
      return {
        type: "stat",
        title: "Revenue Won",
        icon: "DollarSign",
        category: "HubSpot",
        defaultData: { current: Math.round(summary.wonValue), previous: 0, prefix: "$" } as StatData,
        defaultSize: { width: 200, height: 120 },
        color: BLOCK_COLORS.green,
      };
    });

  const importPipelineValue = () =>
    withFreshImport("pipeline-value", async () => {
      const summary = await fetchFresh<DealSummary>("/api/hubspot/deals/summary");
      return {
        type: "stat",
        title: "Pipeline Value",
        icon: "TrendingUp",
        category: "HubSpot",
        defaultData: { current: Math.round(summary.totalValue), previous: 0, prefix: "$" } as StatData,
        defaultSize: { width: 200, height: 120 },
        color: BLOCK_COLORS.blue,
      };
    });

  const importWinLossChart = () =>
    withFreshImport("win-loss", async () => {
      const summary = await fetchFresh<DealSummary>("/api/hubspot/deals/summary");
      const data: ChartDataPoint[] = [
        { label: "Won", value: summary.wonCount, color: BLOCK_COLORS.green },
        { label: "Lost", value: summary.lostCount, color: BLOCK_COLORS.red },
        { label: "Open", value: summary.openCount, color: BLOCK_COLORS.blue },
      ];
      return {
        type: "bar-chart",
        title: "Win / Loss / Open",
        icon: "BarChart3",
        category: "HubSpot",
        defaultData: data,
        defaultSize: { width: 320, height: 280 },
        color: BLOCK_COLORS.green,
      };
    });

  const importPipelineByStage = () =>
    withFreshImport("pipeline-by-stage", async () => {
      const stages = await fetchFresh<PipelineStage[]>("/api/hubspot/deals/pipeline");
      const data: ChartDataPoint[] = stages.map((s, i) => ({
        label: s.label,
        value: s.count,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
      return {
        type: "bar-chart",
        title: "Pipeline by Stage",
        icon: "BarChart3",
        category: "HubSpot",
        defaultData: data.length > 0 ? data : [{ label: "No data", value: 0, color: BLOCK_COLORS.blue }],
        defaultSize: { width: 320, height: 280 },
        color: BLOCK_COLORS.blue,
      };
    });

  const importValueByStage = () =>
    withFreshImport("value-by-stage", async () => {
      const stages = await fetchFresh<PipelineStage[]>("/api/hubspot/deals/pipeline");
      const data: ChartDataPoint[] = stages.map((s, i) => ({
        label: s.label,
        value: Math.round(s.value),
        color: CHART_COLORS[i % CHART_COLORS.length],
      }));
      return {
        type: "bar-chart",
        title: "Pipeline Value by Stage",
        icon: "BarChart3",
        category: "HubSpot",
        defaultData: data.length > 0 ? data : [{ label: "No data", value: 0, color: BLOCK_COLORS.blue }],
        defaultSize: { width: 320, height: 280 },
        color: BLOCK_COLORS.purple,
      };
    });

  const importPipelineByMonth = () =>
    withFreshImport("pipeline-by-month", async () => {
      const pipelineData = await fetchFresh<PipelineData>("/api/hubspot/deals/monthly");
      return {
        type: "pipeline",
        title: "Pipeline by Month",
        icon: "TrendingUp",
        category: "HubSpot",
        defaultData: pipelineData,
        defaultSize: { width: 480, height: 280 },
        color: BLOCK_COLORS.blue,
      };
    });

  const importContacts = () =>
    withFreshImport("contacts", async () => {
      const { count } = await fetchFresh<{ count: number }>("/api/hubspot/contacts/count");
      return {
        type: "stat",
        title: "Total Contacts",
        icon: "Users",
        category: "HubSpot",
        defaultData: { current: count, previous: 0 } as StatData,
        defaultSize: { width: 200, height: 120 },
        color: BLOCK_COLORS.teal,
      };
    });

  const importCompanies = () =>
    withFreshImport("companies", async () => {
      const { count } = await fetchFresh<{ count: number }>("/api/hubspot/companies/count");
      return {
        type: "stat",
        title: "Total Companies",
        icon: "Building2",
        category: "HubSpot",
        defaultData: { current: count, previous: 0 } as StatData,
        defaultSize: { width: 200, height: 120 },
        color: BLOCK_COLORS.purple,
      };
    });

  if (statusLoading) {
    return (
      <div className="p-4 space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="p-4 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
          <SiHubspot className="w-6 h-6 text-orange-500" />
        </div>
        <div>
          <p className="font-medium text-sm text-foreground">HubSpot Not Connected</p>
          <p className="text-xs text-muted-foreground mt-1">
            Connect your HubSpot account to import live CRM data directly into your slides.
          </p>
        </div>
        <Button
          variant="default"
          size="sm"
          className="w-full"
          onClick={() => {
            window.open("/api/hubspot/connect", "_blank");
          }}
          data-testid="button-hubspot-connect"
        >
          <SiHubspot className="w-4 h-4 mr-2" />
          Connect HubSpot Account
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={handleRefresh}
          data-testid="button-hubspot-check-connection"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Check connection status
        </Button>
        <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-md text-left">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>After connecting, click "Check connection status" to refresh and start importing CRM data.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SiHubspot className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-medium text-green-600 dark:text-green-400" data-testid="hubspot-status-connected">Connected</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleRefresh}
          data-testid="button-hubspot-refresh"
        >
          <RefreshCw className="w-3 h-3 mr-1" />
          Refresh
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Click a card to fetch live data from HubSpot and insert a block onto your slide.
      </p>

      {/* Deals section */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Deals</p>
        <div className="grid grid-cols-2 gap-2">
          <ImportCard
            icon={<Trophy className="w-3 h-3" style={{ color: BLOCK_COLORS.green }} />}
            iconBg="bg-green-100 dark:bg-green-900/30"
            label="Deals Won"
            description="stat"
            loading={importing === "deals-won"}
            onClick={importDealsWon}
            testId="hubspot-import-deals-won"
          />
          <ImportCard
            icon={<TrendingUp className="w-3 h-3" style={{ color: BLOCK_COLORS.red }} />}
            iconBg="bg-red-100 dark:bg-red-900/30"
            label="Deals Lost"
            description="stat"
            loading={importing === "deals-lost"}
            onClick={importDealsLost}
            testId="hubspot-import-deals-lost"
          />
          <ImportCard
            icon={<TrendingUp className="w-3 h-3" style={{ color: BLOCK_COLORS.green }} />}
            iconBg="bg-green-100 dark:bg-green-900/30"
            label="Revenue Won"
            description="stat"
            loading={importing === "revenue-won"}
            onClick={importRevenueWon}
            testId="hubspot-import-revenue-won"
          />
          <ImportCard
            icon={<TrendingUp className="w-3 h-3" style={{ color: BLOCK_COLORS.blue }} />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            label="Pipeline Value"
            description="stat"
            loading={importing === "pipeline-value"}
            onClick={importPipelineValue}
            testId="hubspot-import-pipeline-value"
          />
        </div>

        <div className="grid grid-cols-1 gap-2 mt-2">
          <WideImportCard
            icon={<BarChart3 className="w-3 h-3" style={{ color: BLOCK_COLORS.green }} />}
            iconBg="bg-green-100 dark:bg-green-900/30"
            label="Win / Loss / Open"
            description="Bar chart comparing won, lost, and open deals"
            loading={importing === "win-loss"}
            onClick={importWinLossChart}
            testId="hubspot-import-win-loss"
          />
        </div>
      </div>

      {/* Pipeline section */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Pipeline</p>
        <div className="grid grid-cols-1 gap-2">
          <WideImportCard
            icon={<BarChart3 className="w-3 h-3" style={{ color: BLOCK_COLORS.blue }} />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            label="Pipeline by Stage"
            description="Bar chart of deal count per pipeline stage"
            loading={importing === "pipeline-by-stage"}
            onClick={importPipelineByStage}
            testId="hubspot-import-pipeline-by-stage"
          />
          <WideImportCard
            icon={<BarChart3 className="w-3 h-3" style={{ color: BLOCK_COLORS.purple }} />}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            label="Value by Stage"
            description="Bar chart of deal value per stage"
            loading={importing === "value-by-stage"}
            onClick={importValueByStage}
            testId="hubspot-import-value-by-stage"
          />
          <WideImportCard
            icon={<TrendingUp className="w-3 h-3" style={{ color: BLOCK_COLORS.blue }} />}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            label="Pipeline by Month"
            description="Stacked pipeline chart grouped by close month"
            loading={importing === "pipeline-by-month"}
            onClick={importPipelineByMonth}
            testId="hubspot-import-pipeline-by-month"
          />
        </div>
      </div>

      {/* Contacts & Companies */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">CRM</p>
        <div className="grid grid-cols-2 gap-2">
          <ImportCard
            icon={<Users className="w-3 h-3" style={{ color: BLOCK_COLORS.teal }} />}
            iconBg="bg-teal-100 dark:bg-teal-900/30"
            label="Contacts"
            description="stat"
            loading={importing === "contacts"}
            onClick={importContacts}
            testId="hubspot-import-contacts"
          />
          <ImportCard
            icon={<Building2 className="w-3 h-3" style={{ color: BLOCK_COLORS.purple }} />}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            label="Companies"
            description="stat"
            loading={importing === "companies"}
            onClick={importCompanies}
            testId="hubspot-import-companies"
          />
        </div>
      </div>
    </div>
  );
}

interface ImportCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description: string;
  loading: boolean;
  onClick: () => void;
  testId: string;
}

function ImportCard({ icon, iconBg, label, description, loading, onClick, testId }: ImportCardProps) {
  return (
    <Card
      className="p-2 cursor-pointer hover-elevate active-elevate-2 transition-all"
      onClick={loading ? undefined : onClick}
      data-testid={testId}
    >
      <div className="flex items-center gap-2">
        <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${iconBg}`}>
          {loading ? <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" /> : icon}
        </div>
        <span className="text-xs font-medium text-foreground truncate">{label}</span>
      </div>
    </Card>
  );
}

interface WideImportCardProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description: string;
  loading: boolean;
  onClick: () => void;
  testId: string;
}

function WideImportCard({ icon, iconBg, label, description, loading, onClick, testId }: WideImportCardProps) {
  return (
    <Card
      className="p-2 cursor-pointer hover-elevate active-elevate-2 transition-all"
      onClick={loading ? undefined : onClick}
      data-testid={testId}
    >
      <div className="flex items-center gap-2">
        <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${iconBg}`}>
          {loading ? <RefreshCw className="w-3 h-3 animate-spin text-muted-foreground" /> : icon}
        </div>
        <div className="min-w-0">
          <span className="text-xs font-medium text-foreground block truncate">{label}</span>
          <span className="text-xs text-muted-foreground block truncate">{description}</span>
        </div>
      </div>
    </Card>
  );
}
