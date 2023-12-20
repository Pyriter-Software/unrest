import { Handler } from '../handler';
import { MethodType } from '../../model';

export class GetHandler extends Handler {
  getMethod(): MethodType {
    return MethodType.GET;
  }
}
