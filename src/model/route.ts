import { MethodType } from './methodType';
import { Response } from './response';
import { Request } from './request';

export type MethodStringLiteral = 'get' | 'GET';

export interface Route {
  method: MethodType | MethodStringLiteral;
  path: string;
  thisReference?: object;

  handler<T>(
    request: Request<T | undefined | null | string>,
    route: Route,
    params: string[],
  ): Promise<Response>;

  argumentNames?: [];
}
