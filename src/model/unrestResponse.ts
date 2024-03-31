import { StatusType } from '../model/statusType';
import { ResponseHeaders } from './response';

export interface UnrestResponse {
  statusCode: StatusType;
  body?: string | undefined | any;
  headers: ResponseHeaders;
}
