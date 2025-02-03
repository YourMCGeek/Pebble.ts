export interface DatabaseHost {
  address: string;
  port: number;
}

export interface ServerDatabaseAttributes {
  id: string;
  host: DatabaseHost;
  name: string;
  username: string;
  connections_from: string;
  max_connections: number;
}

export interface ServerDatabase {
  object: 'server_database';
  attributes: ServerDatabaseAttributes;
}

export interface DatabaseList {
  object: 'list';
  data: ServerDatabase[];
}
