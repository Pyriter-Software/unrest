import { APIGatewayProxyEvent } from 'aws-lambda';
import { Route } from './route';
import { Handler } from './handler';
import { MethodType } from './methodType';
import { Response } from './response';
import { Request } from './request';
import { GetHandler } from './getHandler';
import { extractBody, extractOrigin, extractPath } from './utils';
import { Context } from './context';
import { Header } from './header';

export interface Props {
  routes: Route[];
  headers: Header[];
}

export class Unrest {
  static builder(): UnrestBuilder {
    return new UnrestBuilder();
  }

  private readonly getHandler: GetHandler;
  private readonly handlers: Handler[];
  private readonly routingTable = new Map<string, Route[]>();
  private readonly headers: Header[] = [];

  constructor(props: Props) {
    this.buildRoutingTable(props.routes);
    this.getHandler = new GetHandler({
      routingTable: this.routingTable,
    });
    this.handlers = [this.getHandler];
    this.headers = this.headers.concat(props.headers);
  }

  async execute(event: APIGatewayProxyEvent): Promise<Response> {
    const context: Context = {
      event,
      request: this.convertToRequest(event),
      responseBuilder: Response.builder(),
    };

    this.updateResponseHeader(context);
    await this.callHandler(context);

    return context.responseBuilder.build();
  }

  private buildRoutingTable(routes: Route[]) {
    routes.forEach((route) => {
      const routings = this.routingTable.get(route.method) || [];
      routings.push(route);
      this.routingTable.set(route.method, routings);
    });
  }

  private convertToRequest(event: APIGatewayProxyEvent): Request {
    const origin = extractOrigin(event);
    const path = extractPath(event);
    const body = extractBody(event);

    return {
      origin,
      method: MethodType.GET,
      path,
      arguments: [],
      body,
    };
  }

  private updateResponseHeader(context: Context) {
    const { responseBuilder } = context;
    this.headers.forEach((header) => {
      const { key, value } = header;
      responseBuilder.withHeader(key, value);
    });
  }

  private async callHandler(context: Context): Promise<void> {
    const { responseBuilder, request } = context;
    try {
      const handler = this.handlers.find((h) => h.canHandle(request));
      if (handler) {
        const { statusCode, body } = await handler.handle(request);
        responseBuilder.withStatusCode(statusCode).withBody(body);
      } else {
        const message = JSON.stringify({
          message: 'Not found',
        });
        responseBuilder.withStatusCode(404).withBody(message);
      }
    } catch (e: any) {
      const message = JSON.stringify({
        message: e.message,
        stack: e.stack,
      });
      responseBuilder.withStatusCode(500).withBody(message);
    }
  }
}

class UnrestBuilder {
  private routes: Route[] = [];
  private headers: Header[] = [];

  withRoute(route: Route) {
    this.routes.push(route);
    return this;
  }

  withHeader(header: Header) {
    this.headers.push(header);
    return this;
  }

  build() {
    return new Unrest({
      routes: this.routes,
      headers: this.headers,
    });
  }
}
