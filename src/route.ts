import { Response } from './response';
import { MethodType } from './methodType';

export type MethodStringLiteral = 'get' | 'GET';

export interface Route {
  method: MethodType | MethodStringLiteral;
  path: string;
  thisReference?: object;
  handler: () => Promise<Response>;
  argumentNames?: [];
}
