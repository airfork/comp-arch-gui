export default interface ValidatedInstruction {
  run: () => void | Error | { [key: string]: number };
  binary: string;
  string: string;
}
