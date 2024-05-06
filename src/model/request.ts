import { MethodType } from './methodType';

export interface Request<T> {
  origin?: string;
  method: MethodType;
  path: string;
  arguments: string[];
  body: T | string | null;
  queryStringParams;
}
