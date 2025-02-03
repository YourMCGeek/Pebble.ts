export interface SignedUrlAttributes {
  url: string;
}

export interface SignedUrl {
  object: 'signed_url';
  attributes: SignedUrlAttributes;
}
