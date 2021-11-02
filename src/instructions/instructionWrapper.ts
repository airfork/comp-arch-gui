export interface InstructionWrapper {
  run: (
    args: string[],
    variables: { [key: string]: number },
  ) => void | Error | { [key: string]: number };
  validator: (
    args: string[],
    variables: { [key: string]: number },
  ) => Error | string;
}
