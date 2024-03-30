import { MethodType } from './methodType';
import { Response } from './response';
import { Request } from './request';

export type MethodStringLiteral = 'get' | 'GET';

export type RequestProps<T> = {
  request: Request<
    T | string | object | number | unknown | undefined | null
  >;
  route: Route;
  params: string[];
};

export interface Route {
  argumentNames?: [];

  handler<T extends object>(props: RequestProps<T>): Promise<Response>;

  method: MethodType | MethodStringLiteral;

  path: string;

  thisReference?: object;
}
