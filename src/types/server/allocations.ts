export interface AllocationAttributes {
  id: number | null;
  ip: string;
  ip_alias: string | null;
  port: number;
  notes: string | null;
  is_default: boolean;
}

export interface Allocation {
  object: 'allocation';
  attributes: AllocationAttributes;
}

export interface AllocationList {
  object: 'list';
  data: Allocation[];
}
