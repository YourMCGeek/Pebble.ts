import ApiRequestHandler from '../functions/ApiRequestHandler';
import { ActivityLogResponse } from '../types/account/activityLog';
import { ApiKey, ApiKeyListResponse } from '../types/account/apiKey';
import { SshKey, SshKeyListResponse } from '../types/account/sshKey';
import { UserAttributes } from '../types/account/user';
import { DeletedServerResponse } from '../types/server/deletedServer';

export default class AccountClient {
  private api: ApiRequestHandler;

  constructor(api: ApiRequestHandler) {
    this.api = api;
  }

  /**
   * Fetches the details of the user account.
   *
   * @returns {Promise<UserAttributes>} A promise that resolves to the user's attributes.
   */
  async getDetails(): Promise<UserAttributes> {
    const endpoint = await this.api.request({
      url: '/client/account',
      method: 'GET',
    });
    return endpoint.data;
  }

  /**
   * Retrieves the Multi-Factor Authentication (MFA) credentials for the account.
   *
   * @returns {Promise<{ image_url_data: string; secret: string }>} A promise that resolves to an object containing the MFA credentials:
   * - `image_url_data`: The URL data for the MFA QR code image.
   * - `secret`: The secret key for the MFA.
   *
   * @throws {Error} If two-factor authentication is already enabled on the account, an error with code 400 is thrown.
   */
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

  /**
   * Enables multi-factor authentication (MFA) for the client's account.
   * Utilized in conjunction with {@link getMfaCredentials}.
   *
   * @param code - The MFA code provided by the user.
   * @param password - The user's account password.
   * @returns A promise that resolves to an object containing recovery tokens.
   */
  async enableMfa(
    code: number,
    password: string,
  ): Promise<{
    recovery_tokens: string[];
  }> {
    const endpoint = await this.api.request({
      url: '/client/account/two-factor',
      method: 'POST',
      data: { code, password },
    });
    return endpoint.data;
  }

  /**
   * Disables multi-factor authentication (MFA) for the client's account.
   *
   * @param password - The password of the account to authenticate the request.
   * @throws {Error} - Will throw an error if the password provided is invalid.
   */
  async disableMfa(password: string) {
    const endpoint = await this.api.request(
      {
        url: '/client/account/two-factor',
        method: 'DELETE',
        data: { password },
      },
      [{ code: 400, message: 'The password provided was invalid.' }],
    );
    return endpoint;
  }

  /**
   * Fetches activity logs for the account.
   *
   * @param include - An array of strings specifying which related resources to include in the response.
   * @param filters - A string representing the filters to apply to the activity logs.
   * @param sortField - The field by which to sort the activity logs.
   * @param sortDescending - A boolean indicating whether to sort the activity logs in descending order.
   * @param page - The page number to retrieve.
   * @param maxPerPage - The maximum number of activity logs to retrieve per page.
   * @returns A promise that resolves to an {@link ActivityLogResponse} containing the activity logs.
   */
  async getActivityLogs(
    include?: string[],
    filters?: string,
    sortField?: string,
    sortDescending?: boolean,
    page?: number,
    maxPerPage?: number,
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

  /**
   * Retrieves a list of deleted servers based on the specified filters.
   *
   * @param target_restore_server - The identifier of the target restore server.
   * @param terminated_after - The date after which the servers were terminated (ISO 8601 format).
   * @param page - The page number to retrieve.
   * @param maxPerPage - The maximum number of results per page.
   * @returns A promise that resolves to a {@link DeletedServerResponse} containing the list of deleted servers.
   */
  async getDeletedServers(
    target_restore_server?: string,
    terminated_after?: string,
    page?: number,
    maxPerPage?: number,
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

  /**
   * Updates the password for the account.
   *
   * @param newPassword - The new password to set.
   */
  async updatePassword(newPassword: string) {
    const endpoint = await this.api.request({
      url: '/client/account/password',
      method: 'PUT',
      data: {
        password: newPassword,
      },
    });
    return endpoint;
  }

  /**
   * Retrieves the list of API keys for the account.
   *
   * @returns A promise that resolves to {@link ApiKeyListResponse}.
   */
  async getApiKeys(): Promise<ApiKeyListResponse> {
    const endpoint = await this.api.request({
      url: '/client/account/api-keys',
      method: 'GET',
    });
    return endpoint;
  }

  /**
   * Creates a new API key for the account.
   *
   * @param description - The description of the API key.
   * @param allowedIps - The list of allowed IPs for the API key.
   * @returns A promise that resolves to an {@link ApiKey}.
   */
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

  /**
   * Deletes an API key from the account.
   *
   * @param identifier - The identifier of the API key to delete.
   */
  async deleteApiKey(identifier: string) {
    const endpoint = await this.api.request({
      url: `/client/account/api-keys/${identifier}`,
      method: 'DELETE',
    });
    return endpoint;
  }

  /**
   * Retrieves the list of SSH keys for the account.
   *
   * @returns A promise that resolves to {@link SshKeyListResponse}.
   */
  async getSSHKeys(): Promise<SshKeyListResponse> {
    const endpoint = await this.api.request({
      url: '/client/account/ssh-keys',
      method: 'GET',
    });
    return endpoint;
  }

  /**
   * Creates a new SSH key for the account.
   *
   * @param name - The name of the SSH key.
   * @param public_key - The public key string.
   *
   * @returns A promise that resolves to the created {@link SshKey}.
   */
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

  /**
   * Deletes an SSH key from the account.
   *
   * @param identifier - The identifier of the SSH key to delete.
   */
  async deleteSSHKey(identifier: string) {
    const endpoint = await this.api.request({
      url: `/client/account/ssh-keys/remove`,
      method: 'POST',
      data: { identifier },
    });
    return endpoint;
  }

  /**
   * Retrieves the available permissions for the account.
   *
   * @returns A promise that resolves to the list of available permissions.
   */
  async getAvailablePermissions(): Promise<{
    attributes: Array<string[]>;
  }> {
    const endpoint = await this.api.request({
      url: '/client/permissions',
      method: 'GET',
    });
    return endpoint.data;
  }

  /**
   * Retrieves the IP Address making the request.
   *
   * @returns The the ip address that made the request.
   */
  async getMyIp() {
    const endpoint = await this.api.request({
      url: '/client/myip',
      method: 'GET',
    });
    return endpoint;
  }
}
