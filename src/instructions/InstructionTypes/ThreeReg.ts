import { InstructionWrapper } from "../instructionWrapper";
import {
  BoundsCheck,
  GetRegister,
  OverflowNumber,
  ValidateArgumentLength,
  ValidateArgumentTypes,
} from "../validationHelpers";
import ArgumentTypes from "../ArgumentTypes";
import {
  InstructionMapping,
  InstructionSize,
  MaxNumber,
  MinNumber,
} from "../InstructionInfo";
import OpCodes from "../OpCodes";
import AbstractRegister from "../../registers/AbstractRegister";

type registerGroup = [AbstractRegister, AbstractRegister, AbstractRegister];
const argList = [ArgumentTypes.REG, ArgumentTypes.REG, ArgumentTypes.REG];

function getRegisters(args: string[]): registerGroup {
  const dest = GetRegister(args[0]);
  const first = GetRegister(args[1]);
  const second = GetRegister(args[2]);
  return [dest, first, second];
}

function toBinary(
  instr: string,
  dest: AbstractRegister,
  first: AbstractRegister,
  second: AbstractRegister,
): string {
  const mapping = funcMappings[instr];
  if (mapping == null) {
    return `Failed to find opcode for ${instr}`;
  }
  const binary = mapping.opCode + dest.binary + first.binary + second.binary;
  return binary + "0".repeat(InstructionSize - binary.length);
}

function validator(inName: string): (args: string[]) => Error | string {
  return (args: string[]) => {
    const validateArgLength = ValidateArgumentLength(
      inName,
      args.length,
      argList.length,
    );
    if (validateArgLength != null) {
      return new Error(validateArgLength);
    }

    const validateTypes = ValidateArgumentTypes(inName, args, argList);
    if (validateTypes != null) {
      return new Error(validateTypes);
    }

    const [dest, first, second] = getRegisters(args);
    return toBinary(inName, dest, first, second);
  };
}

function add(args: string[]): Error | void {
  const [dest, first, second] = getRegisters(args);
  const val = first.value + second.value;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

function sub(args: string[]): Error | void {
  const [dest, first, second] = getRegisters(args);
  const val = first.value - second.value;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

function addo(args: string[]) {
  const [dest, first, second] = getRegisters(args);
  dest.value = OverflowNumber(first.value + second.value);
}

function and(args: string[]) {
  const [dest, first, second] = getRegisters(args);
  dest.value = first.value & second.value;
}

function or(args: string[]) {
  const [dest, first, second] = getRegisters(args);
  const val = first.value | second.value;

  if (val > MaxNumber || val < MinNumber) {
    dest.value = 0;
    return;
  }

  dest.value = val;
}

function xor(args: string[]) {
  const [dest, first, second] = getRegisters(args);
  const val = first.value ^ second.value;

  if (val > MaxNumber || val < MinNumber) {
    dest.value = 0;
    return;
  }

  dest.value = val;
}

function div(args: string[]): Error | void {
  const [dest, first, second] = getRegisters(args);

  if (second.value === 0) {
    return new Error("Divide by zero exception");
  }
  dest.value = Math.floor(first.value / second.value);
}

function diff(args: string[]) {
  const [dest, first, second] = getRegisters(args);
  dest.value = Math.abs(Math.abs(first.value) - Math.abs(second.value));
}

function expo(args: string[]): Error | void {
  const [dest, first, second] = getRegisters(args);
  const val = Math.pow(first.value, second.value);
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

function mul(args: string[]): Error | void {
  const [dest, first, second] = getRegisters(args);
  const val = first.value * second.value;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

function mulo(args: string[]) {
  const [dest, first, second] = getRegisters(args);
  dest.value = OverflowNumber(first.value * second.value);
}

function subo(args: string[]) {
  const [dest, first, second] = getRegisters(args);
  dest.value = OverflowNumber(first.value - second.value);
}

const funcMappings: InstructionMapping = {
  add: {
    func: add,
    opCode: OpCodes.add,
  },
  addo: {
    func: addo,
    opCode: OpCodes.addo,
  },
  and: {
    func: and,
    opCode: OpCodes.and,
  },
  diff: {
    func: diff,
    opCode: OpCodes.diff,
  },
  div: {
    func: div,
    opCode: OpCodes.div,
  },
  expo: {
    func: expo,
    opCode: OpCodes.expo,
  },
  mul: {
    func: mul,
    opCode: OpCodes.mul,
  },
  mulo: {
    func: mulo,
    opCode: OpCodes.mulo,
  },
  or: {
    func: or,
    opCode: OpCodes.or,
  },
  sub: {
    func: sub,
    opCode: OpCodes.sub,
  },
  subo: {
    func: subo,
    opCode: OpCodes.subo,
  },
  xor: {
    func: xor,
    opCode: OpCodes.xor,
  },
};

function search(search: string): InstructionWrapper | null {
  if (!(search in funcMappings)) {
    return null;
  }

  const foundInstruction = funcMappings[search];
  return {
    run: foundInstruction.func,
    validator: validator(search),
  };
}

const ThreeReg = { search };
export default ThreeReg;
