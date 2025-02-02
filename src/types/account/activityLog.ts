interface ActivityLogResponse {
  object: 'list';
  data: ActivityLog[];
  meta: {
    pagination: Pagination;
  };
}

interface ActivityLog {
  object: 'activity_log';
  attributes: {
    id: string;
    batch: boolean;
    type: string;
    event: string;
    is_api: boolean;
    ip: string;
    description: string;
    properties: {};
    has_additional_metadata: boolean;
    timestamp: string;
  };
}

interface Pagination {
  total: number;
  count: number;
  per_page: number;
  current_page: number;
  total_pages: number;
  links: {};
}

export { ActivityLogResponse, ActivityLog };
