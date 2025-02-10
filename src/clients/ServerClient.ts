import { ApiRequestHandler } from '../functions/ApiRequestHandler';
import { ActivityLogResponse } from '../types/account/activityLog';
import { SignedUrlAttributes } from '../types/misc/signedUrl';
import { BackupList, BackupStatus } from '../types/server/serverBackup';
import { DatabaseList, ServerDatabaseAttributes } from '../types/server/database';
import {
  ServerListResponse,
  ServerAttributes,
  StatsDetails,
  Server,
  SftpDetails,
  Limits,
  FeatureLimits,
  Relationships,
  Node,
} from '../types/server/server';
import { DatabaseBackupList } from '../types/server/databaseBackup';
import { FileObjectList, FilePullList } from '../types/server/files';
import { EventsAndActors } from '../types/server/activityFilters';
import { AnalyticsData } from '../types/server/analytics';
import { Preinstalls } from '../types/server/preinstalls';
import { ProjectEggVariable, ProjectList } from '../types/server/projects';
import { Notices } from '../types/server/notices';
import { Operations } from '../types/server/operations';
import {
  AdpAnalytics,
  AdpASNFirewallRule,
  AdpCountryFirewallRule,
  AdpDetails,
  AdpGraphData,
  AdpIpFirewallRule,
  AdpSettings,
} from '../types/server/adp';

/**
 * Represents a client for interacting with the server API.
 */
export class ServerClient {
  private requestHandler: ApiRequestHandler;

  constructor(requestHandler: ApiRequestHandler) {
    this.requestHandler = requestHandler;
  }

  /**
   * Returns all servers available to the authenticated user. Including
   * both servers they own and servers they are a subuser on.
   *
   * @returns A promise that resolves to {@link ServerListResponse}.
   */
  // TODO Add filters
  async getServers(): Promise<ServerListResponse> {
    const endpoint = await this.requestHandler.request({
      url: '/client',
      method: 'GET',
    });
    return endpoint as ServerListResponse;
  }

