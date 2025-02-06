export interface JarCategory {
  id: number;
  name: string;
  icon: string;
  warning: string | null;
  show_on_orderform: boolean;
}

export interface Jar {
  id: number;
  jar: string;
  check_ttl: number;
  updater_type: string;
  updater_reference: string;
  version_reference: string;
  name: string;
  tags: string;
  adder_type: string;
  minecraft_version: number;
  java_version: number;
  category_id: number;
  stuck: boolean;
  ignore: boolean;
}

export interface ModpackCategory {
  id: number;
  name: string;
  icon: string;
}

export interface PreinstallModpack {
  id: number;
  template: string;
  external_id: string;
  check_ttl: number;
  updater_type: string;
  updater_script: string;
  latest_name: string;
  latest_zip: string;
  latest_no_serverpack: number;
  conf_name: string;
  conf_zip: string;
  conf_meta: {
    install_forge: string;
  };
  conf_jarfile: string;
  name: string;
  category_id: number;
  is_utility: boolean;
  show_utility_button: boolean;
  stuck: boolean;
  needs_testing: boolean;
  visibility_rules: string;
  icon: string;
}

export interface Preinstalls {
  jarCategories: JarCategory[];
  jars: Jar[];
  modpackCategories: ModpackCategory[];
  modpacks: PreinstallModpack[];
}
