export interface RawAllocationList {
  object: 'list';
  data: Array<RawAllocation>;
}

export interface RawAllocation {
  object: 'allocation';
  attributes: NetworkingAttributes;
}

export interface NetworkingAttributes {
  readonly id: number;
  readonly ip: string;
  readonly ip_alias?: string;
  readonly port: number;
  notes?: null | string;
  is_default: boolean;
}
