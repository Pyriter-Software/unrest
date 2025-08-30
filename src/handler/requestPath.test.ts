import { RequestPath } from './requestPath';
import { Route, QueryStringParams, UrlParams } from '../model/route';
import { MethodType } from '../model/methodType';

describe('RequestPath', () => {
  const mockRoute: Route = {
    method: MethodType.GET,
    path: '/api/v1/users/{userId}',
    handler: jest.fn(),
  };

  describe('RequestPath class', () => {
    it('should create RequestPath with correct properties', () => {
      const urlParams: UrlParams = { userId: '123' };
      const queryStringParams: QueryStringParams = {
        limit: '10',
        offset: '0',
      };

      const requestPath = new RequestPath(
        '/api/v1/users/123',
        mockRoute,
        urlParams,
        queryStringParams,
      );

      expect(requestPath.path).toBe('/api/v1/users/123');
      expect(requestPath.route).toBe(mockRoute);
      expect(requestPath.urlParams).toEqual(urlParams);
      expect(requestPath.queryStringParams).toEqual(queryStringParams);
    });

    it('should provide static builder method', () => {
      const builder = RequestPath.builder();
      expect(builder).toBeDefined();
      expect(typeof builder.withPath).toBe('function');
      expect(typeof builder.withRoute).toBe('function');
      expect(typeof builder.build).toBe('function');
    });
  });

  describe('RequestPathBuilder', () => {
    let builder: any;

    beforeEach(() => {
      builder = RequestPath.builder();
    });

    it('should build RequestPath with all properties', () => {
      const urlParams: UrlParams = { userId: '123' };
      const queryStringParams: QueryStringParams = { limit: '10' };

      const requestPath = builder
        .withPath('/api/v1/users/123')
        .withRoute(mockRoute)
        .withParam('userId', '123')
        .withQueryString('limit=10')
        .build();

      expect(requestPath.path).toBe('/api/v1/users/123');
      expect(requestPath.route).toBe(mockRoute);
      expect(requestPath.urlParams).toEqual(urlParams);
      expect(requestPath.queryStringParams).toEqual(queryStringParams);
    });

    it('should build RequestPath with minimal properties', () => {
      const requestPath = builder
        .withPath('/api/v1/users')
        .withRoute(mockRoute)
        .build();

      expect(requestPath.path).toBe('/api/v1/users');
      expect(requestPath.route).toBe(mockRoute);
      expect(requestPath.urlParams).toEqual({});
      expect(requestPath.queryStringParams).toEqual({});
    });

    it('should add single parameter', () => {
      const requestPath = builder
        .withPath('/api/v1/users/123')
        .withRoute(mockRoute)
        .withParam('userId', '123')
        .build();

      expect(requestPath.urlParams).toEqual({ userId: '123' });
    });

    it('should add multiple parameters', () => {
      const requestPath = builder
        .withPath('/api/v1/users/123/orders/456')
        .withRoute(mockRoute)
        .withParam('userId', '123')
        .withParam('orderId', '456')
        .build();

      expect(requestPath.urlParams).toEqual({
        userId: '123',
        orderId: '456',
      });
    });

    it('should handle empty query string', () => {
      const requestPath = builder
        .withPath('/api/v1/users')
        .withRoute(mockRoute)
        .withQueryString('')
        .build();

      expect(requestPath.queryStringParams).toEqual({});
    });

    it('should handle undefined query string', () => {
      const requestPath = builder
        .withPath('/api/v1/users')
        .withRoute(mockRoute)
        .withQueryString(undefined as any)
        .build();

      expect(requestPath.queryStringParams).toEqual({});
    });

    it('should parse single query parameter', () => {
      const requestPath = builder
        .withPath('/api/v1/users')
        .withRoute(mockRoute)
        .withQueryString('limit=10')
        .build();

      expect(requestPath.queryStringParams).toEqual({ limit: '10' });
    });

    it('should parse multiple query parameters', () => {
      const requestPath = builder
        .withPath('/api/v1/users')
        .withRoute(mockRoute)
        .withQueryString('limit=10&offset=0&sortBy=name')
        .build();

      expect(requestPath.queryStringParams).toEqual({
        limit: '10',
        offset: '0',
        sortBy: 'name',
      });
    });

    it('should handle query parameter without value', () => {
      const requestPath = builder
        .withPath('/api/v1/users')
        .withRoute(mockRoute)
        .withQueryString('limit=10&active&sortBy=name')
        .build();

      expect(requestPath.queryStringParams).toEqual({
        limit: '10',
        active: undefined,
        sortBy: 'name',
      });
    });

    it('should handle query parameter with empty value', () => {
      const requestPath = builder
        .withPath('/api/v1/users')
        .withRoute(mockRoute)
        .withQueryString('limit=10&empty=&sortBy=name')
        .build();

      expect(requestPath.queryStringParams).toEqual({
        limit: '10',
        empty: '',
        sortBy: 'name',
      });
    });

    it('should handle malformed query string', () => {
      const requestPath = builder
        .withPath('/api/v1/users')
        .withRoute(mockRoute)
        .withQueryString('limit=10&malformed&sortBy=name')
        .build();

      expect(requestPath.queryStringParams).toEqual({
        limit: '10',
        malformed: undefined,
        sortBy: 'name',
      });
    });

    it('should chain builder methods correctly', () => {
      const requestPath = builder
        .withPath('/api/v1/users/123')
        .withRoute(mockRoute)
        .withParam('userId', '123')
        .withQueryString('limit=10&offset=0')
        .build();

      expect(requestPath.path).toBe('/api/v1/users/123');
      expect(requestPath.route).toBe(mockRoute);
      expect(requestPath.urlParams).toEqual({ userId: '123' });
      expect(requestPath.queryStringParams).toEqual({
        limit: '10',
        offset: '0',
      });
    });

    it('should throw error when path is not defined', () => {
      expect(() => {
        builder.withRoute(mockRoute).build();
      }).toThrow('Path is required');
    });

    it('should throw error when route is not defined', () => {
      expect(() => {
        builder.withPath('/api/v1/users').build();
      }).toThrow('Route is required');
    });

    it('should handle special characters in query string', () => {
      const requestPath = builder
        .withPath('/api/v1/users')
        .withRoute(mockRoute)
        .withQueryString('search=john%20doe&filter=active%20users')
        .build();

      expect(requestPath.queryStringParams).toEqual({
        search: 'john%20doe',
        filter: 'active%20users',
      });
    });

    it('should handle complex query string with various separators', () => {
      const requestPath = builder
        .withPath('/api/v1/users')
        .withRoute(mockRoute)
        .withQueryString(
          'limit=10&offset=0&sortBy=name&order=desc&filter=active&include=profile,orders',
        )
        .build();

      expect(requestPath.queryStringParams).toEqual({
        limit: '10',
        offset: '0',
        sortBy: 'name',
        order: 'desc',
        filter: 'active',
        include: 'profile,orders',
      });
    });

    it('should override parameters when same key is used multiple times', () => {
      const requestPath = builder
        .withPath('/api/v1/users')
        .withRoute(mockRoute)
        .withParam('userId', '123')
        .withParam('userId', '456')
        .build();

      expect(requestPath.urlParams).toEqual({ userId: '456' });
    });

    it('should handle very long query strings', () => {
      const longQueryString = Array.from(
        { length: 100 },
        (_, i) => `param${i}=value${i}`,
      ).join('&');

      const requestPath = builder
        .withPath('/api/v1/users')
        .withRoute(mockRoute)
        .withQueryString(longQueryString)
        .build();

      expect(Object.keys(requestPath.queryStringParams)).toHaveLength(100);
      expect(requestPath.queryStringParams.param0).toBe('value0');
      expect(requestPath.queryStringParams.param99).toBe('value99');
    });
  });
});
