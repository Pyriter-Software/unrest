import { Response } from './response';
import { Request } from './request';
import { RoutingTrie } from './routingTrie';
import { MethodType } from './methodType';
import { Route } from './route';
import { RequestPath } from './requestPath';

export interface Props {
  routingTable: Map<string, Route[]>;
}

export abstract class Handler {
  protected routingTrie: RoutingTrie;

  public constructor(protected props: Props) {
    this.routingTrie = new RoutingTrie(
      props.routingTable.get(this.getMethod()),
    );
  }

  abstract getMethod(): MethodType;

  canHandleMethod(request: Request): boolean {
    return request.method === this.getMethod();
  }

  canHandle(request: Request): boolean {
    return this.canHandleMethod(request) && this.hasRoute(request);
  }

  hasRoute(request: Request): boolean {
    return this.routingTrie.has(request.path);
  }

  getRequestPath(request: Request): RequestPath | null | undefined {
    return this.routingTrie.get(request.path);
  }

  async handle(request: Request): Promise<Response> {
    const requestPath = this.getRequestPath(request);
    if (!requestPath) {
      throw new Error('Unable to determine route from path');
    }

    const { route, params } = requestPath;

    const response: Response = await route.handler.apply(
      route.thisReference,
      // @ts-ignore
      params,
    );

    const statusCode = response.statusCode;
    const body = response.body;

    return Response.builder()
      .withStatusCode(statusCode)
      .withBody(body)
      .build();
  }
}
