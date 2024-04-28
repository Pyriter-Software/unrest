import { StatusType } from '../model/statusType';
import { UnrestResponse } from './unrestResponse';

export interface ResponseProps<T> {
  statusCode: StatusType;
  body?: undefined | T;
  headers: ResponseHeaders;
}

export interface ResponseHeaders {
  [key: string]: string;
}

export class Response<K> {
  constructor(private props: ResponseProps<K>) {}

  get statusCode() {
    return this.props.statusCode;
  }

  get body(): K | undefined {
    return this.props.body;
  }

  get headers(): ResponseHeaders {
    return this.props.headers;
  }

  static builder<K>(): ResponseBuilder<K> {
    return new ResponseBuilder<K>();
  }

  toJSON(): UnrestResponse {
    return {
      ...this.props,
      body: this.convertBodyToString(this.body),
    };
  }

  private convertBodyToString(value: any): string | undefined | null {
    if (value == null) return null;
    else if (
      typeof value === 'string' ||
      (value as any) instanceof String
    ) {
      return value;
    } else if (typeof value === 'object') {
      return JSON.stringify(value);
    } else {
      return String(value);
    }
  }
}

export class ResponseBuilder<K> {
  private statusCode?: StatusType;
  private body: K | any;
  private headers: ResponseHeaders = {};

  withStatusCode(value: number): ResponseBuilder<K> {
    this.statusCode = value;
    return this;
  }

  withBody(value: K): ResponseBuilder<K> {
    this.body = value;
    return this;
  }

  withHeader(key: string, value: string): ResponseBuilder<K> {
    if (key !== undefined) {
      if (value !== undefined) {
        this.headers[key] = value;
      }
    } else {
      throw new Error('key must be defined');
    }
    return this;
  }

  build(): Response<K> {
    if (this.statusCode == null) {
      throw new Error('statusCode must be defined');
    }
    return new Response<K>({
      statusCode: this.statusCode,
      body: this.body,
      headers: this.headers,
    });
  }
}
