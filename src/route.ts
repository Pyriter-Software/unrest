import { Response } from './response';
import { MethodType } from './methodType';
import { RequestPathBuilder } from './requestPathBuilder';

export type MethodStringLiteral = 'get' | 'GET';

export interface Route {
  method: MethodType | MethodStringLiteral;
  path: string;
  thisReference?: object;
  handler: () => Promise<Response>;
  argumentNames?: [];
}

export class RequestPath {
  constructor(public path: string, public route: Route, public params: string[]) {
  }

  static builder() {
    return new RequestPathBuilder();
  }
}

