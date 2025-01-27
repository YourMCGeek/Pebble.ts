import axios from 'axios';
import { FileAttributes, RawFile } from '../types/user/file';
import { RawSignedUrl } from '../types/user/signedUrl';
import { Server } from './Server';
import { UserClient } from './UserClient';

/* TODO:
 * - GET /api/client/servers/{server}/files/list
 * - GET /api/client/servers/{server}/files/search
 * - GET /api/client/servers/{server}/files/sizes
 * - GET /api/client/servers/{server}/files/upload
 * - Upload Stream?
 * - POST /api/client/servers/{server}/files/create-folder
 * - POST /api/client/servers/{server}/files/chmod
 * - POST /api/client/servers/{server}/files/restore
 * - GET /api/client/servers/{server}/files/pull
 * - POST /api/client/servers/{server}/files/pull
 * - DELETE /api/client/servers/{server}/files/pull/{id}
 * - GET /api/client/servers/{server}/operations
 * - DELETE /api/client/servers/{server}/operations/{operation}
 */

let client: UserClient;
export class File implements FileAttributes {
  name: string;
  readonly mode: string;
  readonly mode_bits: string;
  readonly size: number;
  readonly is_file: boolean;
  readonly is_symlink: boolean;
  mimetype: string;
  readonly created_at: Date;
  modified_at: Date;
  readonly parentServer: Server;
  readonly dir: string = '/';

  constructor(userClient: UserClient, fileProps: RawFile, parentServer: Server, dir: string) {
    client = userClient;
    this.name = fileProps.attributes.name;
    this.mode = fileProps.attributes.mode;
    this.mode_bits = fileProps.attributes.mode_bits;
    this.size = fileProps.attributes.size;
    this.is_file = fileProps.attributes.is_file;
    this.is_symlink = fileProps.attributes.is_symlink;
    this.mimetype = fileProps.attributes.mimetype;
    this.created_at = new Date(fileProps.attributes.created_at);
    this.modified_at = new Date(fileProps.attributes.modified_at);
    this.parentServer = parentServer;
    this.dir = dir.endsWith('/') ? dir : dir + '/';
  }

  /**
   * Get this files content
   */
  public async getContent(): Promise<string> {
    const endpoint = new URL(
      client.panel +
        '/api/client/servers/' +
        this.parentServer.identifier +
        '/files/contents?file=' +
        encodeURIComponent(this.dir + this.name),
    );
    return await client.api({ url: endpoint.href });
  }

  /**
   * Get a one time download url this file
   */
  public async downloadUrl(): Promise<URL> {
    const endpoint = new URL(
      client.panel +
        '/api/client/servers/' +
        this.parentServer.identifier +
        '/files/download?file=' +
        encodeURIComponent(this.dir + this.name),
    );
    return new URL(((await client.api({ url: endpoint.href })) as RawSignedUrl).attributes.url);
  }

  /**
   * Download this file
   */
  public async downloadStream(): Promise<Buffer> {
    const downloadURL = await this.downloadUrl();
    const response = await axios.get(downloadURL.href, {
      responseType: 'arraybuffer',
    });
    return Buffer.from(response.data);
  }

  /**
   * Rename this file
   */
  public async rename(newName: string): Promise<void> {
    await this.parentServer.renameFiles(this.dir, [{ from: this, to: newName }]);
  }

  /**
   * Copy this file
   * When copied, 'copy' is appended to the file name.
   */
  public async copy(): Promise<void> {
    const endpoint = new URL(client.panel + '/api/client/servers/' + this.parentServer.identifier + '/files/copy');
    await client.api({
      url: endpoint.href,
      method: 'POST',
      data: { location: this.dir + this.name },
    });
  }

  /**
   * Write new content to this file
   */
  public async write(content: string): Promise<string> {
    const endpoint = new URL(
      client.panel +
        '/api/client/servers/' +
        this.parentServer.identifier +
        '/files/write?file=' +
        encodeURIComponent(this.dir + this.name),
    );
    return await client.api({
      url: endpoint.href,
      method: 'POST',
      data: content,
    });
  }

  /**
   * Compress this file
   */
  public async compress(): Promise<File> {
    return await this.parentServer.compressFiles(this.dir, [this]);
  }

  /**
   * Decompress this file
   */
  public async decompress(): Promise<void> {
    await this.parentServer.decompressFile(this.dir, this);
  }

  /**
   * Delete this file
   */
  public async delete(): Promise<void> {
    await this.parentServer.deleteFiles(this.dir, [this]);
  }
}
