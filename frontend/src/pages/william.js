// App.js

import React, { useCallback, useEffect, useState } from "react";
import frame from "../assets/frame.png";
import logo from "../assets/logo.png";
import WS from "../assets/WS.svg";
import bg from "../assets/bg.png";

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
          message:
            "Imagine that you are William Shakespeare. Answer the following question in 200 words or less: " +
            inputValue,
        })
      );
      setLoading(true);
    },
    [inputValue]
  );

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div>
      <div
        className="character-talk-wrapper"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <img src={logo} style={{ width: 180, height: 100 }} />

        <div className="chat-and-pic">
          <div className="left-side">
            <img src={WS} style={{ width: 578, height: 458 }}></img>
            <p className="text"> Talking to William Shakespeare</p>
          </div>

          <div className="right-side">
            <div
              className="chat"
              style={{ backgroundImage: `url(${chat_frame})` }}
            >
              <div className="text-output">{message}</div>
              <p className="text-output">
                {isLoading ? "Great Question! Writing you an answer..." : ""}
              </p>
            </div>
            <br></br>

            <div className="prompt-box">
              <input
                className="input-field"
                type="text"
                value={inputValue}
                onChange={handleChange}
              />
              <button className="ask-btn" onClick={handleClick}>
                Ask this!
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default William;