  /**
   * Retrieves a server by its UUID.
   * @param uuid - The UUID of the server to retrieve.
   *
   * @returns A promise that resolves to a {@link ServerObject}.
   */
  async getServerByUUID(uuid: string): Promise<ServerObject> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${uuid}`,
      method: 'GET',
    });
    return new ServerObject(this.requestHandler, endpoint);
  }
}

/**
 * Represents a server object.
 *
 * @remarks This class lazy loads additional routes, such as backups, databases, and files.
 */
class ServerObject implements Server {
  private requestHandler: ApiRequestHandler;
  public attributes: ServerAttributes;

  constructor(api: ApiRequestHandler, server: Server) {
    this.requestHandler = api;
    this.attributes = server.attributes;
  }
  object: 'server' = 'server';

  // TODO ADP - No documentation

  /* Lazy Load Additional Routes */
  private _backups: BackupsObject | null = null;
  private _databses: DatabaseObject | null = null;
  private _files: FileObject | null = null;
  private _adp: AdvancedDDoSProtectionObject | null = null;

  get databases(): DatabaseObject {
    if (!this._databses) {
      this._databses = new DatabaseObject(this.requestHandler, this.attributes.uuid);
    }
    return this._databses;
  }

  get files(): FileObject {
    if (!this._files) {
      this._files = new FileObject(this.requestHandler, this.attributes.uuid);
    }
    return this._files;
  }

  get backups(): BackupsObject {
    if (!this._backups) {
      this._backups = new BackupsObject(this.requestHandler, this.attributes.uuid);
    }
    return this._backups;
  }

  get adp(): AdvancedDDoSProtectionObject {
    if (!this._adp) {
      this._adp = new AdvancedDDoSProtectionObject(this.requestHandler, this.attributes.uuid);
    }
    return this._adp;
  }

  /**
   * Retrieves the server attributes.
   *
   * @returns A promise that resolves to the {@link ServerAttributes}.
   */
  async getDetails(): Promise<ServerAttributes> {
    return this.attributes as ServerAttributes;
  }

  /**
   * Return the current resource utilization for a server. This value is cached for up to
   * 20 seconds at a time to ensure that repeated requests to this endpoint do not cause
   * a flood of unnecessary API calls.
   *
   * @returns A promise that resolves to the server's resource statistics details.
   */
  async getResources(): Promise<StatsDetails> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/resources`,
      method: 'GET',
    });
    return endpoint.attributes as StatsDetails;
  }

  /**
   * Returns the activity logs for a server.
   *
   * @param include - An optional array of strings to include additional data in the response.
   * @param filterActorsId - An optional string to filter logs by actor ID.
   * @param filterEvent - An optional string to filter logs by event type.
   * @param sort - An optional string to specify the field to sort by.
   * @param sortDescending - An optional boolean to specify if the sorting should be in descending order.
   * @param page - An optional number to specify the page of results to retrieve.
   * @param maxPerPage - An optional number to specify the maximum number of results per page.
   * @returns A promise that resolves to an {@link ActivityLogResponse} object containing the activity logs.
   */
  async getActivityLogs(
    include?: string[],
    filterActorsId?: string,
    filterEvent?: string,
    sort?: string,
    sortDescending?: boolean,
    page?: number,
    maxPerPage?: number,
  ): Promise<ActivityLogResponse> {
    let params = {};
    if (include) params = { ...params, include };
    if (filterActorsId) params = { ...params, 'filters[actor_id]': filterActorsId };
    if (filterEvent) params = { ...params, 'filters[event]': filterEvent };
    if (sort) params = { ...params, sort: `${sortDescending ? '-' : ''}${sort}` };
    if (page) params = { ...params, page };
    if (maxPerPage) params = { ...params, per_page: maxPerPage };
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/activity`,
      method: 'GET',
      data: {
        ...params,
      },
    });
    return endpoint as ActivityLogResponse;
  }

  /**
   * Fetches the activity filters for the server associated with this client.
   *
   * @returns {EventsAndActors} A promise that resolves to {@link EventsAndActors}.
   */
  async getActivityFilters(): Promise<EventsAndActors> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/activity/filters`,
      method: 'GET',
    });
    return endpoint as EventsAndActors;
  }

  // FIXME: What does each value mean?
  /**
   * Retrieves analytics data for the specified number of days.
   *
   * @param days - The number of days for which to retrieve analytics data. Must be 10 or fewer, defaults to 7.
   * @returns A promise that resolves with the analytics data or rejects with an error if the number of days exceeds 10.
   * @throws {Error} Number of days must be less than or equal to 10.
   */
  async getAnalytics(days: number | 7): Promise<AnalyticsData> {
    if (days > 10) {
      return Promise.reject(new Error('The maximum number of days that can be requested is 10.'));
    }
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/analytics`,
      method: 'GET',
      data: { days: days },
    });
    return endpoint as AnalyticsData;
  }

  /**
   * Runs the server importer to import files from another host.
   *
   * @param protocol - The protocol to use for the import, either 'sftp' or 'ftp'.
   * @param hostname - The hostname of the server to import.
   * @param port - The port number to connect to, defaults to 2022.
   * @param username - The username for authentication.
   * @param password - The password for authentication.
   * @throws {ValidationException} - If any parameters are missing.
   */
  async startImport(protocol: string, hostname: string, port: 2022 | number, username: string, password: string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/import`,
      method: 'POST',
      data: {
        protocol: protocol,
        hostname: hostname,
        port: port,
        username: username,
        password: password,
      },
    });
    return endpoint;
  }

  /**
   * Returns the locations a server is able to be migrate to based on its tier.
   *
   * @returns A promise that resolves to an array of available migration locations.
   */
  async getAvailableMigrationLocations(): Promise<string[]> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/migration`,
      method: 'GET',
    });
    return endpoint;
  }

  /**
   * Starts the migration process for a server.
   *
   * @param location - The target location for the migration. Must be a valid location.
   * @returns A promise that resolves with the endpoint response if the migration is initiated successfully,
   *          or rejects with an error if the location is invalid.
   * @throws {Error} If the location is not valid. Use {@link getAvailableMigrationLocations} to get a list of available locations.
   * @throws {Error} If the parameter is missing.
   */
  async startMigration(location: string) {
    if (!location) {
      return Promise.reject(
        new Error(
          'The location must be a valid location. Use getAvailableMigrationLocations to get a list of available locations.',
        ),
      );
    }
    if (location.length > 2) {
      return Promise.reject(
        new Error(
          'The location must be a valid location. Use getAvailableMigrationLocations to get a list of available locations.',
        ),
      );
    }
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/migration`,
      method: 'POST',
      data: { location: location },
    });
    return endpoint;
  }

  /**
   * Renames the server with the given name and description.
   *
   * @param name - The new name for the server.
   * @param description - The new description for the server.
   */
  async renameServer(name: string, description?: string) {
    let params = {};
    if (description) params = { ...params, description: description };
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/settings/rename`,
      method: 'POST',
      data: { name: name, ...params },
    });
    return endpoint;
  }

  /**
   * Sets the subdomain for the server, automatically suffixed by `.my.pebble.host`.
   *
   * @param subdomain - The subdomain to set for the server.
   */
  async setSubdomain(subdomain: string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/settings/subdomain`,
      method: 'POST',
      data: { domain: subdomain },
    });
    return endpoint;
  }

  /**
   * Retrieves a list of available preinstalls for the server.
   *
   * @returns A promise that resolves to a {@link PreinstallList} containing the available preinstalls.
   */
  async getAvailablePreinstalls(): Promise<Preinstalls> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/preinstalls`,
      method: 'GET',
    });
    return endpoint as Preinstalls;
  }

  // FIXME: Which ID is this referring to?
  /**
   * Starts a preinstall process for the server.
   *
   * @param {number} id - The ID of the preinstall to start.
   * @throws {Error} - Throws an error if the id parameter is not provided.
   */
  async startPreinstall(id: number) {
    if (!id) {
      return Promise.reject(new Error('The id parameter is required.'));
    }
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/preinstalls/`,
      method: 'POST',
      data: { id: id },
    });
    return endpoint;
  }

  // FIXME: Returns 404: Is this not implemented yet?
  async getProjects(): Promise<ProjectList> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/projects`,
      method: 'GET',
    });
    return endpoint as ProjectList;
  }

  async installProject(versionId: number): Promise<any> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/projects/install`,
      method: 'POST',
      data: { version_id: versionId },
    });
    if (endpoint.status === 200) {
      return Promise.resolve(endpoint as ProjectEggVariable);
    } else {
      return endpoint;
    }
  }

  /**
   * Returns a list of Node.js versions that can be selected by Node.js Bots.
   *
   * @returns A promise that resolves to an array of Node.js versions.
   * @throws {Error} Throws an error if the server is not a Bot hosting server.
   */
  // FIXME: Update Route for consistency
  // FIXME: Returns forbidden
  async getNodeJSVersions(): Promise<string[]> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/bot-node-versions`,
      method: 'GET',
    });
    if (endpoint.code === 'ERR_BAD_REQUEST') {
      throw new Error('This endpoint is only available for Bot hosting servers.');
    }
    return endpoint;
  }

  /**
   * Fetches the notices for the server associated with this client.
   * Banners may include a resource warning (server constantly near or at resoruce limits) or modpack updates.
   *
   * @returns A promise that resolves to an array of notice strings.
   */
  async getNotices(): Promise<Notices> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/notices`,
      method: 'GET',
    });
    return endpoint as Notices;
  }

  /**
   * Dismisses the resource warning notice for the given server.
   */
  async dismissResourceNotice() {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.attributes.uuid}/notices/resources`,
      method: 'DELETE',
    });
    return endpoint;
  }

  /**
   * Retrieves the limits associated with the server.
   *
   * @returns A promise that resolves to {@link Limits}.
   */
  async getLimits(): Promise<Limits> {
    return this.attributes.limits as Limits;
  }

  /**
   * Retrieves the SFTP details from the server client.
   *
   * @returns A promise that resolves to {@link SftpDetails}.
   */
  async getSFTPDetails(): Promise<SftpDetails> {
    return this.attributes.sftp_details as SftpDetails;
  }

  /**
   * Retrieves the feature limits associated with the server, including number of databases, allocations, backups, and subservers.
   *
   * @returns A promise that resolves to the feature limits.
   */
  async getFeatureLimits(): Promise<FeatureLimits> {
    return this.attributes.feature_limits as FeatureLimits;
  }

  /**
   * Retrieves the relationships associated with the current instance.
   *
   * @returns A promise that resolves to the {@link Relationships}.
   */
  async getRelationships(): Promise<Relationships> {
    return this.attributes.relationships as Relationships;
  }

  /**
   * Retrieves the node attribute, including the name, location, type, and status link.
   *
   * @returns A promise that resolves to the {@link Node}.
   */
  async getNode(): Promise<Node> {
    return this.attributes.node as Node;
  }

  /**
   * Retrieves the egg features associated with the current instance.
   * @todo Provide expected results
   * @returns A promise that resolves to an array of egg features.
   */
  async getEggFeatures(): Promise<string[]> {
    return this.attributes.egg_features as string[];
  }

  async getStatusLink(): Promise<string> {
    return this.attributes.node.status_link as string;
  }
}

class BackupsObject {
  private requestHandler: ApiRequestHandler;
  private uuid: string;

  constructor(api: ApiRequestHandler, uuid: string) {
    this.requestHandler = api;
    this.uuid = uuid;
  }

  /**
   * Returns all the backups for a given server instance in a paginated result set.
   *
   * @returns A promise that resolves to the list of backups, {@link BackupList}.
   */
  async getBackups(): Promise<BackupList> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/backups`,
      method: 'GET',
    });
    return endpoint;
  }

  /**
   * Starts the backup process for a server.
   */
  async startBackup() {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/backups`,
      method: 'POST',
    });
    return endpoint;
  }

  /**
   * Return data about any current in-progress backup actions.
   *
   * @returns A promise that resolves to the backup status.
   */
  async getStatus(): Promise<BackupStatus> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/backups/status`,
      method: 'GET',
    });
    return endpoint as BackupStatus;
  }

  /**
   * Restore a backup from a deleted server onto this server.
   *
   * @param deletedServerId - The ID of the deleted server.
   */
  async restoreFromDeleted(deletedServerId: string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/backups/deletedRestore`,
      method: 'POST',
      data: { deleted_server_id: deletedServerId },
    });
    return endpoint;
  }

  /**
   * Generate a download link for a backup that has been exported.
   *
   * @param backup - The backup identifier.
   * @returns A URL to download the backup.
   */
  async getDownload(backup: string): Promise<SignedUrlAttributes> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/backups/${backup}/download`,
      method: 'GET',
    });

    return endpoint.attributes.url as SignedUrlAttributes;
  }

  /**
   * Restore a given backup onto the server.
   *
   * @param id - The backup identifier.
   */
  // FIXME: Update documentation
  async restore(id: string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/backups/${id}/restore`,
      method: 'POST',
    });
    return endpoint;
  }

  /**
   * Start the export process for a given backup so it can be downloaded.
   *
   * @param id - The backup identifier.
   */
  async export(id: string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/backups/${id}/export`,
      method: 'POST',
    });
    return endpoint;
  }

  /**
   * Deletes a backup from the panel as well as the remote source where it is currently being stored.
   *
   * @param backup - The backup identifier.
   */
  async delete(backup: string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/backups/${backup}`,
      method: 'DELETE',
    });
    return endpoint;
  }
}

class DatabaseObject {
  private requestHandler: ApiRequestHandler;
  private uuid: string;

  constructor(api: ApiRequestHandler, uuid: string) {
    this.requestHandler = api;
    this.uuid = uuid;
  }

  /**
   * Return all the databases that belong to the given server.
   *
   * @returns A promise that resolves to the list of databases.
   */
  async getDatabases(): Promise<DatabaseList> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/databases`,
      method: 'GET',
    });
    return endpoint as DatabaseList;
  }

  /**
   * Create a new database for the given server.
   *
   * @param database - The name of the database to create.
   * @param remote - The remote address to allow connections from, defaults to `%`.
   * @returns A promise that resolves to the created database, {@link ServerDatabaseAttributes}.
   */
  async createDatabase(database: string, remote?: string | '%'): Promise<ServerDatabaseAttributes> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/databases`,
      method: 'POST',
      data: { database: database, remote: remote },
    });
    return endpoint as ServerDatabaseAttributes;
  }

  /**
   * Returns a list of available database backups for a server.
   *
   * @returns A promise that resolves to the list of database backups. {@link DatabaseBackupList}.
   */
  async getBackups(): Promise<DatabaseBackupList> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/databases/backups`,
      method: 'GET',
    });
    return endpoint as DatabaseBackupList;
  }

  /**
   * Starts the export process for a database so it can be downloaded.
   *
   * @param backup - The backup identifier.
   */
  async exportBackup(backup: string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/databases/backups/${backup}/export`,
      method: 'POST',
    });
    return endpoint;
  }

  /**
   * Generate a download link for a database backup that has been exported.
   *
   * @param backup - The backup identifier.
   * @returns A URL for downloading.
   */
  async downloadBackup(backup: string): Promise<SignedUrlAttributes> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/databases/backups/${backup}/download`,
      method: 'GET',
    });
    return endpoint.attributes.url as SignedUrlAttributes;
  }

  /**
   * Rotates the password for the given database.
   *
   * @param databaseId - The ID of the database.
   * @returns - A new password for the database.
   */
  // FIXME: Update documentation
  async rotatePassword(databaseId: string): Promise<string> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/databases/${databaseId}/rotate-password`,
      method: 'POST',
    });
    return endpoint.attributes.relationships.password.attributes.password as string;
  }

  /**
   * Removes a database from the server.
   *
   * @param id - The name of the database to delete.
   */
  async deleteDatabase(id: string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/databases/${id}`,
      method: 'DELETE',
    });
    return endpoint;
  }

  /**
   * Returns a SQL dump of the database.
   *
   * @param id - The ID of the database.
   */
  async exportDatabase(id: number): Promise<string> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/databases/${id}/export`,
      method: 'POST',
    });
    return endpoint as string;
  }

  // FIXME: Undocumented body
  /**
   * Imports the given SQL dump to the database.
   *
   * @param id - The ID of the database.
   */
  async importDatabase(id: number) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/databases/${id}/import`,
      method: 'POST',
    });
    return endpoint;
  }
}

