import {
  extractOrigin,
  extractPath,
  extractMethod,
  extractQueryStringParams,
  extractRouteInfo,
  extractBody,
  convertToObjectQueryStringParams,
  extractHeaders,
} from './utils';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { MethodType } from '../model';

describe('Utils', () => {
  describe('extractOrigin', () => {
    it('should extract origin from headers', () => {
      const event: APIGatewayProxyEvent = {
        headers: { origin: 'https://example.com' },
      } as any;

      const result = extractOrigin(event);
      expect(result).toBe('https://example.com');
    });

    it('should return undefined when origin is not present', () => {
      const event: APIGatewayProxyEvent = {
        headers: {},
      } as any;

      const result = extractOrigin(event);
      expect(result).toBeUndefined();
    });

    it('should return undefined when headers are not present', () => {
      const event: APIGatewayProxyEvent = {} as any;

      const result = extractOrigin(event);
      expect(result).toBeUndefined();
    });

    it('should return undefined when event is null', () => {
      const result = extractOrigin(null as any);
      expect(result).toBeUndefined();
    });
  });

  describe('extractPath', () => {
    it('should extract path from event', () => {
      const event: APIGatewayProxyEvent = {
        path: '/api/v1/users',
      } as any;

      const result = extractPath(event);
      expect(result).toBe('/api/v1/users');
    });

    it('should return default path when path is empty', () => {
      const event: APIGatewayProxyEvent = {
        path: '',
      } as any;

      const result = extractPath(event);
      expect(result).toBe('/');
    });

    it('should return default path when path is not present', () => {
      const event: APIGatewayProxyEvent = {} as any;

      const result = extractPath(event);
      expect(result).toBe('/');
    });

    it('should return default path when event is null', () => {
      const result = extractPath(null as any);
      expect(result).toBe('/');
    });
  });

  describe('extractMethod', () => {
    it('should extract method from event', () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'GET',
      } as any;

      const result = extractMethod(event);
      expect(result).toBe(MethodType.GET);
    });

    it('should convert method to uppercase', () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: 'post',
      } as any;

      const result = extractMethod(event);
      expect(result).toBe(MethodType.POST);
    });

    it('should throw error when httpMethod is not present', () => {
      const event: APIGatewayProxyEvent = {} as any;

      expect(() => extractMethod(event)).toThrow('httpMethod not defined');
    });

    it('should throw error when httpMethod is empty', () => {
      const event: APIGatewayProxyEvent = {
        httpMethod: '',
      } as any;

      expect(() => extractMethod(event)).toThrow('httpMethod not defined');
    });

    it('should throw error when event is null', () => {
      expect(() => extractMethod(null as any)).toThrow(
        'httpMethod not defined',
      );
    });
  });

  describe('extractQueryStringParams', () => {
    it('should extract query string parameters', () => {
      const event: APIGatewayProxyEvent = {
        queryStringParameters: {
          limit: '10',
          offset: '0',
          sortBy: 'name',
        },
      } as any;

      const result = extractQueryStringParams(event);
      expect(result).toEqual({
        limit: '10',
        offset: '0',
        sortBy: 'name',
      });
    });

    it('should return empty object when queryStringParameters is not present', () => {
      const event: APIGatewayProxyEvent = {} as any;

      const result = extractQueryStringParams(event);
      expect(result).toEqual({});
    });

    it('should return empty object when event is null', () => {
      const result = extractQueryStringParams(null as any);
      expect(result).toEqual({});
    });
  });

  describe('extractRouteInfo', () => {
    it('should split path into route segments', () => {
      const result = extractRouteInfo('/api/v1/users/123');
      expect(result).toEqual(['api', 'v1', 'users', '123']);
    });

    it('should handle path with trailing slash', () => {
      const result = extractRouteInfo('/api/v1/users/');
      expect(result).toEqual(['api', 'v1', 'users']);
    });

    it('should handle path with leading slash', () => {
      const result = extractRouteInfo('/api/v1/users');
      expect(result).toEqual(['api', 'v1', 'users']);
    });

    it('should handle empty path', () => {
      const result = extractRouteInfo('');
      expect(result).toEqual([]);
    });

    it('should handle path with only slash', () => {
      const result = extractRouteInfo('/');
      expect(result).toEqual([]);
    });

    it('should decode URI components', () => {
      const result = extractRouteInfo('/api/v1/users%20with%20spaces');
      expect(result).toEqual(['api', 'v1', 'users with spaces']);
    });

    it('should filter out empty segments', () => {
      const result = extractRouteInfo('/api//v1///users');
      expect(result).toEqual(['api', 'v1', 'users']);
    });
  });

  describe('extractBody', () => {
    it('should parse JSON body', () => {
      const event: APIGatewayProxyEvent = {
        body: '{"key": "value"}',
      } as any;

      const result = extractBody(event);
      expect(result).toEqual({ key: 'value' });
    });

    it('should return body as string when JSON parsing fails', () => {
      const event: APIGatewayProxyEvent = {
        body: 'invalid json',
      } as any;

      const result = extractBody(event);
      expect(result).toBe('invalid json');
    });

    it('should return null when body is not present', () => {
      const event: APIGatewayProxyEvent = {} as any;

      const result = extractBody(event);
      expect(result).toBeNull();
    });

    it('should return null when body is null', () => {
      const event: APIGatewayProxyEvent = {
        body: null,
      } as any;

      const result = extractBody(event);
      expect(result).toBeNull();
    });

    it('should return null when event is null', () => {
      const result = extractBody(null as any);
      expect(result).toBeNull();
    });

    it('should handle complex JSON objects', () => {
      const complexBody = {
        user: {
          id: 1,
          name: 'John Doe',
          roles: ['admin', 'user'],
        },
        metadata: {
          createdAt: '2023-01-01',
          version: '1.0.0',
        },
      };

      const event: APIGatewayProxyEvent = {
        body: JSON.stringify(complexBody),
      } as any;

      const result = extractBody(event);
      expect(result).toEqual(complexBody);
    });
  });

  describe('convertToObjectQueryStringParams', () => {
    it('should convert array of key-value pairs to object', () => {
      const input = [
        ['limit', '10'],
        ['offset', '0'],
        ['sortBy', 'name'],
      ];

      const result = convertToObjectQueryStringParams(input);
      expect(result).toEqual({
        limit: '10',
        offset: '0',
        sortBy: 'name',
      });
    });

    it('should handle empty array', () => {
      const result = convertToObjectQueryStringParams([]);
      expect(result).toEqual({});
    });

    it('should handle single key-value pair', () => {
      const input = [['key', 'value']];

      const result = convertToObjectQueryStringParams(input);
      expect(result).toEqual({ key: 'value' });
    });

    it('should handle undefined values', () => {
      const input = [
        ['key1', 'value1'],
        ['key2', undefined],
        ['key3', 'value3'],
      ];

      const result = convertToObjectQueryStringParams(input as string[][]);
      expect(result).toEqual({
        key1: 'value1',
        key2: undefined,
        key3: 'value3',
      });
    });
  });

  describe('extractHeaders', () => {
    it('should extract headers from event', () => {
      const event: APIGatewayProxyEvent = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer token',
        },
      } as any;

      const result = extractHeaders(event);
      expect(result).toEqual({
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      });
    });

    it('should return empty object when headers are not present', () => {
      const event: APIGatewayProxyEvent = {} as any;

      const result = extractHeaders(event);
      expect(result).toEqual({});
    });

    it('should return empty object when event is null', () => {
      const result = extractHeaders(null as any);
      expect(result).toEqual({});
    });

    it('should handle headers with various types', () => {
      const event: APIGatewayProxyEvent = {
        headers: {
          'string-header': 'value',
          'number-header': '123',
          'boolean-header': 'true',
        },
      } as any;

      const result = extractHeaders(event);
      expect(result).toEqual({
        'string-header': 'value',
        'number-header': '123',
        'boolean-header': 'true',
      });
    });
  });
});
