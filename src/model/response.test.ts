import { Response, ResponseBuilder } from './response';
import { StatusType } from './statusType';

describe('Response', () => {
  describe('Response class', () => {
    it('should create response with correct properties', () => {
      const response = new Response({
        statusCode: StatusType.OK,
        body: 'test body',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.statusCode).toBe(StatusType.OK);
      expect(response.body).toBe('test body');
      expect(response.headers).toEqual({ 'Content-Type': 'application/json' });
    });

    it('should handle undefined body', () => {
      const response = new Response({
        statusCode: StatusType.OK,
        body: undefined,
        headers: {},
      });

      expect(response.body).toBeUndefined();
    });

    it('should convert body to JSON string in toJSON', () => {
      const response = new Response({
        statusCode: StatusType.OK,
        body: { key: 'value' },
        headers: {},
      });

      const json = response.toJSON();
      expect(json.body).toBe('{"key":"value"}');
    });

    it('should handle string body in toJSON', () => {
      const response = new Response({
        statusCode: StatusType.OK,
        body: 'test string',
        headers: {},
      });

      const json = response.toJSON();
      expect(json.body).toBe('test string');
    });

    it('should handle null body in toJSON', () => {
      const response = new Response({
        statusCode: StatusType.OK,
        body: null,
        headers: {},
      });

      const json = response.toJSON();
      expect(json.body).toBeNull();
    });

    it('should handle number body in toJSON', () => {
      const response = new Response({
        statusCode: StatusType.OK,
        body: 42,
        headers: {},
      });

      const json = response.toJSON();
      expect(json.body).toBe('42');
    });

    it('should handle String object in toJSON', () => {
      const response = new Response({
        statusCode: StatusType.OK,
        body: new String('test'),
        headers: {},
      });

      const json = response.toJSON();
      // String objects are converted to their primitive value in JSON.stringify
      expect(json.body).toBeDefined();
      expect(typeof json.body).toBe('object');
    });

    it('should provide static builder method', () => {
      const builder = Response.builder();
      expect(builder).toBeInstanceOf(ResponseBuilder);
    });
  });

  describe('ResponseBuilder', () => {
    it('should build response with status code only', () => {
      const response = new ResponseBuilder()
        .withStatusCode(StatusType.OK)
        .build();

      expect(response.statusCode).toBe(StatusType.OK);
      expect(response.body).toBeUndefined();
      expect(response.headers).toEqual({});
    });

    it('should build response with body', () => {
      const response = new ResponseBuilder()
        .withStatusCode(StatusType.OK)
        .withBody('test body')
        .build();

      expect(response.body).toBe('test body');
    });

    it('should build response with single header', () => {
      const response = new ResponseBuilder()
        .withStatusCode(StatusType.OK)
        .withHeader('Content-Type', 'application/json')
        .build();

      expect(response.headers).toEqual({ 'Content-Type': 'application/json' });
    });

    it('should build response with multiple headers', () => {
      const response = new ResponseBuilder()
        .withStatusCode(StatusType.OK)
        .withHeaders({ 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' })
        .build();

      expect(response.headers).toEqual({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      });
    });

    it('should merge headers when using both withHeader and withHeaders', () => {
      const response = new ResponseBuilder()
        .withStatusCode(StatusType.OK)
        .withHeader('Content-Type', 'application/json')
        .withHeaders({ 'Cache-Control': 'no-cache' })
        .build();

      expect(response.headers).toEqual({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      });
    });

    it('should throw error when statusCode is not defined', () => {
      expect(() => {
        new ResponseBuilder().build();
      }).toThrow('statusCode must be defined');
    });

    it('should throw error when header key is undefined', () => {
      expect(() => {
        new ResponseBuilder()
          .withStatusCode(StatusType.OK)
          .withHeader(undefined as any, 'value')
          .build();
      }).toThrow('key must be defined');
    });

    it('should handle undefined header value', () => {
      const response = new ResponseBuilder()
        .withStatusCode(StatusType.OK)
        .withHeader('key', undefined as any)
        .build();

      expect(response.headers).toEqual({});
    });

    it('should chain builder methods correctly', () => {
      const response = new ResponseBuilder()
        .withStatusCode(StatusType.CREATED)
        .withBody({ id: 1, name: 'test' })
        .withHeader('Content-Type', 'application/json')
        .withHeaders({ 'Cache-Control': 'no-cache' })
        .build();

      expect(response.statusCode).toBe(StatusType.CREATED);
      expect(response.body).toEqual({ id: 1, name: 'test' });
      expect(response.headers).toEqual({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      });
    });

    it('should handle empty headers object', () => {
      const response = new ResponseBuilder()
        .withStatusCode(StatusType.OK)
        .withHeaders({})
        .build();

      expect(response.headers).toEqual({});
    });

    it('should handle complex body objects', () => {
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

      const response = new ResponseBuilder()
        .withStatusCode(StatusType.OK)
        .withBody(complexBody)
        .build();

      expect(response.body).toEqual(complexBody);
    });
  });
});
