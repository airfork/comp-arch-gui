import ArgumentTypes from "./ArgumentTypes";
import { Registers } from "../registers/Registers";
import { MaxNumber, MinNumber } from "./InstructionInfo";
import AbstractRegister from "../registers/AbstractRegister";

export function ValidateArgumentLength(
  inName: string,
  argLength: number,
  expected: number,
): string | null {
  if (argLength < expected) {
    return `Too few arguments passed into ${inName}. Expected ${expected} but got ${argLength}`;
  }

  if (argLength > expected) {
    return `Too many arguments passed into ${inName}. Expected ${expected} but got ${argLength}`;
  }

  return null;
}

export function ValidateArgumentTypes(
  inName: string,
  args: string[],
  argTypes: ArgumentTypes[],
): string | null {
  // This should not happen as argument length should be validated before running this
  if (args.length != argTypes.length) {
    return `Argument length mismatch in ${inName}`;
  }

  const typesToStrings: { [key in ArgumentTypes]: string } = {
    [ArgumentTypes.REG]: "register",
    [ArgumentTypes.IM]: "immediate",
    [ArgumentTypes.VAR]: "variable",
  };

  const errorMessage = (pos: number, val: string, argType: ArgumentTypes) => {
    return `Argument in position ${pos} (${val}) is not a valid ${typesToStrings[argType]}`;
  };

  for (let i = 0; i < argTypes.length; i++) {
    const arg = args[i].trim();
    if (argTypes[i] == ArgumentTypes.REG) {
      if (!isRegister(arg)) {
        return errorMessage(i, arg, ArgumentTypes.REG);
      }
    } else if (argTypes[i] == ArgumentTypes.IM) {
      if (!isImmediate(arg)) {
        return errorMessage(i, arg, ArgumentTypes.IM);
      }
    } else if (argTypes[i] == ArgumentTypes.VAR) {
      if (!isVariable(arg)) {
        return errorMessage(i, arg, ArgumentTypes.VAR);
      }
    }
  }

  return null;
}

export function GetRegister(reg: string): AbstractRegister {
  reg = reg.trim();
  if (!isRegister(reg)) {
    throw new Error(`Failed to find register ${reg}`);
  }

  return Registers[reg];
}

function isRegister(val: string): boolean {
  return val.trim() in Registers;
}

function isImmediate(val: string): boolean {
  const numVal = +val;
  return !(isNaN(numVal) || numVal > MaxNumber || numVal < MinNumber);
}

function isVariable(val: string): boolean {
  return val.length > 0 && isNaN(+val);
}

export function BoundsCheck(num: number): Error | void {
  if (num > MaxNumber) {
    return new Error(`Number exceeded maximum limit: ${MaxNumber}`);
  }

  if (num < MinNumber) {
    return new Error(`Number exceeded minimum limit: ${MinNumber}`);
  }
}

export function OverflowNumber(num: number): number {
  if (num < MinNumber) {
    const mod = num % MinNumber;
    return OverflowNumber(MaxNumber + 1 + mod);
  }

  if (num > MaxNumber) {
    const mod = num % MaxNumber;
    return OverflowNumber(MinNumber - 1 + mod);
  }

  return num;
}
