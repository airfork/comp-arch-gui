import AbstractRegister from "./AbstractRegister";

export default class Register extends AbstractRegister {
  constructor(readonly binary: string) {
    super(binary);
  }
}
