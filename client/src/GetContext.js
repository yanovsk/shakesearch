// src/App.js
import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function GetContext({ play_name, act_scene, dialogue_lines }) {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);

  const handleUserInputChange = (e) => {
    setUserInput(e.target.value);
  };

  const sendMessage = async () => {
    if (userInput.trim() === "") return;

    setChatHistory((prevState) => [
      ...prevState,
      { message: userInput, sender: "user" },
    ]);

    try {
      const response = await axios.post("http://localhost:5050/chat", {
        message: userInput,
        play_name,
        act_scene,
        dialogue_lines,
      });

      setChatHistory((prevState) => [
        ...prevState,
        { message: response.data.message, sender: "Assistant" },
      ]);
    } catch (err) {
      console.error(err);
    }

    setUserInput("");
  };

  return (
    <div className="GetContext">
      <div className="chat-container">
        {chatHistory.map((entry, index) => (
          <div key={index} className={`chat-message ${entry.sender}`}>
            {entry.message}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={userInput}
          onChange={handleUserInputChange}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default GetContext;
