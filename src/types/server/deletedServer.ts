import { Pagination } from '../misc/searchMeta';

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

export { DeletedServerResponse, DeletedServer };
