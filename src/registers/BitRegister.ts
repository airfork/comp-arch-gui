import AbstractRegister from "./AbstractRegister";

export default class BitRegister extends AbstractRegister {
  constructor(readonly binary: string) {
    super(binary);
  }

  set value(x: number) {
    this._value = x !== 0 ? 1 : 0;
  }

  get value(): number {
    return this._value;
  }
}
