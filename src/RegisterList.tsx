import * as React from "react";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { ListSubheader, Typography } from "@mui/material";
import { RegisterValues } from "./App";

type RegisterListProps = { registerState: RegisterValues[] };

export default function RegisterList(props: RegisterListProps) {
  return (
    <Box sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
      <nav aria-label="main mailbox folders">
        <List
          subheader={
            <ListSubheader component="div" id={"register-list"}>
              Registers
            </ListSubheader>
          }
        >
          {props.registerState.map((reg) => {
            return (
              <ListItem key={reg.name}>
                <ListItemText>
                  <Typography
                    variant={"body1"}
                    className={"register-list-item"}
                  >
                    <strong>{reg.name}:</strong> &nbsp;&nbsp;&nbsp;&nbsp;
                    {reg.value}
                  </Typography>
                </ListItemText>
              </ListItem>
            );
          })}
        </List>
      </nav>
    </Box>
  );
}
