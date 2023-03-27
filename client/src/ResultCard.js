import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Popover,
} from "@material-ui/core";
import Divider from "@mui/material/Divider";
import axios from "axios";

const ResultCard = ({
  result,
  handleGetContextClick,
  handleGetLineContextClick,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [popOverPosition, setPopOverPosition] = useState({
    vertical: "top",
    horizontal: "left",
  });

  const handleMouseUp = (event) => {
    const selectedText = window.getSelection().toString();
    if (selectedText && selectedText.trim() !== "") {
      setAnchorEl(event.currentTarget);
      setPopOverPosition({
        vertical: event.clientY - 20,
        horizontal: event.clientX + 20,
      });
    } else {
      setAnchorEl(null);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? "get-line-context-popover" : undefined;

  return (
    <Card className="result-card">
      <CardContent onMouseUp={handleMouseUp}>
        <Divider textAlign="left" style={{ fontSize: 14, color: "gray" }}>
          Title and Scene
        </Divider>

        <Typography variant="h6">{result.play_name}</Typography>
        <Typography variant="subtitle1">{result.act_scene}</Typography>
        <Divider textAlign="left" style={{ fontSize: 14, color: "gray" }}>
          Excerpt
        </Divider>
        {result.dialogue_lines.split("\n").map((line, index) => (
          <Typography key={index} variant="body1">
            {line}
          </Typography>
        ))}
        <Divider style={{ marginTop: 10 }} />
        <Button
          variant="outlined"
          className="#outlined-buttons"
          style={{ width: 150, height: 30, marginTop: 10 }}
          onClick={() =>
            handleGetContextClick(
              result.play_name,
              result.act_scene,
              result.dialogue_lines
            )
          }
        >
          Get Context
        </Button>
      </CardContent>
      <Popover
        id={id}
        open={open}
        anchorReference="anchorPosition"
        anchorPosition={{
          top: popOverPosition.vertical,
          left: popOverPosition.horizontal,
        }}
        onClose={handleClose}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <Button
          variant="outlined"
          className="#outlined-buttons"
          size="small"
          onClick={() => {
            const selectedText = window.getSelection().toString();
            handleGetLineContextClick(
              result.play_name,
              result.act_scene,
              result.dialogue_lines,
              selectedText
            );
            handleClose();
          }}
        >
          Get Line Context
        </Button>
      </Popover>
    </Card>
  );
};

export default ResultCard;
