import { Grid, IconButton, Snackbar } from "@mui/material";
import React, { useState } from "react";
import "./App.css";
import ButtonBar from "./ButtonBar";
import CodeInput from "./CodeInput";
import RegisterList from "./RegisterList";
import { Registers } from "./registers/Registers";
import ValidatedInstruction from "./instructions/ValidatedInstruction";
import CloseIcon from "@mui/icons-material/Close";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import MemoryTable from "./MemoryTable";

export type RegisterValues = { name: string; value: number };
type severityLevels = "error" | "info" | "success" | "warning";

const defaultMessages: { [key in severityLevels]: string } = {
  error: "There are unresolved errors",
  success: "Code ran successfully",
  warning: "Enter some code in the text box below to run",
  info: "Step through has been stopped early",
};

function getRegisterList(): RegisterValues[] {
  const list = [];
  for (const reg in Registers) {
    list.push({ name: reg, value: Registers[reg].value });
  }
  return list;
}

function resetRegisters() {
  for (const reg in Registers) {
    Registers[reg].reset();
  }
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
  props,
  ref,
) {
  return <MuiAlert elevation={6} ref={ref} variant="standard" {...props} />;
});

export default function App() {
  const [consoleState, setConsoleState] = useState("");
  const [consoleErrors, setConsoleErrors] = useState(false);
  const [registerState, setRegisterState] = useState(getRegisterList());
  const [validatedInstructions, setValidatedInstructions] = useState<
    ValidatedInstruction[]
  >([]);
  const [open, setOpen] = useState(false);
  const [severity, setSeverity] = useState<severityLevels>("success");
  const [instructionPosition, setInstructionPosition] = useState(0);
  const [runDisabled, setRunDisabled] = useState(false);
  const [stopDisabled, setStopDisabled] = useState(true);
  const [alertMessage, setAlertMessage] = useState("");
  const [variableMap, setVariableMap] = useState<{ [key: string]: number }>({});

  function showMessage(severity: severityLevels, message = "") {
    if (message.length === 0) {
      message = defaultMessages[severity];
    }

    setSeverity(severity);
    setAlertMessage(message);
    setOpen(true);
  }

  const handleRunClick = () => {
    if (consoleErrors) {
      showMessage("error");
      return;
    }

    if (validatedInstructions.length === 0) {
      showMessage("warning");
      return;
    }

    setConsoleState("");
    resetRegisters();

    let consoleOutput = "";
    for (const instruction of validatedInstructions) {
      const result = instruction.run();
      if (result instanceof Error) {
        showMessage("error", "Early termination - runtime error encountered");
        setRegisterState(getRegisterList());
        consoleOutput += result.message;
        setConsoleState(consoleOutput);
        return;
      } else if (result != null) {
        setVariableMap(result);
      }

      consoleOutput += `${instruction.string} - ${instruction.binary}\n`;
    }

    showMessage("success");
    setRegisterState(getRegisterList());
    setConsoleState(consoleOutput);
  };

  const handleStepClick = () => {
    if (consoleErrors) {
      showMessage("error");
      return;
    }

    if (validatedInstructions.length === 0) {
      showMessage("warning");
      return;
    }

    // Have to do this check before instruction run
    // Otherwise the calculated value is overwritten
    if (instructionPosition === 0) {
      resetRegisters();
      setRunDisabled(true);
      setStopDisabled(false);
    }

    const instruction = validatedInstructions[instructionPosition];
    const result = instruction.run();
    if (result instanceof Error) {
      showMessage("error", "Early termination - runtime error encountered");
      setRegisterState(getRegisterList());

      if (instructionPosition === 0) {
        setConsoleState(result.message);
      } else {
        setConsoleState(consoleState + result.message);
      }

      setRunDisabled(false);
      setStopDisabled(true);
      setInstructionPosition(0);
      return;
    } else if (result != null) {
      setVariableMap(result);
    }

    // Have to do this check after instruction run
    // Setting console to state to empty string and running else
    // branch doesn't work. State variable hasn't been updated yet
    if (instructionPosition === 0) {
      setConsoleState(`${instruction.string} - ${instruction.binary}\n`);
    } else {
      setConsoleState(
        consoleState + `${instruction.string} - ${instruction.binary}\n`,
      );
    }

    setRegisterState(getRegisterList());

    if (instructionPosition + 1 === validatedInstructions.length) {
      showMessage("success");
      setInstructionPosition(0);

      setRunDisabled(false);
      setStopDisabled(true);
      return;
    }

    setInstructionPosition(instructionPosition + 1);
  };

  const handleStopClick = () => {
    setStopDisabled(true);
    setRunDisabled(false);
    setInstructionPosition(0);
    setConsoleState(consoleState + "\n---- User termination ----\n");
    showMessage("info");
  };

  const handleClose = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string,
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div className={"fullHeight"}>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={open}
        onClose={handleClose}
        autoHideDuration={6000}
        action={action}
      >
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {alertMessage}
        </Alert>
      </Snackbar>
      <ButtonBar
        handleRunClick={handleRunClick}
        handleStepClick={handleStepClick}
        handleStopClick={handleStopClick}
        runDisabled={runDisabled}
        stopState={stopDisabled}
      />
      <Grid id={"layout-grid"} container spacing={2} className={"fullHeight"}>
        <Grid item container xs={12} spacing={2}>
          <Grid item xs={2}>
            <div className={"container top-containers"}>
              <RegisterList registerState={registerState} />
            </div>
          </Grid>
          <Grid item xs={10}>
            <div className={"container top-containers"}>
              <CodeInput
                setConsoleState={setConsoleState}
                setValidatedInstructionState={setValidatedInstructions}
                setConsoleErrors={setConsoleErrors}
                setVariableMap={setVariableMap}
                variableMap={variableMap}
              />
            </div>
          </Grid>
        </Grid>
        <Grid container item xs={12} id={"bottom-grid"}>
          <Grid item xs={6}>
            <div className={"container"}>
              <MemoryTable variables={variableMap} />
            </div>
          </Grid>
          <Grid item xs={6}>
            <div className={"container"}>
              <textarea
                placeholder={"Console Output"}
                disabled
                value={consoleState}
              />
            </div>
          </Grid>
        </Grid>
      </Grid>
    </div>
  );
}
