export interface ResourceDetails {
  memory_bytes: number;
  cpu_absolute: number;
  disk_bytes: number;
  network_rx_bytes: number;
  network_tx_bytes: number;
  uptime: number;
}

export interface StatsDetails {
  state: string;
  status: string;
  resources: ResourceDetails;
}

export interface Stats {
  object: 'stats';
  attributes: StatsDetails;
}

export interface SftpDetails {
  ip: string;
  port: number;
}

export interface Limits {
  memory: number;
  swap: number;
  disk: number;
  io: number;
  cpu: number;
  threads?: string;
  oom_killer?: string;
}

export interface FeatureLimits {
  allocations: number;
  backups: number;
  databases: number;
  subservers: number;
}

export interface Node {
  name: string;
  location: string;
  type: string;
  status_link: string;
}

export interface AllocationAttributes {
  id: number;
  ip: string;
  ip_alias: null;
  port: number;
  notes: null;
  is_default: boolean;
}

export interface Allocation {
  object: 'allocation';
  attributes: AllocationAttributes;
}

export interface EggVariableAttributes {
  name: string;
  description: string;
  env_variable: string;
  default_value: string;
  server_value: string;
  is_editable: boolean;
  rules: string;
}

// TODO: Implement other types of relationships, allocation, variables, egg, subusers
export interface Relationships {
  allocations: {
    object: 'list';
    data: Allocation[];
  };
  variables?: EggVariableAttributes[];
}

export interface ServerAttributes {
  server_owner: boolean;
  identifier: string;
  internal_id: number;
  external_id: string;
  parent: string;
  uuid: string;
  name: string;
  is_node_under_maintenance: boolean;
  in_conflict_state: boolean;
  sftp_details: SftpDetails;
  description: string;
  limits: Limits;
  abilities: string;
  invocation: string;
  docker_image: string;
  egg_features: string[];
  egg_name: string;
  bot_type: string;
  owner_id: string;
  owner_email: string;
  feature_limits: FeatureLimits;
  action: string;
  status: string;
  status_reason: string;
  is_transferring: boolean;
  subdomain: string;
  node: Node;
  migrate_by: string;
  relationships: Relationships;
}

export interface Server {
  object: 'server';
  attributes: ServerAttributes;
}

export interface Pagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  links: {};
}

export interface ServerListResponse {
  object: 'list';
  data: Server[];
  meta: {
    pagination: Pagination;
  };
}

export interface Server {
  attributes: ServerAttributes;
}
