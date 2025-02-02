import ApiRequestHandler from '../functions/ApiRequestHandler';
import { ActivityLogResponse } from '../types/account/activityLog';
import { ApiKey, ApiKeyListResponse } from '../types/account/apiKey';
import { SshKey, SshKeyListResponse } from '../types/account/sshKey';
import { UserAttributes } from '../types/account/user';
import { DeletedServerResponse } from '../types/server/deletedServer';
import { RawUserMfa } from '../typesOld/user/userMfa';

export class AccountClient {
  private api: ApiRequestHandler;

  constructor(api: ApiRequestHandler) {
    this.api = api;
  }

  async getDetails(): Promise<UserAttributes> {
    const endpoint = await this.api.request({ url: '/client/account', method: 'GET' });
    return endpoint.data;
  }

  async getMfaCredentials(): Promise<{
    image_url_data: string;
    secret: string;
  }> {
    const endpoint = await this.api.request({ url: '/client/account/two-factor', method: 'GET' }, [
      {
        code: 400,
        message: 'Two-factor authentication is already enabled on this account. Unable to generate new credentials.',
      },
    ]);
    return endpoint.data;
  }

  async enableMfa(
    code: number,
    password: string,
  ): Promise<{
    recovery_tokens: string[];
  }> {
    const endpoint = await this.api.request({ url: '/client/account/two-factor', method: 'POST', data: { code, password } });
    return endpoint.data;
  }

  async disableMfa(password: string): Promise<void> {
    const endpoint = await this.api.request({ url: '/client/account/two-factor', method: 'DELETE', data: { password } }, [
      { code: 400, message: 'The password provided was invalid.' },
    ]);
  }

  async getActivityLogs(
    include: string[],
    filters: string,
    sortField: string,
    sortDescending: boolean,
    page: number,
    maxPerPage: number,
  ): Promise<ActivityLogResponse> {
    const endpoint = await this.api.request({
      url: '/client/account/activity',
      method: 'GET',
      params: {
        include,
        'filters[event]': filters,
        sort: `${sortDescending ? '-' + sortField : sortField}`,
        page,
        per_page: maxPerPage,
      },
    });
    return endpoint;
  }

  async getDeletedServers(
    target_restore_server: string,
    terminated_after: string,
    page: number,
    maxPerPage: number,
  ): Promise<DeletedServerResponse> {
    const endpoint = await this.api.request({
      url: '/client/account/deleted-servers',
      method: 'GET',
      params: {
        target_restore_server,
        'filters[terminated_after]': terminated_after,
        page,
        per_page: maxPerPage,
      },
    });
    return endpoint;
  }

  async updatePassword(newPassword: string) {
    const endpoint = await this.api.request({
      url: '/client/account/password',
      method: 'PUT',
      data: {
        password: newPassword,
      },
    });
  }

  async getApiKeys(): Promise<ApiKeyListResponse> {
    const endpoint = await this.api.request({ url: '/client/account/api-keys', method: 'GET' });
    return endpoint;
  }

  async createApiKey(description: string, allowedIps: string[]): Promise<ApiKey> {
    const endpoint = await this.api.request({
      url: '/client/account/api-keys',
      method: 'POST',
      data: {
        description,
        allowed_ips: allowedIps,
      },
    });
    return endpoint;
  }

  async deleteApiKey(identifier: string): Promise<void> {
    const endpoint = await this.api.request({ url: `/client/account/api-keys/${identifier}`, method: 'DELETE' });
  }

  async getSSHKeys(): Promise<SshKeyListResponse> {
    const endpoint = await this.api.request({ url: '/client/account/ssh-keys', method: 'GET' });
    return endpoint;
  }

  async createSSHKey(name: string, public_key: string): Promise<SshKey> {
    const endpoint = await this.api.request({
      url: '/client/account/ssh-keys',
      method: 'POST',
      data: {
        name,
        public_key,
      },
    });
    return endpoint;
  }

  async deleteSSHKey(identifier: string): Promise<void> {
    const endpoint = await this.api.request({
      url: `/client/account/ssh-keys/remove`,
      method: 'POST',
      data: { identifier },
    });
  }
}

class UserInstance {
  private api: ApiRequestHandler;
  private userData: UserAttributes;

  constructor(api: ApiRequestHandler, userData: UserAttributes) {
    this.api = api;
    this.userData = userData;
  }

  get(): UserAttributes {
    return this.userData;
  }
}
