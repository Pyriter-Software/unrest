import { MethodType } from './methodType';
import { Response } from './response';

export type MethodStringLiteral = 'get' | 'GET';

export type RequestProps<T> = {
  route: Route;
  urlParams: UrlParams;
  queryStringParams: QueryStringParams;
  body: T;
};

export type QueryStringParams = {
  [key: string]: string | undefined;
};

export type UrlParams = {
  [key: string]: string;
};

export interface Route {
  argumentNames?: [];

  handler<T, K>(
    props: RequestProps<T> | RequestProps<any>,
  ): Promise<Response<K>>;

  method: MethodType | MethodStringLiteral;

  path: string;

  thisReference?: object;
}
