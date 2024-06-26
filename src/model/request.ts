import { MethodType } from './methodType';
import { QueryStringParams, UrlParams } from './route';
import { RequestPath } from '../handler';
import { APIGatewayEvent } from 'aws-lambda';

export interface Request<T> {
  origin?: string;
  method: MethodType;
  path: string;
  urlParams: UrlParams;
  body?: T | string | null | undefined;
  queryStringParams: QueryStringParams;
  requestPath?: RequestPath | null | undefined;
  headers: Headers;
  apiGatewayEvent: APIGatewayEvent;
}

export type Headers = { [key: string]: string };
