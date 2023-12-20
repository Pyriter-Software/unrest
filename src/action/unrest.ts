import { APIGatewayProxyEvent } from 'aws-lambda';
import { Route } from '../model/route';
import { Header } from '../model/header';
import { Context } from 'vm';
import { extractBody, extractOrigin, extractPath } from '../utils/utils';
import { MethodType } from '../model/methodType';
import { Response } from '../model/response';
import { Request } from '../model/request';
import { UnrestResponse } from '../model/unrestResponse';
import { GetHandler } from '../handler/typeHandler/getHandler';
import { Handler } from '../handler';
import { PostHandler } from '../handler/typeHandler/postHandler';
import { PutHandler } from '../handler/typeHandler/putHandler';

export interface UnrestProps {
  routes: Route[];
  headers: Header[];
}

export class Unrest {
  static builder(): UnrestBuilder {
    return new UnrestBuilder();
  }

  private readonly getHandler: GetHandler;
  private readonly postHandler: PostHandler;
  private readonly putHandler: PutHandler;

  private readonly handlers: Handler[];
  private readonly routingTable = new Map<string, Route[]>();
  private readonly headers: Header[] = [];

  constructor(props: UnrestProps) {
    this.buildRoutingTable(props.routes);
    this.getHandler = new GetHandler({
      routingTable: this.routingTable,
    });
    this.postHandler = new PostHandler({
      routingTable: this.routingTable,
    });
    this.putHandler = new PutHandler({
      routingTable: this.routingTable,
    });

    this.handlers = [this.getHandler, this.postHandler, this.putHandler];
    this.headers = this.headers.concat(props.headers);
  }

  async execute(event: APIGatewayProxyEvent): Promise<UnrestResponse> {
    const context: Context = {
      event,
      request: this.convertToRequest(event),
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
