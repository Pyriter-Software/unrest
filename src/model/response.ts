import { StatusType } from '../model/statusType';
import { UnrestResponse } from './unrestResponse';

export interface ResponseProps {
  statusCode: StatusType;
  body?: string | undefined;
  headers: ResponseHeaders;
}

export interface ResponseHeaders {
  [key: string]: string;
}

export class Response {
  constructor(private props: ResponseProps) {}

  get statusCode() {
    return this.props.statusCode;
  }

  get body() {
    return this.props.body;
  }

  get headers(): ResponseHeaders {
    return this.props.headers;
  }

  static builder(): ResponseBuilder {
    return new ResponseBuilder();
  }

  toJSON(): UnrestResponse {
    return {
      ...this.props,
    };
  }
}

export class ResponseBuilder {
  private statusCode?: StatusType;
  private body?: string;
  private headers: ResponseHeaders = {};

  withStatusCode(value: number): ResponseBuilder {
    this.statusCode = value;
    return this;
  }

  withBody(
    value: string | undefined | object | boolean | number | unknown,
  ): ResponseBuilder {
    if (value == null) return this;
    else if (
      typeof value === 'string' ||
      (value as any) instanceof String
    ) {
      this.body = value as string;
    } else if (typeof value === 'object') {
      this.body = JSON.stringify(value);
    } else {
      this.body = String(value);
    }
    return this;
  }

  withHeader(key: string, value: string): ResponseBuilder {
    if (key !== undefined) {
      if (value !== undefined) {
        this.headers[key] = value;
      }
    } else {
      throw new Error('key must be defined');
    }
    return this;
  }

  build(): Response {
    if (this.statusCode == null) {
      throw new Error('statusCode must be defined');
    }
    return new Response({
      statusCode: this.statusCode,
      body: this.body,
      headers: this.headers,
    });
  }
}
