import { StatusType } from './statusType';
import { ResponseBuilder } from './responseBuilder';

export interface ResponseProps {
  statusCode: StatusType;
  body: object | string | number | undefined | boolean;
  headers?: Headers;
}

export interface Headers {
  [key: string]: string;
}

export class Response {
  constructor(public props: ResponseProps) {
  }

  get statusCode() {
    return this.props.statusCode;
  }

  get body() {
    return this.props.body;
  }

  get headers() {
    return this.props.headers;
  }

  withHeader(key: string, value: string) {
    if (key !== undefined) {
      if (value !== undefined) {
        this.props.headers[key] = value;
      }
    } else {
      throw new Error('key must be defined');
    }
    return this;
  }

  static builder(): ResponseBuilder {
    return new ResponseBuilder();
  }
}





