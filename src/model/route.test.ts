import {
  Route,
  RequestProps,
  QueryStringParams,
  UrlParams,
  MethodStringLiteral,
} from './route';
import { MethodType } from './methodType';
import { Response } from './response';
import { StatusType } from './statusType';

describe('Route', () => {
  describe('Route interface', () => {
    it('should define Route interface with required properties', () => {
      const mockRoute: Route = {
        method: MethodType.GET,
        path: '/api/v1/users',
        handler: jest
          .fn()
          .mockResolvedValue(
            Response.builder()
              .withStatusCode(StatusType.OK)
              .withBody('success')
              .build(),
          ),
      };

      expect(mockRoute.method).toBe(MethodType.GET);
      expect(mockRoute.path).toBe('/api/v1/users');
      expect(typeof mockRoute.handler).toBe('function');
    });

    it('should allow optional argumentNames property', () => {
      const mockRoute: Route = {
        method: MethodType.GET,
        path: '/api/v1/users',
        handler: jest.fn(),
        argumentNames: [],
      };

      expect(mockRoute.argumentNames).toEqual([]);
    });

    it('should allow optional thisReference property', () => {
      const mockThis = { someMethod: jest.fn() };
      const mockRoute: Route = {
        method: MethodType.GET,
        path: '/api/v1/users',
        handler: jest.fn(),
        thisReference: mockThis,
      };

      expect(mockRoute.thisReference).toBe(mockThis);
    });

    it('should handle handler with RequestProps<any>', async () => {
      const mockHandler = jest
        .fn()
        .mockResolvedValue(
          Response.builder()
            .withStatusCode(StatusType.OK)
            .withBody('success')
            .build(),
        );

      const mockRoute: Route = {
        method: MethodType.GET,
        path: '/api/v1/users',
        handler: mockHandler,
      };

      const mockRequestProps: RequestProps<any> = {
        route: mockRoute,
        urlParams: {},
        queryStringParams: {},
        body: { name: 'John' },
        headers: {},
        apiGatewayEvent: {} as any,
        path: '/api/v1/users',
        method: MethodType.GET,
      };

      const result = await mockRoute.handler(mockRequestProps);
      expect(result.statusCode).toBe(StatusType.OK);
      expect(result.body).toBe('success');
    });

    it('should handle handler with RequestProps<undefined>', async () => {
      const mockHandler = jest
        .fn()
        .mockResolvedValue(
          Response.builder()
            .withStatusCode(StatusType.OK)
            .withBody('success')
            .build(),
        );

      const mockRoute: Route = {
        method: MethodType.GET,
        path: '/api/v1/users',
        handler: mockHandler,
      };

      const mockRequestProps: RequestProps<undefined> = {
        route: mockRoute,
        urlParams: {},
        queryStringParams: {},
        body: undefined,
        headers: {},
        apiGatewayEvent: {} as any,
        path: '/api/v1/users',
        method: MethodType.GET,
      };

      const result = await mockRoute.handler(mockRequestProps);
      expect(result.statusCode).toBe(StatusType.OK);
      expect(result.body).toBe('success');
    });
  });

  describe('RequestProps interface', () => {
    it('should define RequestProps with all required properties', () => {
      const mockRoute: Route = {
        method: MethodType.GET,
        path: '/api/v1/users',
        handler: jest.fn(),
      };

      const mockRequestProps: RequestProps<string> = {
        route: mockRoute,
        urlParams: { userId: '123' },
        queryStringParams: { limit: '10' },
        body: 'test body',
        headers: { 'Content-Type': 'application/json' },
        apiGatewayEvent: {} as any,
        path: '/api/v1/users/123',
        method: MethodType.GET,
      };

      expect(mockRequestProps.route).toBe(mockRoute);
      expect(mockRequestProps.urlParams).toEqual({ userId: '123' });
      expect(mockRequestProps.queryStringParams).toEqual({ limit: '10' });
      expect(mockRequestProps.body).toBe('test body');
      expect(mockRequestProps.headers).toEqual({
        'Content-Type': 'application/json',
      });
      expect(mockRequestProps.path).toBe('/api/v1/users/123');
      expect(mockRequestProps.method).toBe(MethodType.GET);
    });

    it('should handle RequestProps with undefined body', () => {
      const mockRoute: Route = {
        method: MethodType.GET,
        path: '/api/v1/users',
        handler: jest.fn(),
      };

      const mockRequestProps: RequestProps<undefined> = {
        route: mockRoute,
        urlParams: {},
        queryStringParams: {},
        body: undefined,
        headers: {},
        apiGatewayEvent: {} as any,
        path: '/api/v1/users',
        method: MethodType.GET,
      };

      expect(mockRequestProps.body).toBeUndefined();
    });

    it('should handle RequestProps with null body', () => {
      const mockRoute: Route = {
        method: MethodType.GET,
        path: '/api/v1/users',
        handler: jest.fn(),
      };

      const mockRequestProps: RequestProps<null> = {
        route: mockRoute,
        urlParams: {},
        queryStringParams: {},
        body: null,
        headers: {},
        apiGatewayEvent: {} as any,
        path: '/api/v1/users',
        method: MethodType.GET,
      };

      expect(mockRequestProps.body).toBeNull();
    });
  });

  describe('QueryStringParams type', () => {
    it('should allow string values', () => {
      const queryParams: QueryStringParams = {
        limit: '10',
        offset: '0',
        sortBy: 'name',
      };

      expect(queryParams.limit).toBe('10');
      expect(queryParams.offset).toBe('0');
      expect(queryParams.sortBy).toBe('name');
    });

    it('should allow undefined values', () => {
      const queryParams: QueryStringParams = {
        limit: '10',
        offset: undefined,
        sortBy: 'name',
      };

      expect(queryParams.limit).toBe('10');
      expect(queryParams.offset).toBeUndefined();
      expect(queryParams.sortBy).toBe('name');
    });

    it('should handle empty object', () => {
      const queryParams: QueryStringParams = {};
      expect(Object.keys(queryParams)).toHaveLength(0);
    });

    it('should handle complex query parameters', () => {
      const queryParams: QueryStringParams = {
        'user.name': 'John Doe',
        'user.age': '30',
        'filters.active': 'true',
        'filters.role': 'admin',
      };

      expect(queryParams['user.name']).toBe('John Doe');
      expect(queryParams['user.age']).toBe('30');
      expect(queryParams['filters.active']).toBe('true');
      expect(queryParams['filters.role']).toBe('admin');
    });
  });

  describe('UrlParams type', () => {
    it('should allow string values', () => {
      const urlParams: UrlParams = {
        userId: '123',
        orderId: '456',
        categoryId: '789',
      };

      expect(urlParams.userId).toBe('123');
      expect(urlParams.orderId).toBe('456');
      expect(urlParams.categoryId).toBe('789');
    });

    it('should handle empty object', () => {
      const urlParams: UrlParams = {};
      expect(Object.keys(urlParams)).toHaveLength(0);
    });

    it('should handle complex URL parameters', () => {
      const urlParams: UrlParams = {
        'user-id': '123',
        'order-id': '456',
        'category-id': '789',
        'sub-category': 'electronics',
      };

      expect(urlParams['user-id']).toBe('123');
      expect(urlParams['order-id']).toBe('456');
      expect(urlParams['category-id']).toBe('789');
      expect(urlParams['sub-category']).toBe('electronics');
    });

    it('should handle numeric string values', () => {
      const urlParams: UrlParams = {
        page: '1',
        size: '25',
        total: '100',
      };

      expect(urlParams.page).toBe('1');
      expect(urlParams.size).toBe('25');
      expect(urlParams.total).toBe('100');
    });
  });

  describe('MethodStringLiteral type', () => {
    it('should accept lowercase get', () => {
      const method: MethodStringLiteral = 'get';
      expect(method).toBe('get');
    });

    it('should accept uppercase GET', () => {
      const method: MethodStringLiteral = 'GET';
      expect(method).toBe('GET');
    });

    it('should work with Route interface', () => {
      const mockRoute: Route = {
        method: 'get',
        path: '/api/v1/users',
        handler: jest.fn(),
      };

      expect(mockRoute.method).toBe('get');
    });

    it('should work with uppercase in Route interface', () => {
      const mockRoute: Route = {
        method: 'GET',
        path: '/api/v1/users',
        handler: jest.fn(),
      };

      expect(mockRoute.method).toBe('GET');
    });
  });

  describe('Integration tests', () => {
    it('should create complete route with all properties and execute handler', async () => {
      const mockHandler = jest
        .fn()
        .mockResolvedValue(
          Response.builder()
            .withStatusCode(StatusType.OK)
            .withBody({ message: 'User created' })
            .build(),
        );

      const mockRoute: Route = {
        method: MethodType.POST,
        path: '/api/v1/users',
        handler: mockHandler,
        argumentNames: [] as any,
        thisReference: { someMethod: jest.fn() },
      };

      const mockRequestProps: RequestProps<{
        name: string;
        email: string;
      }> = {
        route: mockRoute,
        urlParams: { userId: '123' },
        queryStringParams: { include: 'profile' },
        body: { name: 'John Doe', email: 'john@example.com' },
        headers: { 'Content-Type': 'application/json' },
        apiGatewayEvent: {} as any,
        path: '/api/v1/users',
        method: MethodType.POST,
      };

      const result = await mockRoute.handler(mockRequestProps);

      expect(mockHandler).toHaveBeenCalledWith(mockRequestProps);
      expect(result.statusCode).toBe(StatusType.OK);
      expect(result.body).toEqual({ message: 'User created' });
    });

    it('should handle route with minimal properties', async () => {
      const mockHandler = jest
        .fn()
        .mockResolvedValue(
          Response.builder()
            .withStatusCode(StatusType.OK)
            .withBody('success')
            .build(),
        );

      const mockRoute: Route = {
        method: MethodType.GET,
        path: '/api/v1/health',
        handler: mockHandler,
      };

      const mockRequestProps: RequestProps<undefined> = {
        route: mockRoute,
        urlParams: {},
        queryStringParams: {},
        body: undefined,
        headers: {},
        apiGatewayEvent: {} as any,
        path: '/api/v1/health',
        method: MethodType.GET,
      };

      const result = await mockRoute.handler(mockRequestProps);

      expect(mockHandler).toHaveBeenCalledWith(mockRequestProps);
      expect(result.statusCode).toBe(StatusType.OK);
      expect(result.body).toBe('success');
    });
  });
});
