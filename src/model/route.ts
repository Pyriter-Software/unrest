import { MethodType } from './methodType';
import { Response } from './response';
import { Headers } from './request';
import { APIGatewayEvent } from 'aws-lambda';

export type MethodStringLiteral = 'get' | 'GET';

export type RequestProps<T> = {
  route: Route;
  urlParams: UrlParams;
  queryStringParams: QueryStringParams;
  body: T;
  headers: Headers;
  apiGatewayEvent: APIGatewayEvent;
  path: string;
  method: MethodType;
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
