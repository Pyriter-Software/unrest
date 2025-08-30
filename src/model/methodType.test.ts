import { MethodType } from './methodType';

describe('MethodType', () => {
  it('should define all HTTP methods', () => {
    expect(MethodType.GET).toBe('GET');
    expect(MethodType.POST).toBe('POST');
    expect(MethodType.PUT).toBe('PUT');
    expect(MethodType.DELETE).toBe('DELETE');
    expect(MethodType.PATCH).toBe('PATCH');
  });

  it('should have correct string values', () => {
    const methods = Object.values(MethodType);
    expect(methods).toContain('GET');
    expect(methods).toContain('POST');
    expect(methods).toContain('PUT');
    expect(methods).toContain('DELETE');
    expect(methods).toContain('PATCH');
  });

  it('should have exactly 9 HTTP methods', () => {
    const methodCount = Object.keys(MethodType).length;
    expect(methodCount).toBe(9);
  });

  it('should be usable in type annotations', () => {
    const method: MethodType = MethodType.GET;
    expect(method).toBe('GET');
  });

  it('should work with string comparisons', () => {
    const method = MethodType.POST;
    expect(method === 'POST').toBe(true);
    expect(method === ('GET' as any)).toBe(false);
  });

  it('should work with Route interface', () => {
    const mockRoute = {
      method: 'get' as any,
      path: '/api/v1/users',
      handler: jest.fn(),
    };

    expect(mockRoute.method).toBe('get');
  });

  it('should work with uppercase in Route interface', () => {
    const mockRoute = {
      method: 'GET' as any,
      path: '/api/v1/users',
      handler: jest.fn(),
    };

    expect(mockRoute.method).toBe('GET');
  });
});
