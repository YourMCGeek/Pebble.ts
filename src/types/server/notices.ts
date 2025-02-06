export interface Note {
  status: string;
  color: number;
  title: string;
  html: string;
  frontend_id: string;
}

export interface ResourceAnalytics {
  type: string;
  percentage: number;
  memory_at_time: number;
}

export interface Modpack {
  id: number;
}

export interface ModpackUpdate {
  installed: string;
  modpack: Modpack;
}

export interface Notices {
  notes: Note[];
  resourceAnalytics: ResourceAnalytics;
  modpackUpdate: ModpackUpdate;
}
