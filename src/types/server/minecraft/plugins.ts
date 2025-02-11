export interface MinecraftPluginAttributes {
  id: string | null;
  name: string | null;
  short_description: string | null;
  url: string | null;
  icon_url: string | null;
  loaders: string[] | null;
  external_url: string | null;
}

export interface MinecraftPlugin {
  object: 'minecraft_plugin';
  attributes: MinecraftPluginAttributes;
}

export interface MinecraftPluginList {
  object: 'list';
  data: MinecraftPlugin[];
}

export interface MinecraftPluginVersionAttributes {
  id: string | null;
  name: string | null;
  download_url: string | null;
  loaders: string[] | null;
  game_versions: string[] | null;
}

export interface MinecraftPluginVersion {
  object: 'minecraft_plugin_version';
  attributes: MinecraftPluginVersionAttributes;
}

export interface MinecraftPluginVersionList {
  object: 'list';
  data: MinecraftPluginVersion[];
}
