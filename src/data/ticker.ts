// Tech Insights ticker content. Kept as its own data module — separate from the
// component and from the homepage — so it can be swapped for a live query
// against the content-intelligence pipeline (discovered_stories / posts) later
// without touching TechInsightsTicker itself.

export interface TickerItem {
  id: string;
  category: string;
  headline: string;
  shortText?: string;
  url: string;
  source: string;
  publishedAt: string;
  isExternal: boolean;
  isNew?: boolean;
}

export const tickerItems: TickerItem[] = [
  {
    id: "k8s-pod-certificates",
    category: "Kubernetes v1.37",
    headline: "Pod Certificates & Cluster Trust Bundles Now GA",
    shortText: "What native workload identity means for platform teams",
    url: "/insights/kubernetes-v137-brings-native-x509-certificates-to-pods-what-pod-certificates-an",
    source: "Kalvoteq Insights",
    publishedAt: "2026-09-01",
    isExternal: false,
    isNew: true,
  },
  {
    id: "llm-eval-harness",
    category: "AI Engineering",
    headline: "Evaluating LLM Features Before You Ship Them",
    shortText: "A practical evaluation harness that catches regressions your demo never will",
    url: "/insights/evaluating-llm-features",
    source: "Kalvoteq Insights",
    publishedAt: "2026-05-30",
    isExternal: false,
  },
  {
    id: "cncf-ai-factory",
    category: "AI Infrastructure",
    headline: "Building an AI Factory on Kubernetes",
    shortText: "Infrastructure trends engineering leaders should watch",
    url: "https://www.cncf.io/blog/2026/08/27/building-an-ai-factory-on-kubernetes/",
    source: "CNCF",
    publishedAt: "2026-08-27",
    isExternal: true,
  },
  {
    id: "k8s-storage-migration",
    category: "Kubernetes v1.37",
    headline: "Storage Version Migration Enabled by Default",
    shortText: "Another core GA milestone in the latest release",
    url: "https://kubernetes.io/blog/2026/08/31/kubernetes-v1-37-storage-version-migration-ga/",
    source: "Kubernetes Blog",
    publishedAt: "2026-08-31",
    isExternal: true,
  },
  {
    id: "k8s-cve-reconciliation",
    category: "Cybersecurity",
    headline: "Correcting Records for Unfixed Kubernetes CVEs",
    shortText: "How the project is closing gaps in its own vulnerability history",
    url: "https://kubernetes.io/blog/2026/05/26/reconciling-unfixed-kubernetes-cves/",
    source: "Kubernetes Blog",
    publishedAt: "2026-05-26",
    isExternal: true,
  },
  {
    id: "cncf-observability",
    category: "Observability",
    headline: "Observability in Kubernetes: From Metrics to Meaning",
    shortText: "Moving past dashboards toward actionable signal",
    url: "https://www.cncf.io/blog/2026/08/31/observability-in-kubernetes-from-metrics-to-meaning/",
    source: "CNCF",
    publishedAt: "2026-08-31",
    isExternal: true,
  },
];
