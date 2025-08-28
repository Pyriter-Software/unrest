import { RoutingTrie } from './routingTrie';
import { Response } from '../model/response';

describe('routingTrie', () => {
  const routingTrie = new RoutingTrie();

  describe('route validation', () => {
    test('should throw error for unmatched opening brace', () => {
      expect(() => {
        new RoutingTrie([{
          handler: () => Promise.resolve({} as Response<undefined>),
          path: '/foo/{bar',
          method: 'GET',
        }]);
      }).toThrow('Unmatched braces in path: /foo/{bar');
    });

    test('should throw error for unmatched closing brace', () => {
      expect(() => {
        new RoutingTrie([{
          handler: () => Promise.resolve({} as Response<undefined>),
          path: '/foo/bar}',
          method: 'GET',
        }]);
      }).toThrow('Unmatched braces in path: /foo/bar}');
    });

    test('should throw error for empty parameter name', () => {
      expect(() => {
        new RoutingTrie([{
          handler: () => Promise.resolve({} as Response<undefined>),
          path: '/foo/{}',
          method: 'GET',
        }]);
      }).toThrow('Empty parameter name in path: /foo/{}');
    });

    test('should throw error for nested braces', () => {
      expect(() => {
        new RoutingTrie([{
          handler: () => Promise.resolve({} as Response<undefined>),
          path: '/foo/{{bar}}',
          method: 'GET',
        }]);
      }).toThrow('Nested braces not allowed in path: /foo/{{bar}}');
    });
  });
  beforeAll(() => {
    routingTrie.insert({
      handler: (): Promise<Response<undefined>> => {
        return Promise.resolve({} as Response<undefined>);
      },
      path: '/foo',
      method: 'GET',
    });
    routingTrie.insert({
      handler: () => {
        return Promise.resolve({} as Response<undefined>);
      },
      path: '/foo/{bar}',
      method: 'GET',
    });
    routingTrie.insert({
      handler: () => {
        return Promise.resolve({} as Response<undefined>);
      },
      path: '/foo/{bar}/hello',
      method: 'GET',
    });
    routingTrie.insert({
      handler: () => {
        return Promise.resolve({} as Response<undefined>);
      },
      path: '/foo/{bar}/hello/{world}',
      method: 'GET',
    });
  });
  describe('get', () => {
    test('get basic route', () => {
      const requestPath = routingTrie.get('/foo')!!;

      expect(requestPath.path).toEqual('/foo');
      expect(Object.keys(requestPath.urlParams).length).toEqual(0);
      expect(requestPath.route).toBeDefined();
      expect(requestPath.route.handler).toBeDefined();
      expect(requestPath.route.method).toEqual('GET');
    });

    test('get route with one url param', () => {
      const requestPath = routingTrie.get('/foo/123')!!;

      expect(requestPath.path).toEqual('/foo/123');
      expect(Object.keys(requestPath.urlParams).length).toEqual(1);
      expect(requestPath.urlParams['bar']).toEqual('123');
      expect(requestPath.route.path).toEqual('/foo/{bar}');
      expect(requestPath.route.handler).toBeDefined();
      expect(requestPath.route.method).toEqual('GET');
    });

    test('get route with one argument that is also the argument name', () => {
      const requestPath = routingTrie.get('/foo/{bar}')!!;

      expect(requestPath.path).toEqual('/foo/{bar}');
      expect(Object.keys(requestPath.urlParams).length).toEqual(1);
      expect(requestPath.urlParams['bar']).toEqual('{bar}');
      expect(requestPath.route.path).toEqual('/foo/{bar}');
      expect(requestPath.route.handler).toBeDefined();
      expect(requestPath.route.method).toEqual('GET');
    });

    test('get route with query string parameters', () => {
      const requestPath = routingTrie.get(
        '/foo?param1=value1&param2=value2',
      )!!;

      expect(requestPath.path).toEqual('/foo');
      expect(Object.keys(requestPath.urlParams).length).toEqual(0);
      expect(requestPath.route).toBeDefined();
      expect(requestPath.route.method).toEqual('GET');
    });

    test('get route with url params and query string', () => {
      const requestPath = routingTrie.get('/foo/123?param=value')!!;

      expect(requestPath.path).toEqual('/foo/123');
      expect(Object.keys(requestPath.urlParams).length).toEqual(1);
      expect(requestPath.urlParams['bar']).toEqual('123');
      expect(requestPath.route.path).toEqual('/foo/{bar}');
    });
  });
  describe('has', () => {
    test('should get basic route', () => {
      expect(routingTrie.has('/foo')).toBeTruthy();
    });

    test('get route with one argument', () => {
      expect(routingTrie.has('/foo/123')).toBeTruthy();
    });

    test('get route with one argument that is also the argument name', () => {
      expect(routingTrie.has('/foo/{bar}')).toBeTruthy();
    });

    test('should handle query string parameters', () => {
      expect(routingTrie.has('/foo?param=value')).toBeTruthy();
    });

    test('should handle url params with query string', () => {
      expect(routingTrie.has('/foo/123?param=value')).toBeTruthy();
    });
  });
});
