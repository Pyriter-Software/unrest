import { MethodType } from './methodType';

export interface Request {
  origin?: string;
  method: MethodType;
  path: string;
  arguments: string[];
  body: object | string | undefined;
}
