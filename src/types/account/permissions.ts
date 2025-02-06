export interface PermissionKeys {
  [key: string]: string;
}

export interface Permission {
  description: string;
  keys: PermissionKeys;
}

export interface Permissions {
  [key: string]: Permission;
}

export interface SystemPermissionsAttributes {
  permissions: Permissions;
}

export interface SystemPermissions {
  object: 'system_permissions';
  attributes: SystemPermissionsAttributes;
}
