import { StatusType } from '../model/statusType';
import { ResponseHeaders } from './response';

export interface UnrestResponse {
  statusCode: StatusType;
  body: object | string | number | undefined | boolean;
  headers: ResponseHeaders;
}
