export interface FileObjectAttributes {
  name: string | null;
  modified: string;
  mode: string | null;
  size: number | null;
  mime: string;
}

export interface FileObject {
  object: 'file_object';
  attributes: FileObjectAttributes;
}

export interface FileObjectList {
  object: 'list';
  data: FileObject[];
}

export interface FileSearchObject {
  object: 'file_search_object';
  attributes: FileSearchObjectAttributes;
}

export interface FileSearchObjectAttributes {
  name: string | null;
  path: string | null;
  mode: string | null;
  mime: string;
  rank: number | null;
}

export interface FileSearchList {
  object: 'list';
  data: FileSearchObject[];
}

export interface FilePullList {
  object: 'list';
  attributes: FilePullAttributes[];
}

export interface FilePullAttributes {
  id: string;
  path: string;
  download: number;
  size: number;
}
