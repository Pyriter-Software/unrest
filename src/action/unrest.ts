import { APIGatewayProxyEvent } from 'aws-lambda';
import { Route } from '../model/route';
import { Header } from '../model/header';
import { Context } from '../model/context';
import {
  extractBody,
  extractHeaders,
  extractMethod,
  extractOrigin,
  extractPath,
  extractQueryStringParams,
} from '../utils/utils';
import { Response } from '../model/response';
import { Request } from '../model/request';
import { UnrestResponse } from '../model/unrestResponse';
import { Handler } from '../handler';
import { MethodType } from '../model';

export interface UnrestProps {
  routes: Route[];
  headers: Header[];
}

export class Unrest {
  static builder(): UnrestBuilder {
    return new UnrestBuilder();
  }

  private readonly handlers: Handler[];
  private readonly routingTable = new Map<string, Route[]>();
  private readonly headers: Header[] = [];

  constructor(props: UnrestProps) {
    this.buildRoutingTable(props.routes);
    this.handlers = Object.values(MethodType).map((method) => {
      return new Handler({
        method,
        routingTable: this.routingTable,
      });
    });
    this.headers = this.headers.concat(props.headers);
  }

  async execute<T>(event: APIGatewayProxyEvent): Promise<UnrestResponse> {
    const context: Context<T> = {
      event,
      request: this.convertToRequest<T>(event),
      responseBuilder: Response.builder(),
    };

    this.updateResponseHeader(context);
    await this.callHandler(context);

    return context.responseBuilder.build().toJSON();
  }

  private buildRoutingTable(routes: Route[]) {
    routes.forEach((route) => {
      const routings = this.routingTable.get(route.method) || [];
      routings.push(route);
      this.routingTable.set(route.method, routings);
    });
  }

  private convertToRequest<T>(event: APIGatewayProxyEvent): Request<T> {
    const origin = extractOrigin(event);
    const path = extractPath(event);
    const body = extractBody<T>(event);
    const method = extractMethod(event);
    const queryStringParams = extractQueryStringParams(event);
    const headers = extractHeaders(event);

    return {
      origin,
      method,
      path,
      body,
      queryStringParams,
      urlParams: {},
      headers,
      apiGatewayEvent: event,
    };
  }

  private updateResponseHeader<T>(context: Context<T>) {
    const { responseBuilder } = context;
    this.headers.forEach((header) => {
      const { key, value } = header;
      responseBuilder.withHeader(key, value);
    });
  }

  private async callHandler<T>(context: Context<T>): Promise<void> {
    const { responseBuilder, request } = context;
    try {
      const handler = this.handlers.find((h) =>
        h.canHandleThenUpdateWithRequestPath(request),
      );
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
    if (header != null) {
      this.headers.push(header);
    } else {
      throw new Error('header number be defined');
    }
    return this;
  }

  withHeaderIfDefinedOrDoNothing(header: Header | undefined | null) {
    if (header != null) {
      this.headers.push(header);
    }
    return this;
  }

  build() {
    return new Unrest({
      routes: this.routes,
      headers: this.headers,
    });
  }
}
