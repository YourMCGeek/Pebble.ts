interface ApiKey {
  object: 'api_key';
  attributes: {
    identifier: string;
    description: string;
    allowed_ips: string[];
    last_used_at: string | null;
    created_at: string;
  };
}

interface ApiKeyListResponse {
  object: 'list';
  data: ApiKey[];
}

export { ApiKey, ApiKeyListResponse };
