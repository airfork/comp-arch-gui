import AbstractRegister from "./AbstractRegister";

export default class StackRegister extends AbstractRegister {
  private stack: number[] = [];
  constructor(binary: string) {
    super(binary);
  }

  set value(x: number) {
    this.stack.push(x);
  }

  get value(): number {
    const top = this.stack.pop();
    if (top == null) return 0;
    return top;
  }
}
