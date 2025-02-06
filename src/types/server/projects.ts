export interface ProjectVersion {
  object: string;
  data: any[];
}

export interface ProjectRelationships {
  versions: ProjectVersion;
}

export interface ProjectAttributes {
  id: any;
  name: any;
  description: any;
  icon_url: any;
  relationships: ProjectRelationships;
}

export interface Project {
  object: string;
  attributes: ProjectAttributes;
}

export interface ProjectList {
  object: string;
  data: Project[];
}

export interface ProjectEggVariableAttributes {
  name: string;
  description: string;
  env_variable: string;
  dropdown_options: any[];
  default_value: string;
  server_value: any;
  is_editable: boolean;
  required_features: any[];
  rules: string;
}

export interface ProjectEggVariable {
  object: string;
  attributes: ProjectEggVariableAttributes;
}
