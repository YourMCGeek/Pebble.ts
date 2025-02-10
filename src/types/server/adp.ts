export interface AdpDetails {
  id: number;
  server_id: number;
  allocation_id: number;
  network_id: number;
  backend_set_id: number;
  domain_id: number;
  domain: string;
  cname: string;
  is_pebble_subdomain: boolean;
  verified: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface AdpSettings {
  connections_per_second_threshold: number;
  client_ban_seconds: number;
  client_allow_seconds: number;
  vpn_block: boolean;
}

export interface AdpResponse {
  protected: boolean;
  model?: AdpDetails;
}

export interface AdpBandwidth {
  free: number;
  total: number;
  premium: number;
}

export interface AdpUniquePlayers {
  value: number;
}

export interface AdpAttacksMitigated {
  value: number;
}

export interface AdpAnalytics {
  bandwidth: AdpBandwidth;
  unique_players: AdpUniquePlayers;
  attacks_mitigated: AdpAttacksMitigated;
}

export interface ChartPoint {
  x: string;
  y: number;
}

export interface AdpGraphData {
  connections_per_second: ChartPoint[];
  players: ChartPoint[];
  versions: { [version: string]: number };
}

export interface AdpIpFirewallRule {
  id: number;
  cidr: string;
  whitelist: boolean;
}

export interface AdpASNFirewallRule {
  id: number;
  asn: number;
  whitelist: boolean;
}

export interface AdpCountryFirewallRule {
  id: number;
  country_code: string;
  country_name: string;
  whitelist: boolean;
}
