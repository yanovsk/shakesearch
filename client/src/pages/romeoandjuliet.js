import React, { useCallback, useEffect, useState } from "react";
import logo from "../assets/logo.svg";
import bg from "../assets/bg.png";
import rnadj from "../assets/randj.png";
import chat_frame from "../assets/frame_chat.png";

var socket = new WebSocket("ws://localhost:8080/ws");
const Hamlet = () => {
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
            "Imagine that you are either Romeo or Juliet from William Shakespeare's play. Answer the following question only as either Romeo or Juliet (in 200 words or less): " +
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
        <img src={logo} style={{ width: 230, height: 140 }} />

        <div className="chat-and-pic">
          <div className="left-side">
            <img src={rnadj} style={{ width: 578, height: 458 }}></img>
            <p className="text"> A conversation with Romeo and Juliet </p>
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

export default Hamlet;
