import { APIGatewayProxyEvent } from 'aws-lambda';
import { MethodType, QueryStringParams } from '../model';
import { APIGatewayProxyEventQueryStringParameters } from 'aws-lambda/trigger/api-gateway-proxy';

export function extractOrigin(
  event: APIGatewayProxyEvent,
): string | undefined {
  return event && event.headers && event.headers.origin
    ? event.headers.origin
    : undefined;
}

export function extractPath(event: APIGatewayProxyEvent): string {
  return event && event.path && event.path.length > 0 ? event.path : '/';
}

export function extractMethod(event: APIGatewayProxyEvent): MethodType {
  if (event && event.httpMethod && event.httpMethod.length > 0) {
    return event.httpMethod.toUpperCase() as MethodType;
  } else {
    throw new TypeError(`httpMethod not defined`);
  }
}

export function extractQueryStringParams(
  event: APIGatewayProxyEvent,
): APIGatewayProxyEventQueryStringParameters {
  return event && event.queryStringParameters
    ? event.queryStringParameters
    : {};
}

export function extractRouteInfo(path: string): string[] {
  return path
    .split('/')
    .filter((v) => v.length > 0)
    .map(decodeURI);
}

export function extractBody<T>(
  event: APIGatewayProxyEvent,
): T | string | null {
  try {
    return event && event.body ? JSON.parse(event.body) : null;
  } catch (e) {
    return event && event.body ? event.body : null;
  }
}

export function convertToObjectQueryStringParams(
  listQueryStringParams: string[][],
): QueryStringParams {
  const queryStringParams: QueryStringParams = {};
  listQueryStringParams.forEach(([key, value]) => {
    queryStringParams[key] = value;
  });
  return queryStringParams;
}
