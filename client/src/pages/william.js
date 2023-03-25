// App.js

import React, { useCallback, useEffect, useState, useContext } from "react";
import logo from "../assets/logo.png";
import WS from "../assets/WS.svg";
import bg from "../assets/bg.png";
import { SocketContext } from "../socket_context.js";

import chat_frame from "../assets/frame_chat.png";

const William = () => {
  const socket = useContext(SocketContext);
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
            "Imagine that you are William Shakespeare. Answer the following question (in 200 words or less) and don't day that you are AI model: " +
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
        <a href="/">
          <img src={logo} style={{ width: 155, height: 85 }} />
        </a>
        <br />

        <div className="chat-and-pic">
          <div className="left-side">
            <img src={WS} style={{ width: 538, height: 428 }}></img>
            <p className="text"> A conversation with William Shakespeare</p>
          </div>

          <div className="right-side">
            <div
              className="chat"
              style={{ backgroundImage: `url(${chat_frame})` }}
            >
              <div className="text-output">{message}</div>
              <p className="text-output">
                {isLoading ? (
                  <>
                    <p className="writing-animation">
                      "Great Question! Writing you an answer...{" "}
                    </p>
                  </>
                ) : (
                  ""
                )}
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
