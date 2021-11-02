import ArgumentTypes from "../ArgumentTypes";
import AbstractRegister from "../../registers/AbstractRegister";
import {
  BoundsCheck,
  GetRegister,
  OverflowNumber,
  ValidateArgumentLength,
  ValidateArgumentTypes,
} from "../validationHelpers";
import { InstructionMapping, InstructionSize } from "../InstructionInfo";
import OpCodes from "../OpCodes";
import { InstructionWrapper } from "../instructionWrapper";

const argList = [ArgumentTypes.REG, ArgumentTypes.REG];
type registerGroup = [AbstractRegister, AbstractRegister];

function getRegisters(args: string[]): registerGroup {
  const dest = GetRegister(args[0]);
  const first = GetRegister(args[1]);
  return [dest, first];
}

function toBinary(
  instr: string,
  dest: AbstractRegister,
  first: AbstractRegister,
): string {
  const mapping = funcMappings[instr];
  if (mapping == null) {
    return `Failed to find opcode for ${instr}`;
  }
  const binary = mapping.opCode + dest.binary + first.binary;
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

    const [dest, first] = getRegisters(args);
    return toBinary(inName, dest, first);
  };
}

function adds(args: string[]): Error | void {
  const [first, second] = getRegisters(args);
  const stack = GetRegister("$sp");
  const val = first.value + second.value;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  stack.value = val;
}

function addso(args: string[]): Error | void {
  const [first, second] = getRegisters(args);
  const stack = GetRegister("$sp");
  stack.value = OverflowNumber(first.value + second.value);
}

type equalitySigns = "=" | "<" | "<=" | ">" | ">=" | "!=";
function equalityFunction(
  equalitySign: equalitySigns,
): (args: string[]) => void {
  return (args: string[]) => {
    const [first, second] = getRegisters(args);
    const bitReg = GetRegister("$rb");
    switch (equalitySign) {
      case "!=":
        bitReg.value = first.value !== second.value ? 1 : 0;
        break;
      case "<":
        bitReg.value = first.value < second.value ? 1 : 0;
        break;
      case "<=":
        bitReg.value = first.value <= second.value ? 1 : 0;
        break;
      case "=":
        bitReg.value = first.value === second.value ? 1 : 0;
        break;
      case ">":
        bitReg.value = first.value > second.value ? 1 : 0;
        break;
      case ">=":
        bitReg.value = first.value >= second.value ? 1 : 0;
        break;
    }
  };
}

function abs(args: string[]) {
  const [dest, first] = getRegisters(args);
  dest.value = Math.abs(first.value);
}

function neg(args: string[]): Error | void {
  const [dest, first] = getRegisters(args);
  const val = -first.value;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

function sqrt(args: string[]) {
  const [dest, first] = getRegisters(args);
  dest.value = Math.floor(Math.sqrt(first.value));
}

function muls(args: string[]): Error | void {
  const [first, second] = getRegisters(args);
  const stack = GetRegister("$sp");
  const val = first.value * second.value;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  stack.value = val;
}

function mulso(args: string[]) {
  const [first, second] = getRegisters(args);
  const stack = GetRegister("$sp");
  stack.value = OverflowNumber(first.value * second.value);
}

function cp(args: string[]) {
  const [dest, second] = getRegisters(args);
  dest.value = second.value;
}

function subs(args: string[]): Error | void {
  const [first, second] = getRegisters(args);
  const stack = GetRegister("$sp");
  const val = first.value - second.value;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  stack.value = val;
}

function subso(args: string[]) {
  const [first, second] = getRegisters(args);
  const stack = GetRegister("$sp");
  stack.value = OverflowNumber(first.value - second.value);
}

const funcMappings: InstructionMapping = {
  abs: {
    func: abs,
    opCode: OpCodes.abs,
  },
  adds: {
    func: adds,
    opCode: OpCodes.adds,
  },
  addso: {
    func: addso,
    opCode: OpCodes.addso,
  },
  cp: {
    func: cp,
    opCode: OpCodes.cp,
  },
  eq: {
    func: equalityFunction("="),
    opCode: OpCodes.eq,
  },
  gt: {
    func: equalityFunction(">"),
    opCode: OpCodes.gt,
  },
  gte: {
    func: equalityFunction(">="),
    opCode: OpCodes.gte,
  },
  lt: {
    func: equalityFunction("<"),
    opCode: OpCodes.lt,
  },
  lte: {
    func: equalityFunction("<="),
    opCode: OpCodes.lte,
  },
  muls: {
    func: muls,
    opCode: OpCodes.muls,
  },
  mulso: {
    func: mulso,
    opCode: OpCodes.mulso,
  },
  neg: {
    func: neg,
    opCode: OpCodes.neg,
  },
  neq: {
    func: equalityFunction("!="),
    opCode: OpCodes.neq,
  },
  sqrt: {
    func: sqrt,
    opCode: OpCodes.sqrt,
  },
  subs: {
    func: subs,
    opCode: OpCodes.subs,
  },
  subso: {
    func: subso,
    opCode: OpCodes.subso,
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

const TwoReg = { search };
export default TwoReg;
