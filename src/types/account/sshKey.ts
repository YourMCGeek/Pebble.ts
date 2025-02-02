interface SshKey {
  object: 'ssh_key';
  attributes: {
    name: string;
    fingerprint: string;
    public_key: string;
    created_at: string;
  };
}

interface SshKeyListResponse {
  object: 'list';
  data: SshKey[];
}

export { SshKey, SshKeyListResponse };
