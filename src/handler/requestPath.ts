import { Route } from '../model/route';

export class RequestPath {
  constructor(
    public path: string,
    public route: Route,
    public params: string[][],
    public queryStringParams: string[][],
  ) {}

  static builder() {
    return new RequestPathBuilder();
  }
}

class RequestPathBuilder {
  private path?: string;
  private route?: Route;
  private params: string[][] = [];
  private queryStringParams: string[][] = [];

  withPath(path: string) {
    this.path = path;
    return this;
  }

  withRoute(route: Route) {
    this.route = route;
    return this;
  }

  withParam(key: string, value: string) {
    this.params.push([key, value]);
    return this;
  }

  withQueryString(queryString: string) {
    if (!queryString) return this;
    const tokens = queryString.split('&');
    for (const token of tokens) {
      const [key, value] = token.split('=');
      this.queryStringParams.push([key, value]);
    }
    return this;
  }

  build() {
    if (this.path == null) {
      throw new Error('Path is required');
    }
    if (this.route == null) {
      throw new Error('Route is required');
    }
    return new RequestPath(
      this.path,
      this.route,
      this.params,
      this.queryStringParams,
    );
  }
}
