import { Handler, Props } from './handler';
import { Route } from '../model/route';
import { MethodType } from '../model/methodType';
import { Request } from '../model/request';
import { Response } from '../model/response';
import { StatusType } from '../model/statusType';

describe('Handler', () => {
  let mockRoute: Route;
  let mockProps: Props;
  let handler: Handler;

  beforeEach(() => {
    mockRoute = {
      method: MethodType.GET,
      path: '/api/v1/users',
      handler: jest.fn().mockResolvedValue(
        Response.builder()
          .withStatusCode(StatusType.OK)
          .withBody('success')
          .build()
      ),
    };

    mockProps = {
      routingTable: new Map([[MethodType.GET, [mockRoute]]]),
      method: MethodType.GET,
    };

    handler = new Handler(mockProps);
  });

  describe('Handler class', () => {
    it('should create handler with correct properties', () => {
      expect(handler).toBeInstanceOf(Handler);
      expect(handler['method']).toBe(MethodType.GET);
    });

    it('should check if it can handle a method', () => {
      const mockRequest: Request<any> = {
        method: MethodType.GET,
        path: '/api/v1/users',
        urlParams: {},
        queryStringParams: {},
        body: undefined,
        headers: {},
        apiGatewayEvent: {} as any,
      };

      const result = handler.canHandleMethod(mockRequest);
      expect(result).toBe(true);
    });

    it('should return false for different method', () => {
      const mockRequest: Request<any> = {
        method: MethodType.POST,
        path: '/api/v1/users',
        urlParams: {},
        queryStringParams: {},
        body: undefined,
        headers: {},
        apiGatewayEvent: {} as any,
      };

      const result = handler.canHandleMethod(mockRequest);
      expect(result).toBe(false);
    });

    it('should check if it can handle method and update request path', () => {
      const mockRequest: Request<any> = {
        method: MethodType.GET,
        path: '/api/v1/users',
        urlParams: {},
        queryStringParams: {},
        body: undefined,
        headers: {},
        apiGatewayEvent: {} as any,
      };

      const result = handler.canHandleThenUpdateWithRequestPath(mockRequest);
      expect(result).toBe(true);
      expect(mockRequest.requestPath).toBeDefined();
    });

    it('should return false when method does not match', () => {
      const mockRequest: Request<any> = {
        method: MethodType.POST,
        path: '/api/v1/users',
        urlParams: {},
        queryStringParams: {},
        body: undefined,
        headers: {},
        apiGatewayEvent: {} as any,
      };

      const result = handler.canHandleThenUpdateWithRequestPath(mockRequest);
      expect(result).toBe(false);
    });

    it('should return false when path does not match', () => {
      const mockRequest: Request<any> = {
        method: MethodType.GET,
        path: '/api/v1/nonexistent',
        urlParams: {},
        queryStringParams: {},
        body: undefined,
        headers: {},
        apiGatewayEvent: {} as any,
      };

      const result = handler.canHandleThenUpdateWithRequestPath(mockRequest);
      expect(result).toBe(false);
    });

    it('should handle request and return response', async () => {
      const mockRequest: Request<any> = {
        method: MethodType.GET,
        path: '/api/v1/users',
        urlParams: {},
        queryStringParams: {},
        body: undefined,
        headers: {},
        apiGatewayEvent: {} as any,
        requestPath: {
          path: '/api/v1/users',
          route: mockRoute,
          urlParams: {},
          queryStringParams: {},
        },
      };

      const result = await handler.handle(mockRequest);

      expect(result).toBeInstanceOf(Response);
      expect(result.statusCode).toBe(StatusType.OK);
      expect(result.body).toBe('success');
    });

    it('should throw error when request path is not available', async () => {
      const mockRequest: Request<any> = {
        method: MethodType.GET,
        path: '/api/v1/users',
        urlParams: {},
        queryStringParams: {},
        body: undefined,
        headers: {},
        apiGatewayEvent: {} as any,
      };

      await expect(handler.handle(mockRequest)).rejects.toThrow(
        'Unable to determine route from path'
      );
    });

    it('should merge request and response headers', async () => {
      const mockRequest: Request<any> = {
        method: MethodType.GET,
        path: '/api/v1/users',
        urlParams: {},
        queryStringParams: {},
        body: undefined,
        headers: { 'X-Request-ID': 'req-123' },
        apiGatewayEvent: {} as any,
        requestPath: {
          path: '/api/v1/users',
          route: {
            ...mockRoute,
            handler: jest.fn().mockResolvedValue(
              Response.builder()
                .withStatusCode(StatusType.OK)
                .withBody('success')
                .withHeader('Content-Type', 'application/json')
                .build()
            ),
          },
          urlParams: {},
          queryStringParams: {},
        },
      };

      const result = await handler.handle(mockRequest);

      expect(result.headers['X-Request-ID']).toBe('req-123');
      expect(result.headers['Content-Type']).toBe('application/json');
    });

    it('should call route handler with correct parameters', async () => {
      const mockHandler = jest.fn().mockResolvedValue(
        Response.builder()
          .withStatusCode(StatusType.OK)
          .withBody('success')
          .build()
      );

      const mockRouteWithHandler: Route = {
        ...mockRoute,
        handler: mockHandler,
        thisReference: { someMethod: jest.fn() },
      };

      const mockRequest: Request<any> = {
        method: MethodType.GET,
        path: '/api/v1/users',
        urlParams: {},
        queryStringParams: { limit: '10' },
        body: { name: 'John' },
        headers: { 'Content-Type': 'application/json' },
        apiGatewayEvent: {} as any,
        requestPath: {
          path: '/api/v1/users',
          route: mockRouteWithHandler,
          urlParams: { userId: '123' },
          queryStringParams: { limit: '10' },
        },
      };

      await handler.handle(mockRequest);

      expect(mockHandler).toHaveBeenCalledWith({
        route: mockRouteWithHandler,
        urlParams: { userId: '123' },
        queryStringParams: { limit: '10' },
        body: { name: 'John' },
        headers: { 'Content-Type': 'application/json' },
        apiGatewayEvent: {} as any,
        path: '/api/v1/users',
        method: MethodType.GET,
      });
    });
  });

  describe('Handler with different methods', () => {
    it('should handle POST method', () => {
      const postProps: Props = {
        routingTable: new Map([[MethodType.POST, [mockRoute]]]),
        method: MethodType.POST,
      };

      const postHandler = new Handler(postProps);
      expect(postHandler['method']).toBe(MethodType.POST);
    });

    it('should handle PUT method', () => {
      const putProps: Props = {
        routingTable: new Map([[MethodType.PUT, [mockRoute]]]),
        method: MethodType.PUT,
      };

      const putHandler = new Handler(putProps);
      expect(putHandler['method']).toBe(MethodType.PUT);
    });

    it('should handle DELETE method', () => {
      const deleteProps: Props = {
        routingTable: new Map([[MethodType.DELETE, [mockRoute]]]),
        method: MethodType.DELETE,
      };

      const deleteHandler = new Handler(deleteProps);
      expect(deleteHandler['method']).toBe(MethodType.DELETE);
    });

    it('should handle PATCH method', () => {
      const patchProps: Props = {
        routingTable: new Map([[MethodType.PATCH, [mockRoute]]]),
        method: MethodType.PATCH,
      };

      const patchHandler = new Handler(patchProps);
      expect(patchHandler['method']).toBe(MethodType.PATCH);
    });
  });

  describe('Handler with empty routing table', () => {
    it('should handle empty routing table', () => {
      const emptyProps: Props = {
        routingTable: new Map(),
        method: MethodType.GET,
      };

      const emptyHandler = new Handler(emptyProps);
      expect(emptyHandler).toBeInstanceOf(Handler);
    });

    it('should return false for path matching with empty routing table', () => {
      const emptyProps: Props = {
        routingTable: new Map(),
        method: MethodType.GET,
      };

      const emptyHandler = new Handler(emptyProps);

      const mockRequest: Request<any> = {
        method: MethodType.GET,
        path: '/api/v1/users',
        urlParams: {},
        queryStringParams: {},
        body: undefined,
        headers: {},
        apiGatewayEvent: {} as any,
      };

      const result = emptyHandler.hasRouteThenUpdateWithRequestPath(mockRequest);
      expect(result).toBe(false);
    });
  });
});
