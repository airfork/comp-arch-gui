export default abstract class AbstractRegister {
  protected _value: number;
  private startingValue = 0;

  protected constructor(readonly binary: string) {
    this._value = this.startingValue;
  }

  get value(): number {
    return this._value;
  }

  set value(x: number) {
    this._value = x;
  }

  public reset = () => {
    this.value = this.startingValue;
  };
}
