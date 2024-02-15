import { MethodType } from './methodType';
import { Response } from './response';

export type MethodStringLiteral = 'get' | 'GET';

export interface Route {
  method: MethodType | MethodStringLiteral;
  path: string;
  thisReference?: object;
  handler: (request: Request) => Promise<Response>;
  argumentNames?: [];
}
