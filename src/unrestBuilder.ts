import Unrest from './unrest';
import { Route } from './route';

export class UnrestBuilder {

  private routes: Route[] = [];

  withRoute(route: Route) {
    this.routes.push(route);
    return this;
  }

  build() {
    return new Unrest({
      routes: this.routes,
    });
  }
}

