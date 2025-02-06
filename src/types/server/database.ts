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
  relationships?: {
    password: DatabasePassword;
  };
}

export interface ServerDatabase {
  object: 'server_database';
  attributes: ServerDatabaseAttributes;
}

export interface DatabaseList {
  object: 'list';
  data: ServerDatabase[];
}

export interface DatabasePassword {
  object: 'database_password';
  attributes: {
    password: string;
  };
}

export interface DatabaseRelationships {
  object: 'database_relationships';
  attributes: {
    relationships: string[];
  };
}
