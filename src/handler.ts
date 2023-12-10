import { Response } from './response';
import { RequestPath, Route } from './route';
import { Request } from './request';
import { RoutingTrie } from './routingTrie';
import { MethodType } from './methodType';

export interface Props {
  routingTable: Map<string, Route[]>;
}

export abstract class Handler {
  protected routingTrie: RoutingTrie;

  public constructor(protected props: Props) {
    this.routingTrie = new RoutingTrie(props.routingTable.get(this.getMethod()));
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

  getRoute(request: Request): RequestPath {
    return this.routingTrie.get(request.path);
  }

  async handle(request: Request): Promise<Response> {
    const { route } = this.getRoute(request);

    const response: Response = await route.handler.apply(route.thisReference, request.arguments);

    const statusCode = response.statusCode;
    const body = response.body;

    return Response.builder()
      .withStatusCode(statusCode)
      .withBody(body)
      .build();
  }
}
