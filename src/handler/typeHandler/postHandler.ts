import { Handler } from '../handler';
import { MethodType } from '../../model';

export class PostHandler extends Handler {
  getMethod(): MethodType {
    return MethodType.POST;
  }
}
