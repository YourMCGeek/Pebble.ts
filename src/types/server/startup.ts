export interface EggVariableAttributes {
  name: string;
  description: string;
  env_variable: string;
  dropdown_options: string[];
  default_value: string;
  server_value: string | null;
  is_editable: boolean;
  required_features: string[];
  rules: string;
}

export interface EggVariable {
  object: "egg_variable";
  attributes: EggVariableAttributes;
}

export interface EggVariableList {
  object: "list";
  data: EggVariable[];
}