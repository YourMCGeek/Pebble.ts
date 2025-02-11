import { Meta } from '../../misc/searchMeta';

export interface MinecraftModpack {
  provider: string;
  id: string;
  name: string;
  description: string;
  url: string;
  icon_url: string;
  slug?: string;
  status?: string;
}

export interface ModpackList {
  object: 'list';
  data: MinecraftModpack[];
  meta: Meta;
}

export interface ModpackVersions {
  id: string;
  name: string;
  number: string;
  url: string;
}
