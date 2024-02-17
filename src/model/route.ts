import { MethodType } from './methodType';
import { Response } from './response';
import { Request } from './request';

export type MethodStringLiteral = 'get' | 'GET';

export interface Route {
  argumentNames?: [];

  handler<T extends object>(
    request: Request<
      T | string | object | number | unknown | undefined | null
    >,
    route: Route,
    params: string[],
  ): Promise<Response>;

  method: MethodType | MethodStringLiteral;

  path: string;

  thisReference?: object;
}
