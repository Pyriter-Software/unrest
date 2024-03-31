import { Request } from './request';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { ResponseBuilder } from './response';

export interface Context<T> {
  event: APIGatewayProxyEvent;
  request: Request<T>;
  responseBuilder: ResponseBuilder<any>;
}
