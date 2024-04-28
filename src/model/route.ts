import { MethodType } from './methodType';
import { Response } from './response';
import { Request } from './request';

export type MethodStringLiteral = 'get' | 'GET';

export type RequestProps<T> = {
  request: Request<T | any>;
  route: Route;
  params: string[][];
  queryStringParams: QueryStringParams;
};

export type QueryStringParams = {
  [key: string]: string;
};

export interface Route {
  argumentNames?: [];

  handler<T, K>(props: RequestProps<T>): Promise<Response<K>>;

  method: MethodType | MethodStringLiteral;

  path: string;

  thisReference?: object;
}
