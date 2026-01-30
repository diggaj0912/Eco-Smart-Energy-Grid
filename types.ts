export interface LiveAlert {
  timestamp: string;
  district: string;
  location?: {
    lat: number;
    lng: number;
  };
  type: string;
  severity: 'Low' | 'Medium' | 'High';
  message: string;
}

export interface AiRecommendation {
  summary: string;
  reasoning: string;
  impact: string;
}

export interface SystemDiagnostics {
  authState: string;
  operationalState: string;
  totalAlertsProcessed: number;
  cachedEntries: number;
  lastDistrictAnalyzed: string;
}

export interface SystemHealth {
  Authentication: string;
  Authorization: string;
  GoogleServices: string;
  Caching: string;
  Performance: string;
  Accessibility: string;
}

export interface GoogleServicesStatus {
  GoogleAIStudio: string;
  GoogleMaps: string;
  EarthEngine: string;
  BigQuery: string;
  CloudMonitoring: string;
}

export interface GridState {
  mode: 'IDLE' | 'OPERATIONAL' | 'DIAGNOSTIC' | 'LOGIN';
  statusSummary: string;
  currentAlert: LiveAlert | null;
  recommendation: AiRecommendation | null;
  availableActions: string[];
  lastUpdate: Date;
  diagnostics?: SystemDiagnostics;
  systemHealth?: SystemHealth;
  googleServicesStatus?: GoogleServicesStatus;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export enum ConnectionStatus {
  DISCONNECTED,
  CONNECTING,
  CONNECTED,
  ERROR
}