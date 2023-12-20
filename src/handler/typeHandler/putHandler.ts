import { Handler } from '../handler';
import { MethodType } from '../../model';

export class PutHandler extends Handler {
  getMethod(): MethodType {
    return MethodType.PUT;
  }
}
