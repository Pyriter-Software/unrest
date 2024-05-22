import { MethodType } from './methodType';
import { QueryStringParams, UrlParams } from './route';

export interface Request<T> {
  origin?: string;
  method: MethodType;
  path: string;
  urlParams: UrlParams;
  body: T | string | null | undefined;
  queryStringParams: QueryStringParams;
}
