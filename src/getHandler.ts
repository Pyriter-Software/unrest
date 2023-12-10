import { Handler } from './handler';
import { MethodType } from './methodType';

export class GetHandler extends Handler {
  getMethod(): MethodType {
    return MethodType.GET;
  }
}
