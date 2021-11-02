import ArgumentTypes from "../ArgumentTypes";
import AbstractRegister from "../../registers/AbstractRegister";
import {
  BoundsCheck,
  GetRegister,
  ValidateArgumentLength,
  ValidateArgumentTypes,
} from "../validationHelpers";
import {
  InstructionMapping,
  InstructionSize,
  MaxNumber,
  MinNumber,
} from "../InstructionInfo";
import DecToBinary from "../../DecToBinary";
import { InstructionWrapper } from "../instructionWrapper";
import OpCodes from "../OpCodes";

const argList = [ArgumentTypes.REG, ArgumentTypes.REG, ArgumentTypes.IM];
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
  immediate: number,
): string {
  const mapping = funcMappings[instr];
  if (mapping == null) {
    return `Failed to find opcode for ${instr}`;
  }
  const binary =
    mapping.opCode + dest.binary + first.binary + DecToBinary(immediate);
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
    return toBinary(inName, dest, first, +args[2]);
  };
}

function addi(args: string[]): Error | void {
  const [dest, first] = getRegisters(args);
  const immediate = +args[2];
  const val = first.value + immediate;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

function lshift(args: string[]) {
  const [dest, first] = getRegisters(args);
  const immediate = +args[2];
  const val = first.value << immediate;

  if (val > MaxNumber || val < MinNumber) {
    dest.value = 0;
    return;
  }
  dest.value = val;
}

function rshift(args: string[]) {
  const [dest, first] = getRegisters(args);
  const immediate = +args[2];
  dest.value = first.value >> immediate;
}

function divi(args: string[]): Error | void {
  const [dest, first] = getRegisters(args);
  const immediate = +args[2];

  if (immediate === 0) {
    return new Error("Divide by zero exception");
  }

  dest.value = Math.floor(first.value / immediate);
}

function expoi(args: string[]): Error | void {
  const [dest, first] = getRegisters(args);
  const immediate = +args[2];
  const val = Math.pow(first.value, immediate);
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

function muli(args: string[]): Error | void {
  const [dest, first] = getRegisters(args);
  const immediate = +args[2];
  const val = first.value * immediate;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

function subi(args: string[]): Error | void {
  const [dest, first] = getRegisters(args);
  const immediate = +args[2];
  const val = first.value - immediate;
  const check = BoundsCheck(val);

  if (check instanceof Error) return check;
  dest.value = val;
}

const funcMappings: InstructionMapping = {
  addi: {
    func: addi,
    opCode: OpCodes.addi,
  },
  divi: {
    func: divi,
    opCode: OpCodes.divi,
  },
  expoi: {
    func: expoi,
    opCode: OpCodes.expoi,
  },
  lshift: {
    func: lshift,
    opCode: OpCodes.lshift,
  },
  muli: {
    func: muli,
    opCode: OpCodes.muli,
  },
  rshift: {
    func: rshift,
    opCode: OpCodes.rshift,
  },
  subi: {
    func: subi,
    opCode: OpCodes.subi,
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

const TwoRegOneI = { search };
export default TwoRegOneI;
