import hashMACSHA256 from "crypto-js/hmac-sha256";
import axios, { AxiosRequestConfig } from "axios";
import http from "http";
import https from "https";
import qs from "qs";

export class RequestLimiter {
  // Date until when we can send request
  blockedUntil: null | number = null;

  /**
   * Set limit timer according to the Retry-After time limit
   * @param statusCode the response status code
   * @param headers the response header
   */
  handleRequest(
    statusCode: number,
    headers: object | Map<string, string>
  ): void {
    if (statusCode === 429 && headers["Retry-After"]) {
      const secondsToWait = parseInt(headers["Retry-After"]);
      // Temporarily limited
      this.blockedUntil = Date.now() + secondsToWait * 1000;
    } else if (statusCode === 418 && headers["Retry-After"]) {
      const secondsToWait = parseInt(headers["Retry-After"]);
      // IP banned until
      this.blockedUntil = Date.now() + secondsToWait * 1000;
    }
  }

  /**
   * Tell if we can make a new request
   * Prevent getting banned from the API
   */
  canMakeRequest(): boolean {
    return (
      this.blockedUntil == null ||
      (this.blockedUntil && this.blockedUntil < Date.now())
    );
  }
}

export enum EndpointSecurity {
  NONE,
  TRADE,
  MARGIN,
  USER_DATA,
  USER_STREAM,
  MARKET_DATA,
}

export const endpoint = axios.create({
  baseURL: "https://api.binance.com",
  timeout: 2000,
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
});

const requestLimiter = new RequestLimiter();

// Add a response interceptor
endpoint.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    if (!error.response) return Promise.reject(error);

    requestLimiter.handleRequest(error.response.status, error.response.headers);

    return Promise.reject(error);
  }
);

// Add a request interceptor
endpoint.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    if (!requestLimiter.canMakeRequest()) {
      throw new Error(
        "Cancelling request to prevent further API limit usage violation"
      );
    }
    return prepareRequest(config);
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

let apiKey: string = "";
export const setApiKey = (apiKeyValue: string): void => {
  apiKey = apiKeyValue;
};

let secretKey: string = "";
export const setSecretKey = (secretKeyValue: string): void => {
  secretKey = secretKeyValue;
};

const getSignature = (wholePayload: string): string =>
  hashMACSHA256(wholePayload, secretKey);

const addSignature = (config: AxiosRequestConfig): AxiosRequestConfig => {
  return {
    ...config,
    params: {
      ...config.params,
      // No need to stringify 'data' as it is already stringified
      signature: getSignature(qs.stringify(config.params) + config.data),
    },
  };
};

const addApiKey = (config: AxiosRequestConfig): AxiosRequestConfig => {
  return {
    ...config,
    headers: {
      ...config.headers,
      "X-MBX-APIKEY": apiKey,
    },
  };
};

const dataToQueryString = (config: AxiosRequestConfig): AxiosRequestConfig => {
  return {
    ...config,
    data: qs.stringify(config.data),
  };
};

const prepareRequestActions: Map<
  EndpointSecurity,
  (config: AxiosRequestConfig) => AxiosRequestConfig
> = new Map([
  [EndpointSecurity.NONE, (conf) => dataToQueryString(conf)],
  [
    EndpointSecurity.TRADE,
    (conf) => addSignature(addApiKey(dataToQueryString(conf))),
  ],
  [
    EndpointSecurity.MARGIN,
    (conf) => addSignature(addApiKey(dataToQueryString(conf))),
  ],
  [
    EndpointSecurity.USER_DATA,
    (conf) => addSignature(addApiKey(dataToQueryString(conf))),
  ],
  [EndpointSecurity.USER_STREAM, (conf) => addApiKey(dataToQueryString(conf))],
  [EndpointSecurity.MARKET_DATA, (conf) => addApiKey(dataToQueryString(conf))],
]);

export const markSecurity = (
  security: EndpointSecurity
): AxiosRequestConfig => {
  return {
    ...endpoint.defaults,
    headers: {
      ...endpoint.defaults.headers,
      endpointSecurity: security,
    },
  };
};

/**
 * Return a request that has all data to ensure it passes
 * For example: add signature when needed
 * @param config the config coming from the request
 */
const prepareRequest = (config: AxiosRequestConfig): AxiosRequestConfig => {
  const security: EndpointSecurity = config.headers.endpointSecurity;
  return prepareRequestActions[security](config);
};
