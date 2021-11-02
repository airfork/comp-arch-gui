import ArgumentTypes from "../ArgumentTypes";
import { InstructionMapping, InstructionSize } from "../InstructionInfo";
import { InstructionWrapper } from "../instructionWrapper";
import {
  GetRegister,
  ValidateArgumentLength,
  ValidateArgumentTypes,
} from "../validationHelpers";
import AbstractRegister from "../../registers/AbstractRegister";
import DecToBinary from "../../DecToBinary";
import OpCodes from "../OpCodes";

const argList = [ArgumentTypes.REG, ArgumentTypes.IM];

function toBinary(
  instr: string,
  dest: AbstractRegister,
  immediate: number,
): string {
  const mapping = funcMappings[instr];
  if (mapping == null) {
    return `Failed to find opcode for ${instr}`;
  }
  const binary = mapping.opCode + dest.binary + DecToBinary(immediate);
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
    return toBinary(inName, dest, +args[1]);
  };
}

function li(args: string[]) {
  const dest = GetRegister(args[0]);
  dest.value = +args[1];
}

const funcMappings: InstructionMapping = {
  li: {
    func: li,
    opCode: OpCodes.li,
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

const OneRegOneI = { search };
export default OneRegOneI;
