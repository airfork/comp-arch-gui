import React, { ChangeEvent, useCallback, useEffect, useState } from "react";
import ValidateLine from "./ValidateLine";
import ValidatedInstruction from "./instructions/ValidatedInstruction";
import { MaxNumber, MinNumber } from "./instructions/InstructionInfo";

type CodeInputProps = {
  setConsoleState: React.Dispatch<React.SetStateAction<string>>;
  setValidatedInstructionState: React.Dispatch<
    React.SetStateAction<ValidatedInstruction[]>
  >;
  setConsoleErrors: React.Dispatch<React.SetStateAction<boolean>>;
  setVariableMap: React.Dispatch<React.SetStateAction<{ [p: string]: number }>>;
  variableMap: { [key: string]: number };
};

function parseVariable(
  line: string,
  variableMap: { [key: string]: number },
): string {
  const split = line.split(":");
  if (split.length !== 2 || split[1] === "") {
    return "Invalid variable declaration. Syntax - var: val";
  }

  const [name, value] = split;
  if (!isNaN(parseInt(name))) {
    return `Invalid variable name ${name}. Variable name cannot be a number`;
  }

  if (name in variableMap) {
    return `The variable ${name} has already been defined`;
  }

  const numValue = parseInt(value.trim());
  if (isNaN(numValue)) {
    return `The value '${value.trim()}' is not a number`;
  }

  if (numValue > MaxNumber) {
    return `The value, ${numValue}, is too large. ${MaxNumber} is the max`;
  }

  if (numValue < MinNumber) {
    return `The value, ${numValue}, is too small. ${MinNumber} is the min`;
  }

  variableMap[name] = numValue;
  return "";
}

export default function CodeInput(props: CodeInputProps) {
  const [value, setValue] = useState("");

  const handleErrors = useCallback(
    (errors: string[]) => {
      if (errors.length === 0) {
        props.setConsoleState("");
        props.setConsoleErrors(false);
        return;
      }

      const errString = errors.reduce((previousValue, currentValue) => {
        return `${previousValue}\n${currentValue}`;
      });

      props.setConsoleState(errString);
      props.setConsoleErrors(true);
    },
    [props.setConsoleState],
  );

  const parseInput = (text: string) => {
    const errors: string[] = [];
    const validatedInstructions: ValidatedInstruction[] = [];
    const variableMap: { [key: string]: number } = {};
    let variableMode = false;

    if (text.length !== 0) {
      text.split("\n").forEach((line, index) => {
        line = line.trim();
        if (line.length == 0) return;
        if (line.startsWith("variables:")) {
          variableMode = true;
          return;
        }

        if (!variableMode) {
          const validationResults = ValidateLine(line, props.variableMap);
          if (validationResults instanceof Error) {
            errors.push(`Line ${index + 1}: ${validationResults.message}`);
          } else {
            validatedInstructions.push(validationResults);
          }
        } else {
          const err = parseVariable(line, variableMap);
          if (err != "") {
            errors.push(`Line ${index + 1}: ${err}`);
          }
        }
      });

      handleErrors(errors);
    } else {
      // Clear console if there is no content in code box
      props.setConsoleState("");
      props.setConsoleErrors(false);
    }

    props.setVariableMap(variableMap);
    setValue(text);
    props.setValidatedInstructionState(validatedInstructions);
  };

  const handleOnChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      parseInput(event.target.value);
    },
    [props.setValidatedInstructionState],
  );

  useEffect(() => {
    parseInput(value);
  }, [value]);

  return (
    <textarea
      id={"code-input"}
      onChange={handleOnChange}
      placeholder={"Enter code here..."}
      value={value}
    />
  );
}
