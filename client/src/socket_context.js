import React from "react";

const location = document.location.host;
const url = `${document.location.protocol.replace(
  "http",
  "ws"
)}//${location}/ws?name`;
// init client websocket

export const socket = new WebSocket(url);
export const SocketContext = React.createContext();
