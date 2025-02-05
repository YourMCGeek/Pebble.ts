import { AccountClient } from './clients/AccountClient';
import { ServerClient } from './clients/ServerClient';
import { ApiRequestHandler } from './functions/ApiRequestHandler';

/**
 * The `Wrapper` class provides a convenient interface for interacting with server and account clients.
 * It initializes the necessary clients on demand using a provided API key.
 *
 * @remarks
 * This class uses lazy initialization for the `ServerClient` and `AccountClient` instances.
 *
 * @example
 * ```typescript
 * const wrapper = new Wrapper('your-api-key');
 * const servers = wrapper.servers; // Access the ServerClient instance
 * const account = wrapper.account; // Access the AccountClient instance
 * ```
 */
export class Wrapper {
  private requestHandler: ApiRequestHandler;
  private _serverClient?: ServerClient;
  private _accountClient?: AccountClient;

  constructor(apikey: string) {
    this.requestHandler = new ApiRequestHandler(apikey);
  }

  get servers() {
    if (!this._serverClient) {
      this._serverClient = new ServerClient(this.requestHandler);
    }
    return this._serverClient;
  }

  get account() {
    if (!this._accountClient) {
      this._accountClient = new AccountClient(this.requestHandler);
    }
    return this._accountClient;
  }
}

