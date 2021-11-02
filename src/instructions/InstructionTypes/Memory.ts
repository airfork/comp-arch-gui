import ArgumentTypes from "../ArgumentTypes";
import {
  GetRegister,
  ValidateArgumentLength,
  ValidateArgumentTypes,
} from "../validationHelpers";
import { InstructionMapping, InstructionSize } from "../InstructionInfo";
import OpCodes from "../OpCodes";
import { InstructionWrapper } from "../instructionWrapper";
import { MemoryStartingPoint } from "../../MemoryTable";
import DecToBinary from "../../DecToBinary";
import AbstractRegister from "../../registers/AbstractRegister";

const argList = [ArgumentTypes.REG, ArgumentTypes.VAR];

function getRegister(regName: string): AbstractRegister {
  return GetRegister(regName);
}

function toBinary(instr: string, reg: AbstractRegister) {
  const mapping = funcMappings[instr];
  if (mapping == null) {
    return `Failed to find opcode for ${instr}`;
  }
  return mapping.opCode + reg.binary;
}

function validator(
  inName: string,
): (args: string[], variables: { [p: string]: number }) => Error | string {
  return (args: string[], variables: { [key: string]: number }) => {
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

    if (!(args[1] in variables)) {
      return new Error(`The variable ${args[1]} is not defined`);
    }

    let memoryValue = MemoryStartingPoint;
    for (const variable in variables) {
      if (variable === args[1]) {
        break;
      }
      memoryValue += 16;
    }

    const reg = getRegister(args[0]);
    const binary = toBinary(inName, reg) + DecToBinary(memoryValue);
    return binary + "0".repeat(InstructionSize - binary.length);
  };
}

function lw(args: string[], variables: { [key: string]: number }) {
  const reg = getRegister(args[0]);
  reg.value = variables[args[1]];
}

function sw(
  args: string[],
  variables: { [key: string]: number },
): { [key: string]: number } {
  const reg = getRegister(args[0]);
  variables[args[1]] = reg.value;
  return variables;
}

const funcMappings: InstructionMapping = {
  lw: {
    func: lw,
    opCode: OpCodes.lw,
  },
  sw: {
    func: sw,
    opCode: OpCodes.sw,
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

const Memory = { search };
export default Memory;
