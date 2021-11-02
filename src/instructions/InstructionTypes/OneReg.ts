import ArgumentTypes from "../ArgumentTypes";
import { InstructionMapping, InstructionSize } from "../InstructionInfo";
import { InstructionWrapper } from "../instructionWrapper";
import {
  BoundsCheck,
  GetRegister,
  ValidateArgumentLength,
  ValidateArgumentTypes,
} from "../validationHelpers";
import AbstractRegister from "../../registers/AbstractRegister";
import OpCodes from "../OpCodes";

const argList = [ArgumentTypes.REG];

function toBinary(instr: string, dest: AbstractRegister): string {
  const mapping = funcMappings[instr];
  if (mapping == null) {
    return `Failed to find opcode for ${instr}`;
  }
  const binary = mapping.opCode + dest.binary;
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

    const dest = GetRegister(args[0]);
    return toBinary(inName, dest);
  };
}

function addfs(args: string[]): Error | void {
  const dest = GetRegister(args[0]);
  const stack = GetRegister("$sp");
  const val = stack.value + stack.value;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

function divs(args: string[]): Error | void {
  const dest = GetRegister(args[0]);
  const stack = GetRegister("$sp");
  const first = stack.value;
  const second = stack.value;

  if (second === 0) {
    return new Error("Divide by zero exception");
  }

  dest.value = Math.floor(first / second);
}

function dec(args: string[]): Error | void {
  const dest = GetRegister(args[0]);
  const val = dest.value - 1;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

function inc(args: string[]): Error | void {
  const dest = GetRegister(args[0]);
  const val = dest.value + 1;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

function mulfs(args: string[]): Error | void {
  const dest = GetRegister(args[0]);
  const stack = GetRegister("$sp");
  const val = stack.value * stack.value;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

function zero(args: string[]) {
  const dest = GetRegister(args[0]);
  dest.reset();
}

function push(args: string[]) {
  const reg = GetRegister(args[0]);
  const stack = GetRegister("$sp");
  stack.value = reg.value;
}

function pop(args: string[]) {
  const dest = GetRegister(args[0]);
  const stack = GetRegister("$sp");
  dest.value = stack.value;
}

function subfs(args: string[]): Error | void {
  const dest = GetRegister(args[0]);
  const stack = GetRegister("$sp");
  const val = stack.value - stack.value;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

const funcMappings: InstructionMapping = {
  addfs: {
    func: addfs,
    opCode: OpCodes.addfs,
  },
  dec: {
    func: dec,
    opCode: OpCodes.dec,
  },
  divs: {
    func: divs,
    opCode: OpCodes.divs,
  },
  inc: {
    func: inc,
    opCode: OpCodes.inc,
  },
  mulfs: {
    func: mulfs,
    opCode: OpCodes.mulfs,
  },
  pop: {
    func: pop,
    opCode: OpCodes.pop,
  },
  push: {
    func: push,
    opCode: OpCodes.push,
  },
  subfs: {
    func: subfs,
    opCode: OpCodes.subfs,
  },
  zero: {
    func: zero,
    opCode: OpCodes.zero,
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

const OneReg = { search };
export default OneReg;
