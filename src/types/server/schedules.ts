export interface Cron {
  day_of_week: string;
  day_of_month: string;
  month: string;
  hour: string;
  minute: string;
}

export interface ScheduleTasksRelationship {
  object: 'list';
  data: any[]; // Replace 'any' with a more specific type if available.
}

export interface ServerScheduleAttributes {
  id: number | null;
  hashid: string;
  name: string;
  cron: Cron;
  is_active: boolean;
  only_when_online: boolean;
  created_at: string | null;
  updated_at: string | null;
  relationships: {
    tasks: ScheduleTasksRelationship;
  };
}

export interface ServerSchedule {
  object: 'server_schedule';
  attributes: ServerScheduleAttributes;
}

export interface ServerScheduleList {
  object: 'list';
  data: ServerSchedule[];
}

export interface ScheduleTaskAttributes {
  id: number | null;
  sequence_id: number;
  action: string;
  payload: string;
  time_offset: number;
  is_queued: boolean;
  continue_on_failure: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface ScheduleTask {
  object: 'schedule_task';
  attributes: ScheduleTaskAttributes;
}
