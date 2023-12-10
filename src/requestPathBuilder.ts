import { RequestPath, Route } from './route';

export class RequestPathBuilder {
  private path: string;
  private route: Route;
  private params: string[] = [];

  withPath(path: string) {
    this.path = path;
    return this;
  }

  withRoute(route: Route) {
    this.route = route;
    return this;
  }

  withParam(param: string) {
    this.params.push(param);
    return this;
  }

  build() {
    if (this.path == null) {
      throw new Error('Path is required');
    }
    if (this.route == null) {
      throw new Error('Route is required');
    }
    return new RequestPath(this.path, this.route, this.params);
  }
}
