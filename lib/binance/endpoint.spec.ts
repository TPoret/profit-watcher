import { RequestLimiter } from "./endpoint";

describe("Request limiter", () => {
  it("don't limit when initialized", () => {
    const rql = new RequestLimiter();

    expect(rql.canMakeRequest()).toBeTruthy();
  });
  it("limit when receives a 429 and Retry-After", () => {
    const rql = new RequestLimiter();

    rql.handleRequest(429, { "Retry-After": 1200 });

    expect(rql.canMakeRequest()).toBeFalsy();
  });
  it("limit when receives a 418 and Retry-After", () => {
    const rql = new RequestLimiter();

    rql.handleRequest(418, { "Retry-After": 1200 });

    expect(rql.canMakeRequest()).toBeFalsy();
  });
  it("doesn't limit when limit date is passed", () => {
    const rql = new RequestLimiter();

    const seconds = 1200 * 1000;
    rql.blockedUntil = Date.now() - seconds;

    expect(rql.canMakeRequest()).toBeTruthy();
  });
});
