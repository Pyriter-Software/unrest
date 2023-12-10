import { Request } from './request';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { ResponseBuilder } from './response';

export interface Context {
  event: APIGatewayProxyEvent;
  request: Request;
  responseBuilder: ResponseBuilder;
}
