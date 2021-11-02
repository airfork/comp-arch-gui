export default function DecToBinary(val: number): string {
  if (val >= 0) {
    return val.toString(2).padStart(16, "0");
  }

  const partialBinary = (Math.abs(val) - 1).toString(2).padStart(16, "0");
  return flipBits(partialBinary);
}

function flipBits(binary: string): string {
  let output = "";
  for (const letter of binary) {
    if (letter === "0") {
      output += "1";
    } else if (letter === "1") {
      output += "0";
    }
  }

  return output;
}
