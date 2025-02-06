export interface Operation {
  id: string;
  operation: string;
  file: string;
}

export interface Operations {
  operations: Operation[];
}
