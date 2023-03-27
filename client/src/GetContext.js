import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./App.css";
import CloseIcon from "@mui/icons-material/Close";

import {
  Card,
  CardContent,
  Typography,
  TextField,
  LinearProgress,
  Button,
  IconButton,
  Icon,
} from "@mui/material";

// const URL = "http://localhost:5050";
const URL = "https://shakesearch4.herokuapp.com";

function GetContext({
  play_name,
  act_scene,
  dialogue_lines,
  handleClose,
  selectedText,
  loadLineContext,
  loadExcerptContext,
}) {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const chatContainerRef = useRef();

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const resetChatHistory = async () => {
    try {
      await axios.post(URL + "/reset-chat-history");
    } catch (err) {
      console.error(err);
    }
  };

  const getInitialContext = async () => {
    await resetChatHistory();
    setLoading(true);
    try {
      const response = await axios.post(URL + "/get-context", {
        play_name,
        act_scene,
        dialogue_lines,
      });

      setChatHistory((prevState) => [
        ...prevState,
        { message: response.data.content, sender: "Assistant" },
      ]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const getReplyToLineContex = async () => {
    await resetChatHistory();
    setLoading(true);
    try {
      const response = await axios.post(URL + "/get-line-context", {
        play_name,
        act_scene,
        dialogue_lines,
        selectedText,
      });

      setChatHistory((prevState) => [
        ...prevState,
        { message: response.data.content, sender: "Assistant" },
      ]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (loadExcerptContext) {
      getInitialContext();
    }
  }, [loadExcerptContext]);

  useEffect(() => {
    if (loadLineContext) {
      getReplyToLineContex();
    }
  }, [loadLineContext]);

  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const sendMessage = async () => {
    if (userInput.trim() === "") return;
    setUserInput("");

    setChatHistory((prevState) => [
      ...prevState,
      { message: userInput, sender: "User" },
    ]);
    setLoading(true);
    try {
      const chat_response = await axios.post(URL + "/chat", {
        role: "user",
        content: userInput,
      });

      setChatHistory((prevState) => [
        ...prevState,
        { message: chat_response.data.content, sender: "Assistant" },
      ]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Card className="GetContext">
      <div style={{ position: "absolute", top: 8, right: 16 }}>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon sx={{ fontSize: 15 }} onClick={handleClose} />
        </IconButton>
      </div>

      <CardContent className="chat-and-input">
        <div className="chat-container" ref={chatContainerRef}>
          {chatHistory.map((entry, index) => (
            <div
              key={index}
              className={`chat-message ${entry.sender.toLowerCase()}`}
            >
              <Typography
                variant="caption"
                align="right"
                style={{ color: "gray" }}
              >
                {entry.sender}
              </Typography>
              <Typography variant="body1" align="left">
                {entry.message}
              </Typography>
            </div>
          ))}
          {loading && <LinearProgress />}
        </div>
        <div className="message-input">
          <TextField
            variant="outlined"
            size="small"
            value={userInput}
            onChange={handleUserInputChange}
            placeholder="Type your message..."
            fullWidth
          />
          <Button onClick={sendMessage} color="primary" size="medium">
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default GetContext;
