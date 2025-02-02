import ServerClient from './clients/ServerClient';
import ApiRequestHandler from './functions/ApiRequestHandler';

class Wrapper {
  private requestHandler: ApiRequestHandler;
  private _serverClient?: ServerClient;

  constructor(apikey: string) {
    this.requestHandler = new ApiRequestHandler(apikey);
  }

  get servers() {
    if (!this._serverClient) {
      this._serverClient = new ServerClient(this.requestHandler);
    }
    return this._serverClient;
  }
}

export default Wrapper;
