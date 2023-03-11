// App.js

import React, { Component, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
// import { connect, sendMsg } from "./api";
import william from "./pages/william";
import hamlet from "./pages/hamlet";
import romeoAndJuliet from "./pages/romeoandjuliet";

import bg from "./assets/bg.png";
import frame from "./assets/frame.png";
import logo from "./assets/logo.png";
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

  return (
    <div>
      <div className="top-picture">
        <img src={logo} style={{ width: 180, height: 100 }} />
      </div>
      <br></br>
      <div className="character_selection">
        <div className="character">
          <img src={frame} />
          <button className="talk-to-button" onClick={handleWilliam}>
            Talk to William Shakespeare
          </button>
        </div>
        <div className="character">
          <img src={frame} />
          <button className="talk-to-button">
            Talk toHamlet, Prince of Denmark
          </button>
        </div>
        <div className="character">
          <img src={frame} />
          <button className="talk-to-button">Talk to Romeo And Juliet</button>
        </div>
      </div>
    </div>
  );
};

export default App;
