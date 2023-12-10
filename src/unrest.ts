import { APIGatewayProxyEvent } from 'aws-lambda';
import { UnrestBuilder } from './unrestBuilder';
import { Route } from './route';
import { Handler } from './handler';
import { MethodType } from './methodType';
import { Response } from './response';
import { Request } from './request';
import { GetHandler } from './getHandler';
import { extractBody, extractOrigin, extractPath } from './utils';

export const ACCESS_CONTROL_ALLOW_ORIGIN = 'Access-Control-Allow-Origin';
const allowedOrigins = new Set(['https://beta.rezuned.com', 'https://rezuned.com', 'http://localhost:3000']);

export interface Props {
  routes: Route[];
}

export default class Unrest {
  static builder() {
    return new UnrestBuilder();
  }

  private readonly getHandler: GetHandler;
  private readonly handlers: Handler[];
  private readonly routingTable = new Map<string, Route[]>();

  constructor(props: Props) {
    this.buildRoutingTable(props.routes);
    this.getHandler = new GetHandler({
      routingTable: this.routingTable,
    });
    this.handlers = [this.getHandler];
  }

  private buildRoutingTable(routes: Route[]) {
    routes.forEach((route) => {
      const routings = this.routingTable.get(route.method) || [];
      routings.push(route);
      this.routingTable.set(route.method, routings);
    });
  }

  convertToRequest(event: APIGatewayProxyEvent): Request {
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

  async execute(event: APIGatewayProxyEvent): Promise<Response> {
    const responseBuilder = Response.builder();
    const request: Request = this.convertToRequest(event);
    const { origin } = request;
    const accessControllAllowOrigin = this.generateAccessControlAllowOrigin(origin);
    if (accessControllAllowOrigin) {
      responseBuilder.withHeader(ACCESS_CONTROL_ALLOW_ORIGIN, accessControllAllowOrigin);
    }

    try {
      const handler = this.handlers.find((h) => h.canHandle(request));
      if (handler) {
        const handlerResponse = await handler.handle(request);
        if (accessControllAllowOrigin) {
          handlerResponse.withHeader(ACCESS_CONTROL_ALLOW_ORIGIN, accessControllAllowOrigin);
        }
        return handlerResponse;
      } else {
        return responseBuilder.withStatusCode(404).build();
      }
    } catch (e) {
      return responseBuilder.withStatusCode(500).build();
    }
  }

  private generateAccessControlAllowOrigin(origin: string | undefined): string | undefined {
    return origin && allowedOrigins.has(origin) ? origin : undefined;
  }
}