class FileObject {
  private requestHandler: ApiRequestHandler;
  private uuid: string;

  constructor(api: ApiRequestHandler, uuid: string) {
    this.requestHandler = api;
    this.uuid = uuid;
  }

  /**
   * Returns a listing of files in a given directory.
   *
   * @param directory - The directory to list files from, defaults to `/`.
   * @returns A promise that resolves to the list of files, {@link FileObjectList}.
   */
  async getFiles(directory?: '/' | string): Promise<FileObjectList> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/list`,
      method: 'GET',
      data: { directory: directory },
    });
    return endpoint as FileObjectList;
  }

  /**
   * Searches the files of a server.
   *
   * @param query - The search query.
   * @param root - The root directory to search from, defaults to `/`.
   * @returns A promise that resolves to the list of search results, {@link FileObjectList}.
   */
  async searchFiles(query: string, root?: '/' | string): Promise<FileObjectList> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/search`,
      method: 'GET',
      data: { root: root, query: query },
    });
    return endpoint as FileObjectList;
  }

  /**
   * Return the contents of a specified file for the user.
   *
   * @param filePath - The path of the file to get contents from.
   * @returns A promise that resolves to the file contents.
   */
  async getContents(filePath: string): Promise<string> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/contents`,
      method: 'GET',
      data: { file: filePath },
    });
    return endpoint as string;
  }

  /**
   * Generates a one-time token with a link that the user can use to download a given file.
   *
   * @param filePath - The path of the file to download.
   * @returns A promise that resolves to the signed URL attributes.
   */
  async downloadFile(filePath: string): Promise<SignedUrlAttributes> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/download`,
      method: 'GET',
      data: { file_path: filePath },
    });
    return endpoint.attributes.url as SignedUrlAttributes;
  }

  // TODO Maybe combine? Slightly confusing documentation, needs better error handling
  /**
   * Generates a one-time token with a link that the user can use to download multiple files.
   *
   * @param paths - The paths of the files to download.
   * @param root - The root directory to download from, defaults to `/`.
   * @returns A URL for downloading.
   */
  async downloadFiles(paths: string[], root?: '/' | string): Promise<SignedUrlAttributes> {
    let params = {};
    if (root) params = { ...params, root: root };
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/download`,
      method: 'GET',
      data: { paths: paths, ...params },
    });
    return endpoint.attributes.url as SignedUrlAttributes;
  }

  /**
   * Returns a map of file and directory names to their recursively calculated size.
   *
   * @param root - The root directory to calculate sizes from, defaults to `/`.
   * @returns An array of `{ "fileName": (number) size }`.
   */
  async getFileSizes(root?: '/' | string): Promise<Array<string>> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/sizes`,
      method: 'GET',
      data: { root: root },
    });
    return endpoint as Array<string>;
  }

  /**
   * Returns an URL where files can be uploaded to. Each URL may only be used once.
   *
   * @returns Returns an URL where files can be uploaded to.
   */
  async getUploadURL(): Promise<SignedUrlAttributes> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/upload`,
      method: 'GET',
    });
    return endpoint.attributes.url as SignedUrlAttributes;
  }

  /**
   * Uploads files to the server.
   *
   * @param files - The files to upload.
   */
  async uploadFiles(files: string[]) {
    let uploadURL = await this.getUploadURL();
    const endpoint = await this.requestHandler.request({
      url: uploadURL.url,
      method: 'POST',
      data: { files: files },
    });
    return endpoint;
  }

  /**
   * Copies a file on the server.
   *
   * @param location - The location to copy the file to.
   */
  async copyFile(location: string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/copy`,
      method: 'POST',
      data: { location: location },
    });
    return endpoint;
  }

  /**
   * Writes the contents of the specified file to the server.
   *
   * @param contentToWrite - The content to write to the file.
   * @param filePath - The path of the file to write to.
   */
  async writeFile(filePath: string, contentToWrite: string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/write`,
      method: 'POST',
      params: { file: filePath },
      headers: { 'Content-Type': 'text/plain' },
      data: contentToWrite,
    });
    return endpoint;
  }

  /**
   * Compresses multiple files and or directories into an archive. Runs in the background.
   *
   * @param files - The files to compress.
   * @param root - The root directory to compress from, defaults to `/`.
   */
  async compressFiles(files: string[], root?: '/' | string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/compress`,
      method: 'POST',
      data: { files: files, root: root },
    });
    return endpoint;
  }

  /**
   * Extracts an archive into a directory. Runs in the background.
   *
   * @param filePath - The path of the archive to extract.
   * @param root - The root directory to extract to, defaults to `/`.
   */
  async extractFile(filePath: string, root?: '/' | string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/extract`,
      method: 'POST',
      data: { file: filePath, root: root },
    });
    return endpoint;
  }

  /**
   * Deletes files or folders for the server in the given root directory.
   *
   * @param files - The files to delete.
   * @param root - The root directory to delete from, defaults to `/`.
   * @param permanent - Whether to permanently delete the files, defaults to `false`.
   */
  async deleteFiles(files: string[], root?: '/' | string, permanent?: boolean | false) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/delete`,
      method: 'POST',
      data: { files: files, root: root, permanent: permanent },
    });
    return endpoint;
  }

  /**
   * Creates a new directory on the server.
   *
   * @param directoryName - The name of the directory to create.
   * @param root - The root directory to create the new directory in, defaults to `/`.
   */
  async createDirectory(directoryName: string, root?: '/' | string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/create-directory`,
      method: 'POST',
      data: { root: root, name: directoryName },
    });
    return endpoint;
  }

  // TODO Update permissions to builder?
  /**
   * Updates file permissions for file(s) in the given root directory.
   *
   * @param fileName - The name of the file to update permissions for.
   * @param mode - The new permissions mode in the form of chmod.
   * @param root - The root directory of the file, defaults to `/`.
   */
  async changePermission(fileName: string, mode: number | string, root?: '/' | string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/chmod`,
      method: 'POST',
      data: { root: root, files: [{ file: fileName, mode: mode.toString }] },
    });
    return endpoint;
  }

  // FIXME Undocumented, how to get id, what are paths?
  /**
   * Restores recycled files on a server.
   *
   * @param id - The ID of the recycled files.
   * @param root - The root directory to restore to, defaults to `/`.
   * @param paths - The paths of the files to restore.
   */
  async restoreFile(id: number[], root?: '/' | string, paths?: string[]) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/restore`,
      method: 'POST',
      data: { root: root, id: id, paths: paths },
    });
    return endpoint;
  }

  // TODO Rename files to builder?
  /**
   * Renames a file on the server.
   *
   * @param filePath - The path of the file to rename.
   * @param oldName - The old name of the file.
   * @param newName - The new name of the file.
   */
  async renameFile(filePath: string, oldName: string, newName: string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/rename`,
      method: 'PUT',
      data: { file: filePath, files: [{ from: oldName, to: newName }] },
    });
    return endpoint;
  }

  /**
   * Returns a list of ongoing file pulls on the server.
   *
   * @returns A promise that resolves to the list of file pulls. {@link FilePullList}.
   */
  async getFilePulls(): Promise<FilePullList> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/pulls`,
      method: 'GET',
    });
    return endpoint as FilePullList;
  }

  /**
   * Starts a file pull in the background for the server.
   *
   * @param url - The URL to pull the file from.
   * @param fileName - The name of the file to pull, defaults to the name of the file.
   * @param root - The root directory to pull the file to. defaults to `/`.
   * @param headers - Headers to use when pulling the file. defaults to false.
   * @param foreground - Whether to run the pull in the foreground. defaults to false.
   */
  async startFilePull(
    url: string,
    fileName?: string,
    root?: '/' | string,
    use_headers?: boolean | false,
    foreground?: boolean | false,
  ) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/pulls`,
      method: 'POST',
      data: { url: url, root: root, name: fileName, use_header: use_headers, foreground: foreground },
    });
    return endpoint;
  }

  /**
   * Cancels an on-going file pull for a server, any partially downloaded content will be removed.
   *
   * @param id - The ID of the file pull to cancel.
   */
  async cancelFilePull(id: number) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/files/pulls/${id}`,
      method: 'DELETE',
    });
    return endpoint;
  }

  /**
   * Returns all operations that are being ran on the server.
   *
   * @returns A promise that resolves to the list of operations.
   */
  async getCurrentOperations(): Promise<Operations> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/operations`,
      method: 'GET',
    });
    return endpoint as Operations;
  }

  /**
   * Cancels a running operation on a server.
   *
   * @param operation - The operation to cancel.
   */
  // FIXME: Clarify, is this operation the operation ID?
  async cancelOperation(operation: string) {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/operations/${operation}`,
      method: 'DELETE',
    });
    return endpoint;
  }
}

class AdvancedDDoSProtectionObject {
  private requestHandler: ApiRequestHandler;
  private uuid: string;

  constructor(api: ApiRequestHandler, uuid: string) {
    this.requestHandler = api;
    this.uuid = uuid;
  }

  /**
   * Fetches the ADP (Advanced DDoS Protection) details for the server associated with this client.
   *
   * @returns {Promise<AdpDetails>} A promise that resolves to the ADP details of the server.
   */
  async getDetails(): Promise<AdpDetails> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp`,
      method: 'GET',
    });
    return endpoint as AdpDetails;
  }

  /**
   * Enables ADP (Advanced DDoS Protection) for the specified domain.
   *
   * @param domain - The domain to enable ADP for.
   * @param isPebbleSubdomain - Whether the domain is a Pebblehost subdomain.
   * @returns {Promise<AdpDetails>} A promise that resolves to the updated ADP details.
   */
  async enableProtection(domain: string, isPebbleSubdomain: boolean): Promise<AdpDetails> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/adp`,
      method: 'POST',
      params: { domain: domain, is_pebble_subdomain: isPebbleSubdomain, server: this.uuid },
    });
    return endpoint as AdpDetails;
  }

  // TODO Update Protection via Builder

  /**
   * Disables ADP (Advanced DDoS Protection) for the server.
   */
  async disableProtection() {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp`,
      method: 'DELETE',
      params: { server: this.uuid },
    });
    return endpoint;
  }

  /**
   * Fetches the ADP (Advanced DDoS Protection) settings for the Minecraft server.
   *
   * @returns {Promise<AdpSettings>} A promise that resolves to the ADP settings.
   */
  async getADPSettings(): Promise<AdpSettings> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp/settings`,
      method: 'GET',
    });
    return endpoint as AdpSettings;
  }

  /**
   * Fetches the ADP (Advanced DDoS Protection) analytics data.
   *
   * @returns {Promise<AdpAnalytics>} A promise that resolves to the ADP analytics data.
   */
  async getAnalytics(): Promise<AdpAnalytics> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp/analytics`,
      method: 'GET',
    });
    return endpoint as AdpAnalytics;
  }

  /**
   * Fetches the ADP (Advanced DDoS Protection) graph data.
   *
   * @returns {Promise<AdpGraphData>} A promise that resolves to the ADP graph data.
   */
  async getGraphsData(): Promise<AdpGraphData> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp/graphs`,
      method: 'GET',
    });
    return endpoint as AdpGraphData;
  }

  /**
   * Verifies the ADP (Advanced DDoS Protection) configuration.
   *
   */
  async verify() {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp/verify`,
      method: 'POST',
    });
    return endpoint;
  }

  /**
   * Fetches the IP firewall rules for the server.
   *
   * @returns {Promise<AdpIpFirewallRule>} A promise that resolves to the IP firewall rules.
   */
  async getIPFirewallRules(): Promise<AdpIpFirewallRule> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp/firewall`,
      method: 'GET',
    });
    return endpoint as AdpIpFirewallRule;
  }

  /**
   * Creates an IP firewall rule for the specified CIDR.
   * @param cidr - The CIDR notation for the IP address or range.
   * @param whitelist - Indicates whether the rule should be a whitelist (true) or blacklist (false).
   * @returns {Promise<AdpIpFirewallRule>} A promise that resolves to the created firewall rule's details.
   */
  async createIPFirewallRule(cidr: string, whitelist: boolean): Promise<AdpIpFirewallRule> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp/firewall`,
      method: 'POST',
      params: { cidr: cidr, whitelist: whitelist },
    });
    return endpoint as AdpIpFirewallRule;
  }

  /**
   * Deletes an IP firewall rule for the server.
   *
   * @param ruleId - The ID of the firewall rule to delete.
   * @returns A promise that resolves to an object containing the status and message of the deletion operation.
   */
  async deleteIPFirewallRule(ruleId: string): Promise<{
    status: number;
    message: string;
  }> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp/firewall/${ruleId}`,
      method: 'DELETE',
    });
    return endpoint as { status: number; message: string };
  }

  /**
   * Retrieves the ASN firewall rules for the server.
   *
   * @returns {Promise<AdpASNFirewallRule>} A promise that resolves to the ASN firewall rules.
   */
  async getASNFirewallRules(): Promise<AdpASNFirewallRule> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp/asnFirewall`,
      method: 'GET',
    });
    return endpoint as AdpASNFirewallRule;
  }

  /**
   * Creates an ASN firewall rule for the server.
   *
   * @param asn - The Autonomous System Number (ASN) to be added to the firewall rule.
   * @param whitelist - A boolean indicating whether the ASN should be whitelisted (true) or blacklisted (false).
   * @returns {Promise<AdpASNFirewallRule>} A promise that resolves to the created firewall rule's details.
   */
  async createASNFirewallRule(asn: number, whitelist: boolean): Promise<AdpASNFirewallRule> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp/asnFirewall`,
      method: 'POST',
      params: { asn: asn, whitelist: whitelist },
    });
    return endpoint as AdpASNFirewallRule;
  }

  /**
   * Deletes an ASN firewall rule for the server.
   *
   * @param ruleId - The unique identifier of the ASN firewall rule to be deleted.
   * @returns A promise that resolves to an object containing the status and message of the deletion operation.
   */
  async deleteASNFirewallRule(ruleId: string): Promise<{
    status: number;
    message: string;
  }> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp/asnFirewall/${ruleId}`,
      method: 'DELETE',
    });
    return endpoint as { status: number; message: string };
  }

  /**
   * Retrieves the country firewall rules for the Minecraft server associated with this client.
   *
   * @returns {Promise<AdpCountryFirewallRule>} A promise that resolves to the country firewall rules.
   */
  async getCountryFirewallRules(): Promise<AdpCountryFirewallRule> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp/countryFirewall`,
      method: 'GET',
    });
    return endpoint as AdpCountryFirewallRule;
  }

  /**
   * Creates a country firewall rule for the server.
   *
   * @param countryCode - The country code for which the firewall rule is to be created.
   * @param whitelist - A boolean indicating whether the rule is a whitelist (true) or a blacklist (false).
   * @returns {Promise<AdpCountryFirewallRule>} A promise that resolves to the created firewall rule's details.
   */
  async createCountryFirewallRule(countryCode: string, whitelist: boolean): Promise<AdpCountryFirewallRule> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp/countryFirewall`,
      method: 'POST',
      params: { country_id: countryCode, whitelist: whitelist },
    });
    return endpoint as AdpCountryFirewallRule;
  }

  /**
   * Deletes a country firewall rule for the server.
   *
   * @param ruleId - The unique identifier of the firewall rule to be deleted.
   * @returns A promise that resolves to an object containing the status and message of the deletion operation.
   */
  async deleteCountryFirewallRule(ruleId: string): Promise<{
    status: number;
    message: string;
  }> {
    const endpoint = await this.requestHandler.request({
      url: `/client/servers/${this.uuid}/minecraft/adp/countryFirewall/${ruleId}`,
      method: 'DELETE',
    });
    return endpoint as { status: number; message: string };
  }
}
