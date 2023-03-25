//==========LIBRARIES===========//
import React, { useContext } from "react";
import { Routes, Route } from "react-router-dom";

//==========COMPONENTS===========//
import William from "./pages/william.js";
import Hamlet from "./pages/hamlet.js";
import Home from "./Home.js";
import RomeoAndJuliet from "./pages/romeoandjuliet.js";

import { SocketContext, socket } from "./socket_context.js";

const App = () => {
  return (
    <SocketContext.Provider value={socket}>
      <Routes>
        <Route index element={<Home />} />
        <Route path="william" element={<William />} />
        <Route path="hamlet" element={<Hamlet />} />
        <Route path="romeoandjuliet" element={<RomeoAndJuliet />} />
      </Routes>
    </SocketContext.Provider>
  );
};

export default App;
