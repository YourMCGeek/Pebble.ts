import { ApiRequestHandler } from '../functions/ApiRequestHandler';
import { ActivityLogResponse } from '../types/account/activityLog';
import { Permissions } from '../types/account/permissions';
import { UserAttributes } from '../types/account/user';
import { DeletedServerResponse } from '../types/server/deletedServer';

export class AccountClient {
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
    return endpoint.attributes as UserAttributes;
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
    let params = {};
    if (include) params = { ...params, include };
    if (filters) params = { ...params, 'filters[event]': filters };
    if (sortField) params = { ...params, sort: `${sortDescending ? '-' : ''}${sortField}` };
    if (page) params = { ...params, page };
    if (maxPerPage) params = { ...params, per_page: maxPerPage };
    const endpoint = await this.api.request({
      url: '/client/account/activity',
      method: 'GET',
      params: {
        ...params,
      },
    });
    return endpoint as ActivityLogResponse;
  }

  /**
   * Retrieves a list of deleted servers based on the specified filters.
   *
   * @param target_restore_server - The identifier of the active server you want to restore to.
   * @param terminated_after - The date after which the servers were terminated (ISO 8601 format).
   * @param page - The page number to retrieve.
   * @param maxPerPage - The maximum number of results per page.
   * @returns A promise that resolves to a {@link DeletedServerResponse} containing the list of deleted servers.
   */
  // FIXME: Unclear documentation on target_restore_server
  async getDeletedServers(
    target_restore_server?: string,
    terminated_after?: string,
    page?: number,
    maxPerPage?: number,
  ): Promise<DeletedServerResponse> {
    let params = {};
    if (target_restore_server) params = { ...params, target_restore_server };
    if (terminated_after) params = { ...params, 'filters[terminated_after]': terminated_after };
    if (page) params = { ...params, page };
    if (maxPerPage) params = { ...params, per_page: maxPerPage };
    const endpoint = await this.api.request({
      url: '/client/account/deleted-servers',
      method: 'GET',
      params: {
        ...params,
      },
    });
    return endpoint as DeletedServerResponse;
  }

  /**
   * Retrieves the available permissions for the account.
   *
   * @returns A promise that resolves to the list of available permissions.
   */
  async getAvailablePermissions(): Promise<Permissions> {
    const endpoint = await this.api.request({
      url: '/client/permissions',
      method: 'GET',
    });
    return endpoint.attributes.permissions as Permissions;
  }

  /**
   * Retrieves the IP Address making the request.
   *
   * @returns The the ip address that made the request.
   */
  async getMyIp(): Promise<string> {
    const endpoint = await this.api.request({
      url: '/client/myip',
      method: 'GET',
    });
    return endpoint as string;
  }
}
