import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import PlayCircleFilledWhiteSharpIcon from "@mui/icons-material/PlayCircleFilledWhiteSharp";
import NextPlanSharpIcon from "@mui/icons-material/NextPlanSharp";
import StopSharpIcon from "@mui/icons-material/StopSharp";

import { IconButton, Tooltip } from "@mui/material";

type ButtonBarProps = {
  handleRunClick: () => void;
  handleStepClick: () => void;
  handleStopClick: () => void;
  runDisabled: boolean;
  stopState: boolean;
};

export default function ButtonBar(props: ButtonBarProps) {
  return (
    <Box sx={{ flexGrow: 1 }} id={"button-bar"}>
      <AppBar position="static" color={"transparent"}>
        <Toolbar>
          <div id={"icon-div"}>
            <Tooltip title={"Run code"}>
              <IconButton
                disabled={props.runDisabled}
                onClick={props.handleRunClick}
              >
                <PlayCircleFilledWhiteSharpIcon fontSize={"large"} />
              </IconButton>
            </Tooltip>
            <Tooltip title={"Step through code"}>
              <IconButton onClick={props.handleStepClick}>
                <NextPlanSharpIcon fontSize={"large"} />
              </IconButton>
            </Tooltip>
            <Tooltip title={"Stop execution"}>
              <IconButton
                disabled={props.stopState}
                onClick={props.handleStopClick}
              >
                <StopSharpIcon fontSize={"large"} />
              </IconButton>
            </Tooltip>
          </div>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
