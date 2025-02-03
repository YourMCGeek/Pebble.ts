export interface BackupAttributes {
  id: string | null;
  uuid: string | null;
  is_successful: boolean;
  is_locked: boolean;
  is_exported: boolean;
  type: 'automatic' | string;
  name: string | null;
  ignored_files: string;
  checksum: string;
  restore_fee: number | null;
  bytes: number;
  created_at: string; // ISO 8601 formatted date string
  completed_at: string; // ISO 8601 formatted date string
}

export interface Backup {
  object: 'backup';
  attributes: BackupAttributes;
}

export interface BackupList {
  object: 'list';
  data: Backup[];
}
