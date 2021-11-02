import Register from "./Register";
import AbstractRegister from "./AbstractRegister";
import BitRegister from "./BitRegister";
import StackRegister from "./StackRegister";

export const Registers: { [key: string]: AbstractRegister } = {
  $r1: new Register("0001"),
  $r2: new Register("0010"),
  $r3: new Register("0011"),
  $r4: new Register("0100"),
  $r5: new Register("0101"),
  $r6: new Register("0110"),
  $r7: new Register("0111"),
  $r8: new Register("1000"),
  $sp: new StackRegister("1001"),
  $rb: new BitRegister("1010"),
};
