// App.js

import React, { useCallback, useEffect, useState } from "react";
import frame from "../assets/frame.png";
import chat_frame from "../assets/frame_chat.png";

var socket = new WebSocket("ws://localhost:8080/ws");
const William = () => {
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    socket.onopen = () => {};

    socket.onmessage = (e) => {
      setLoading(false);

      setMessage(JSON.parse(e.data));
    };
  }, []);

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      socket.send(
        JSON.stringify({
          message: "Imagine that you are William Shakespeare " + inputValue,
        })
      );
      setLoading(true);
    },
    [inputValue]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  return (
    <div className="character-talk-wrapper">
      <div className="left-side">
        <img src={frame}></img>
      </div>

      <div className="right-side">
        <div className="chat" style={{ backgroundImage: `url(${chat_frame})` }}>
          <div className="text-output">
            <td>
              {message.split("\n").map((paragraph) => (
                <p> {paragraph} </p>
              ))}
            </td>
            <p>{isLoading ? "loading..." : ""}</p>
          </div>
        </div>
        <div className="prompt-box">
          <input
            className="input-field"
            id="input"
            type="text"
            value={inputValue}
            onChange={handleChange}
          />
          <button onClick={handleClick}>Ask</button>
        </div>
      </div>
    </div>
  );
};

export default William;
