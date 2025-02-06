interface MigrationDetails {
  id: number;
  server_id: number;
  migration_id: number;
  successful: boolean;
  old_node: number;
  new_node: number;
  old_allocation: number;
  new_allocation: number;
  old_additional_allocations: number[];
  new_additional_allocations: number[];
  archived: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export { MigrationDetails };
