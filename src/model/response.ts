import { StatusType } from '../model/statusType';
import { UnrestResponse } from './unrestResponse';

export interface ResponseProps<T> {
  statusCode: StatusType;
  body?: undefined | T | string;
  headers: ResponseHeaders;
}

export interface ResponseHeaders {
  [key: string]: string;
}

export class Response<T> {
  constructor(private props: ResponseProps<T>) {}

  get statusCode() {
    return this.props.statusCode;
  }

  get body(): T | undefined | string {
    return this.props.body;
  }

  get headers(): ResponseHeaders {
    return this.props.headers;
  }

  static builder<T>(): ResponseBuilder<T> {
    return new ResponseBuilder<T>();
  }

  toJSON(): UnrestResponse {
    return {
      ...this.props,
    };
  }
}

export class ResponseBuilder<T> {
  private statusCode?: StatusType;
  private body: T | undefined | string;
  private headers: ResponseHeaders = {};

  withStatusCode(value: number): ResponseBuilder<T> {
    this.statusCode = value;
    return this;
  }

  withBody(
    value: string | undefined | object | boolean | number | unknown,
  ): ResponseBuilder<T> {
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

  withHeader(key: string, value: string): ResponseBuilder<T> {
    if (key !== undefined) {
      if (value !== undefined) {
        this.headers[key] = value;
      }
    } else {
      throw new Error('key must be defined');
    }
    return this;
  }

  build(): Response<T> {
    if (this.statusCode == null) {
      throw new Error('statusCode must be defined');
    }
    return new Response<T>({
      statusCode: this.statusCode,
      body: this.body,
      headers: this.headers,
    });
  }
}
