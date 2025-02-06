export interface RawUser {
  object: 'user';
  attributes: UserAttributes;
}

export interface UserAttributes {
  id: number;
  admin: boolean;
  username: string;
  email: string;
  language: 'en' | string;
}
