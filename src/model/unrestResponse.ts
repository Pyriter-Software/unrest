import { StatusType } from '../model/statusType';
import { ResponseHeaders } from './response';

export interface UnrestResponse {
  statusCode: StatusType;
  body?: string | undefined | null;
  headers: ResponseHeaders;
}
