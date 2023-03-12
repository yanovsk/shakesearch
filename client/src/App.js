// App.js

import React, { Component, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import frame from "./assets/frame.png";
import logo from "./assets/logo.svg";
import ws_card from "./assets/ws_card.png";
import hamlet_card from "./assets/hamlet_card.png";
import randj_card from "./assets/randj_card.png";

var socket = new WebSocket("ws://localhost:8080/ws");

const App = () => {
  useEffect(() => {
    socket.onopen = () => {
      console.log("Successfully Connected");
    };
    socket.onmessage = (msg) => {
      console.log(msg);
    };
    socket.onclose = (event) => {
      console.log("Socket Closed Connection: ", event);
    };
    socket.onerror = (error) => {
      console.log("Socket Error: ", error);
    };
  }, []);
  let navigate = useNavigate();

  const handleWilliam = () => {
    navigate("/william");
  };
  const handleHamlet = () => {
    navigate("/hamlet");
  };
  const handleRandJ = () => {
    navigate("/romeoandjuliet");
  };

  return (
    <div className="home-wrapper">
      <div className="top-picture">
        <img src={logo} style={{ width: 230, height: 140 }} />
      </div>

      <div className="description">
        <p>
          Welcome to ShakeSearch where you can chat with the legendary William
          Shakespeare, as well as characters from two of his most famous plays -
          Hamlet and Romeo and Juliet. Using cutting-edge ChatGPT technology,
          ShakeSearch brings these characters to life, allowing you to ask them
          any questions you may have. Whether you're a Shakespeare enthusiast or
          just curious to learn more about his works, ShakeSearch offers a
          unique and immersive experience that is both entertaining and
          insightful. So, come and discover the wisdom of the Bard and his
          unforgettable characters!
        </p>
      </div>

      <div className="character_selection">
        <div className="character">
          <img src={ws_card} />
          <button className="talk-to-button" onClick={handleWilliam}>
            Talk to William Shakespeare
          </button>
        </div>
        <div className="character">
          <img src={hamlet_card} />
          <button className="talk-to-button" onClick={handleHamlet}>
            Talk to Hamlet, Prince of Denmark
          </button>
        </div>
        <div className="character">
          <img src={randj_card} />

          <button className="talk-to-button" onClick={handleRandJ}>
            Talk to Romeo and Juliet
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
