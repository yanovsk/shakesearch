//==========LIBRARIES===========//
import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";
import {
  AppBar,
  Box,
  Card,
  CardContent,
  Container,
  IconButton,
  TextField,
  Toolbar,
  Typography,
  Button,
  makeStyles,
} from "@material-ui/core";
//==========COMPONENTS===========//

import { SocketContext, socket } from "./socket_context.js";
import Home from "./Home";

const App = () => {
  return (
    <SocketContext.Provider value={socket}>
      <Routes>
        <Route index element={<Home />} />
      </Routes>
    </SocketContext.Provider>
  );
};

export default App;
