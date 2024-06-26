import { Route } from '../model/route';
import { RoutingTrie } from '../action/routingTrie';
import { MethodType } from '../model/methodType';
import { Request } from '../model/request';
import { Response } from '../model/response';

export interface Props {
  routingTable: Map<string, Route[]>;
  method: MethodType;
}

export class Handler {
  protected routingTrie: RoutingTrie;
  private readonly method: MethodType;

  public constructor(protected props: Props) {
    const { method } = props;
    this.method = method;
    this.routingTrie = new RoutingTrie(
      props.routingTable.get(this.method),
    );
  }

  canHandleMethod<T>(request: Request<T>): boolean {
    return request.method === this.method;
  }

  canHandleThenUpdateWithRequestPath<T>(request: Request<T>): boolean {
    return (
      this.canHandleMethod(request) &&
      this.hasRouteThenUpdateWithRequestPath(request)
    );
  }

  hasRouteThenUpdateWithRequestPath<T>(request: Request<T>): boolean {
    const { hasPath, requestPath } = this.routingTrie.has(request.path);
    if (hasPath) {
      request.requestPath = requestPath;
    }
    return hasPath;
  }

  async handle<T, K>(request: Request<T>): Promise<Response<K>> {
    const {
      requestPath,
      body: requestBody,
      headers,
      apiGatewayEvent,
      path,
      method,
    } = request;
    if (!requestPath) {
      throw new Error('Unable to determine route from path');
    }

    const { route, urlParams, queryStringParams } = requestPath;

    const response = await route.handler.call(route.thisReference, {
      route,
      urlParams,
      queryStringParams,
      body: requestBody,
      headers,
      apiGatewayEvent,
      path,
      method,
    });

    const statusCode = response.statusCode;
    const body = response.body as K;

    return Response.builder<K>()
      .withStatusCode(statusCode)
      .withBody(body)
      .build() as any;
  }
}
