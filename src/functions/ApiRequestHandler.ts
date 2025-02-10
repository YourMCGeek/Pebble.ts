import axios, { AxiosInstance, AxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';

/**
 * Handles API requests to the PebbleHost API.
 *
 * @author BothimTV <https://github.com/BothimTV/pterodactyl.ts/blob/main/src/functions/axois.ts>
 */
export class ApiRequestHandler {
  private httpClient: AxiosInstance;
  private requestQueue: Array<() => Promise<any>> = [];
  private isProcessingQueue: boolean = false;
  private rateLimitDelay: number = 1000; // Initial delay (fallback if no rate limit headers are provided)
  private rateLimitRemaining: number | null = null; // Tracks remaining requests
  private rateLimitReset: number | null = null; // Tracks when the rate limit resets

  constructor(apikey: string) {
    this.httpClient = axios.create({
      baseURL: 'https://panel.pebblehost.com/api',
      headers: {
        Authorization: `Bearer ${apikey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  private defaultErrorSet: Array<{ code?: string; status: number; message: string }> = [
    {
      status: 401,
      message: 'Unauthorized. Please confirm that a valid API token is being passed.',
    },
    /* { status: 403, message: 'Forbidden.' }, */
    {
      status: 405,
      message: 'Method not allowed. Please report this to the Wrapper developer.',
    },
    /* {
      status: 502,
      message: 'Daemon is unreachable. Please try again in a few minutes or contact support.',
    }, */
  ];

  /**
   * Adds a request to the queue and processes the queue if it's not already being processed.
   */
  private async enqueueRequest(config: AxiosRequestConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const response = await this.httpClient.request(config);
          this.updateRateLimitHeaders(response); // Update rate limit headers from the response
          resolve(response.data);
        } catch (err) {
          reject(err);
        }
      });

      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  /**
   * Updates rate limit headers from the API response.
   */
  private updateRateLimitHeaders(response: AxiosResponse): void {
    const remaining = response.headers['x-ratelimit-remaining'];
    const reset = response.headers['x-ratelimit-reset'];

    if (remaining !== undefined) {
      this.rateLimitRemaining = parseInt(remaining, 10);
    }

    if (reset !== undefined) {
      this.rateLimitReset = parseInt(reset, 10) * 1000; // Convert to milliseconds
    }

    // Adjust the delay dynamically based on remaining requests and reset time
    if (this.rateLimitRemaining !== null && this.rateLimitReset !== null) {
      const timeUntilReset = this.rateLimitReset - Date.now();
      if (timeUntilReset > 0) {
        this.rateLimitDelay = timeUntilReset / Math.max(this.rateLimitRemaining, 1); // Distribute remaining time
      }
    }
  }

  /**
   * Processes the request queue with a dynamic delay based on rate limit headers.
   */
  private async processQueue(): Promise<void> {
    if (this.requestQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    this.isProcessingQueue = true;
    const nextRequest = this.requestQueue.shift();

    if (nextRequest) {
      try {
        await nextRequest();
      } catch (err) {
        console.error('Request failed:', err);
      }

      // Add a dynamic delay before processing the next request
      await new Promise((resolve) => setTimeout(resolve, this.rateLimitDelay));
      this.processQueue();
    }
  }

  /**
   * Handles API requests with dynamic throttling and error handling.
   */
  async request(
    config: AxiosRequestConfig,
    errorSet?: Array<{ code?: string; status: number; message: string }>,
    ignoredErrors?: Array<string>,
  ): Promise<any> {
    const combinedErrorSet = [...this.defaultErrorSet, ...(errorSet || [])];

    try {
      // Enqueue the request and wait for it to be processed
      const response = await this.enqueueRequest(config);
      return response;
    } catch (err) {
      let error = err as AxiosError;
      if (error.response?.data) {
        let msg = error.response?.data as {
          errors: Array<{ code: string; status: string; detail: string }>;
        };
        throw new Error(msg.errors.map((err) => `${err.code}: ${err.detail}`).join('\n'));
      }
      let msg = combinedErrorSet.find((e) => e.status === error.response?.status);
      if (msg) {
        throw new Error(`${error.code}: ${msg.message}`);
      } else {
        if (error.response?.data) {
          let msg = error.response?.data as {
            errors: Array<{ code: string; status: string; detail: string }>;
          };
          if (ignoredErrors) {
            for (const ignoredError of ignoredErrors) {
              if (msg.errors.some((e) => e.status === ignoredError)) {
                return null;
              }
            }
          }
          throw new Error(msg.errors.map((err) => `${err.status}: ${err.detail}`).join('\n'));
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
