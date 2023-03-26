// src/App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  LinearProgress,
  Button,
} from "@material-ui/core";
function GetContext({ play_name, act_scene, dialogue_lines }) {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const getInitialContext = async () => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5050/get-context", {
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

  useEffect(() => {
    getInitialContext();
  }, [play_name, act_scene, dialogue_lines]);

  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    setChatHistory((prevState) => [
      ...prevState,
      { message: userInput, sender: "user" },
    ]);
    setLoading(true);
    try {
      const chat_response = await axios.post("http://localhost:5050/chat", {
        message: userInput,
        play_name,
        act_scene,
        dialogue_lines,
      });

      setChatHistory((prevState) => [
        ...prevState,
        { message: chat_response.data.message, sender: "Assistant" },
      ]);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);

    setUserInput("");
  };

  return (
    <Card className="GetContext">
      <CardContent className="chat-and-input">
        {loading && <LinearProgress />}
        <div className="chat-container">
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
        </div>
        <div className="search-field">
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
