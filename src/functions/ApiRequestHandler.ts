import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

class ApiRequestHandler {
  private httpClient: AxiosInstance;

  constructor(apikey: string) {
    this.httpClient = axios.create({
      baseURL: 'https://panel.pebblehost.com',
      headers: {
        Authorization: `Bearer ${apikey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private defaultErrorSet: Array<{ code: number; message: string }> = [
    { code: 401, message: 'Unauthorized. Please confirm that a valid API token is being passed.' },
    { code: 403, message: 'Forbidden.' },
    { code: 405, message: 'Method not allowed. Please report this to the Wrapper developer.' },
    { code: 502, message: 'Daemon is unreachable. Please try again in a few minutes or contact support.' },
  ];

  async request(
    config: AxiosRequestConfig,
    errorSet?: Array<{ code: number; message: string }>,
    ignoredErrors?: Array<string>,
  ): Promise<any> {
    const combinedErrorSet = [...this.defaultErrorSet, ...(errorSet || [])];
    try {
      const response = await this.httpClient.request(config);
      return response.data;
    } catch (err) {
      let error = err as AxiosError;
      let msg = combinedErrorSet.find((e) => e.code === error.response?.status);
      if (msg) {
        throw new Error(msg.message);
      } else {
        if (error.response?.data) {
          let msg = error.response?.data as {
            errors: Array<{ code: string; status: string; detail: string }>;
          };
          if (ignoredErrors) {
            for (const ignoredError of ignoredErrors) {
              if (msg.errors.some((e) => e.code === ignoredError)) {
                return null;
              }
            }
          }
          throw new Error(msg.errors.map((err) => `${err.code}: ${err.detail}`).join('\n'));
        } else {
          throw new Error(
            `${error.response?.status} - ${
              error.response?.statusText || 'An error occurred while communicating with the API'
            }`,
          );
        }
      }
    }
  }
}

export default ApiRequestHandler;
