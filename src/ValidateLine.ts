import ThreeReg from "./instructions/InstructionTypes/ThreeReg";
import ValidatedInstruction from "./instructions/ValidatedInstruction";
import { InstructionWrapper } from "./instructions/instructionWrapper";
import Memory from "./instructions/InstructionTypes/Memory";
import OneReg from "./instructions/InstructionTypes/OneReg";
import TwoRegOneI from "./instructions/InstructionTypes/TwoRegOneI";
import TwoReg from "./instructions/InstructionTypes/TwoReg";
import OneRegOneI from "./instructions/InstructionTypes/OneRegOneI";

const instructionSources = [
  ThreeReg.search,
  Memory.search,
  OneReg.search,
  TwoRegOneI.search,
  TwoReg.search,
  OneRegOneI.search,
];

function search(instruction: string): InstructionWrapper | null {
  for (const func of instructionSources) {
    const result = func(instruction);
    if (result != null) return result;
  }

  return null;
}

export default function ValidateLine(
  line: string,
  variables: { [key: string]: number },
): Error | ValidatedInstruction {
  const instructionSplit = line.split(" ");
  const instruction = instructionSplit[0];
  let instructionArguments = instructionSplit
    .slice(1)
    .join(" ")
    .split(",")
    .map((str) => str.trim());

  if (instructionArguments[0] === "") {
    instructionArguments = [];
  }

  const instructionInterface = search(instruction);
  if (instructionInterface === null) {
    return new Error(`Failed to find instruction '${instruction}'`);
  }

  const validationResults = instructionInterface.validator(
    instructionArguments,
    variables,
  );
  if (typeof validationResults != "string") {
    return new Error(`Validation error: ${validationResults.message}`);
  }

  const outputString = `${instruction}(${instructionArguments.join(", ")})`;

  return {
    run: () => instructionInterface.run(instructionArguments, variables),
    binary: validationResults,
    string: outputString,
  };
}
