export interface FirewallAttributes {
  id: number | null;
  ip: string;
  port: number;
  priority: number;
  allow: boolean;
}

export interface ServerFirewall {
  object: 'server_firewall';
  attributes: FirewallAttributes;
}

export interface FirewallList {
  object: 'list';
  data: ServerFirewall[];
}