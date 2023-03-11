// App.js
import React, { Component } from "react";
import "./App.css";
import { connect, sendMsg } from "./api";
import bg from "./assets/bg.png";
import frame from "./assets/frame.png";
import logo from "./assets/logo.png";

const App = () => {
  connect();

  const send = () => {
    console.log("hello");
    sendMsg("hello");
  };

  return (
    <div>
      <div className="top-picture">
        <img src={logo} />
        <p>WILLIAM</p>
      </div>
      <div className="character_selection">
        <div className="character">
          <img src={frame} />
          <button className="talk-to-button" onClick={send()}>
            Talk to William Shakespeare
          </button>
        </div>
        <div className="character">
          <img src={frame} />
          <button className="talk-to-button" onClick={send()}>
            Talk to Hamlet
          </button>
        </div>
        <div className="character">
          <img src={frame} />
          <button className="talk-to-button" onClick={send()}>
            Talk to Romeo And Juliet
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
