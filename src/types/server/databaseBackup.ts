export interface DatabaseBackupAttributes {
  id: string | null;
  uuid: string | null;
  is_successful: boolean;
  is_locked: boolean;
  is_exported: boolean;
  type: string;
  name: string | null;
  database_name: string | null;
  ignored_files: string;
  checksum: string;
  restore_fee: number | null;
  bytes: number;
  created_at: string;
  completed_at: string;
}

export interface DatabaseBackup {
  object: 'database_backup';
  attributes: DatabaseBackupAttributes;
}

export interface DatabaseBackupList {
  object: 'list';
  data: DatabaseBackup[];
}
