export type NodeType = "user" | "group" | "role" | "device" | "application";

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  provider: "azure" | "okta" | "system";
  email?: string;
  status: "active" | "compromised" | "secured" | "suspended" | "password_reset_required";
  riskScore: number; // 0 to 100
  title?: string;
  department?: string;
  ipAddress?: string;
  location?: string;
  mfaMethod?: string;
  lastLogin?: string;
}

export interface GraphLink {
  source: string;
  target: string;
  relationship: string; // e.g., "MEMBER_OF", "HAS_ROLE", "ACCESS_TO", "LOGGED_IN_FROM"
}

export interface IngestionLog {
  id: string;
  timestamp: string;
  provider: "azure" | "okta";
  eventType: string; // e.g., "Sign-in Success", "MFA Prompted", "MFA Denied", "Password Changed"
  userPrincipalName: string;
  ipAddress: string;
  location: string;
  status: "success" | "failure" | "triggered";
  details: string;
}

export type ThreatSeverity = "critical" | "high" | "medium" | "low";

export interface IdentityIncident {
  id: string;
  userId: string; // Refers to GraphNode.id
  title: string;
  attackType: "token_theft" | "mfa_fatigue" | "impossible_travel" | "privilege_escalation" | "brute_force";
  severity: ThreatSeverity;
  status: "active" | "mitigated" | "investigating";
  detectedAt: string;
  description: string;
  evidence: string;
}

export interface RemediationAction {
  id: string;
  userId: string;
  actionType: "force_reset" | "revoke_sessions" | "suspend_user";
  timestamp: string;
  status: "completed" | "failed";
  details: string;
}

export interface CopilotResponse {
  summary: string;
  attackVectorExplanation: string;
  blastRadiusMetrics: {
    directAccessCount: number;
    indirectAccessCount: number;
    criticalAssetsRisk: string[];
    riskTier: "Critical" | "High" | "Medium" | "Low";
  };
  remediationPlaybook: string[];
}
