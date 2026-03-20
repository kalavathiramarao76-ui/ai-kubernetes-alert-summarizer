export type Severity = "P0" | "P1" | "P2" | "P3" | "P4";

export interface AlertAnalysis {
  summary: string;
  severity: Severity;
  rootCause: string;
  impact: string;
  immediateActions: string[];
  slackSummary: string;
  rawResponse: string;
}

export interface RunbookResult {
  alertName: string;
  content: string;
}

export interface CorrelationResult {
  correlationScore: string;
  groups: AlertGroup[];
  timeline: TimelineEvent[];
  rootCause: string;
  blastRadius: string;
  unifiedResponse: string;
  slackSummary: string;
  rawResponse: string;
}

export interface AlertGroup {
  name: string;
  alerts: string[];
  relationship: string;
}

export interface TimelineEvent {
  time: string;
  event: string;
  severity: Severity;
}

export interface StreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason: string | null;
  }[];
}

export const SAMPLE_ALERTS = {
  prometheus: `{
  "status": "firing",
  "labels": {
    "alertname": "KubePodCrashLooping",
    "container": "api-server",
    "namespace": "production",
    "pod": "api-server-7d4f8b6c9-x2k9p",
    "severity": "critical"
  },
  "annotations": {
    "description": "Pod production/api-server-7d4f8b6c9-x2k9p (api-server) is in waiting state (reason: CrashLoopBackOff).",
    "runbook_url": "https://runbooks.prometheus-operator.dev/runbooks/kubernetes/kubepodcrashlooping",
    "summary": "Pod is crash looping."
  },
  "startsAt": "2024-01-15T14:23:00Z",
  "generatorURL": "http://prometheus:9090/graph?g0.expr=..."
}`,
  pagerduty: `{
  "incident": {
    "id": "Q1XYZZB7K2IZLT",
    "type": "incident",
    "title": "[CRITICAL] High Memory Usage on k8s-worker-node-03",
    "status": "triggered",
    "urgency": "high",
    "service": {
      "name": "Kubernetes Production Cluster",
      "id": "PQRSTUV"
    },
    "body": {
      "details": "Memory usage on k8s-worker-node-03 has exceeded 95% for the last 10 minutes. Multiple pods are being OOM killed. Affected namespaces: production, staging. Node allocatable memory: 32Gi, current usage: 30.8Gi."
    },
    "created_at": "2024-01-15T14:20:00Z"
  }
}`,
  multiAlert: `Alert 1: [14:20] Node k8s-worker-03 memory at 95%
Alert 2: [14:22] Pod api-server-7d4f8b OOM killed in production namespace
Alert 3: [14:23] Pod api-server-7d4f8b CrashLoopBackOff in production namespace
Alert 4: [14:25] Service api-server endpoint count dropped to 1/3
Alert 5: [14:26] HTTP 5xx error rate exceeded 10% on api-gateway
Alert 6: [14:28] Downstream service payment-processor showing increased latency (p99: 12s)`,
};
