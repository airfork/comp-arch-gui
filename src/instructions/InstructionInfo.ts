export type InstructionMapping = {
  [key: string]: {
    func: (args: string[], variables: { [key: string]: number }) => void;
    opCode: string;
  };
};

export const InstructionSize = 30;
export const MaxNumber = 32767;
export const MinNumber = -32768;
