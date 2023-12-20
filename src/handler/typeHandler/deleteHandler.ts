import { Handler } from '../handler';
import { MethodType } from '../../model';

export class DeleteHandler extends Handler {
  getMethod(): MethodType {
    return MethodType.DELETE;
  }
}
