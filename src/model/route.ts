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

  handler<T, K>(
    props: RequestProps<T>,
  ): Promise<Response<K | undefined | string>>;

  method: MethodType | MethodStringLiteral;

  path: string;

  thisReference?: object;
}
