interface DeletedServerResponse {
  object: 'list';
  data: DeletedServer[];
  meta: {
    pagination: Pagination;
  };
}

interface DeletedServer {
  object: 'deleted_server';
  attributes: {
    id: number;
    name: string;
    memory: number;
    node_type: string;
    ip: string;
    port: number;
    terminated_at: string;
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

export { DeletedServerResponse, DeletedServer };
