import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

type memoryTableProps = {
  variables: { [key: string]: number };
};

type tableEntry = {
  address: string;
  variable: string;
  value: number;
};

export const MemoryStartingPoint = 100;

function mapEntries(variables: { [key: string]: number }): tableEntry[] {
  const entries = [];
  let count = MemoryStartingPoint;
  for (const variable in variables) {
    entries.push({
      address: "0x" + count.toString(16).padStart(4, "0"),
      variable,
      value: variables[variable],
    });

    count += 16;
  }

  return entries;
}

export default function MemoryTable(props: memoryTableProps) {
  const entries = mapEntries(props.variables);

  return (
    <TableContainer
      component={Paper}
      sx={{
        maxHeight: 276,
        width: "100%",
        tableLayout: "fixed",
      }}
    >
      <Table
        size={"small"}
        stickyHeader
        aria-label="simple table"
        sx={{ fontSize: "1.2rem" }}
      >
        <TableHead>
          <TableRow>
            <TableCell>Memory Address</TableCell>
            <TableCell>Variable</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entries.map((row) => (
            <TableRow
              key={row.address}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.address}
              </TableCell>
              <TableCell>{row.variable}</TableCell>
              <TableCell>{row.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
