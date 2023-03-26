import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import GetContext from "./GetContext.js";

import { createHashRouter, RouterProvider, HashRouter } from "react-router-dom";

const router = createHashRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "get-context",
        element: <GetContext />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <RouterProvider router={router} />
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
