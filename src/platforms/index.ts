import type { Message } from '../schemas.js';
import Qq from './qq.js';

export default class {
  qq;

  constructor(callback: (message: Message) => Promise<void>) {
    this.qq = new Qq(callback);
  }
}
