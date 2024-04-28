import { RequestPath } from './requestPath';
import { Route } from '../model/route';
import { RoutingTrie } from '../action/routingTrie';
import { MethodType } from '../model/methodType';
import { Request } from '../model/request';
import { Response } from '../model/response';
import { convertToObjectQueryStringParams } from '../utils';

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

  canHandle<T>(request: Request<T>): boolean {
    return this.canHandleMethod(request) && this.hasRoute(request);
  }

  hasRoute<T>(request: Request<T>): boolean {
    return this.routingTrie.has(request.path);
  }

  getRequestPath<T>(request: Request<T>): RequestPath | null | undefined {
    return this.routingTrie.get(request.path);
  }

  async handle<T, K>(request: Request<T>): Promise<Response<K>> {
    const requestPath = this.getRequestPath(request);
    if (!requestPath) {
      throw new Error('Unable to determine route from path');
    }

    const { route, params, queryStringParams } = requestPath;
    const convertedQueryStringParams =
      convertToObjectQueryStringParams(queryStringParams);

    const response = await route.handler.call(route.thisReference, {
      request,
      route,
      params,
      queryStringParams: convertedQueryStringParams,
    });

    const statusCode = response.statusCode;
    const body = response.body as K;

    return Response.builder<K>()
      .withStatusCode(statusCode)
      .withBody(body)
      .build() as any;
  }
}
