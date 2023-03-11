// App.js

import React, { useCallback, useEffect, useState } from "react";
var socket = new WebSocket("ws://localhost:8080/ws");

const William = () => {
  const [message, setMessage] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    socket.onopen = () => {
      setMessage("Connected");
    };

    socket.onmessage = (e) => {
      setLoading(false);
      setMessage(e.data);
    };
  }, []);

  const handleClick = useCallback(
    (e) => {
      e.preventDefault();

      socket.send(
        JSON.stringify({
          message: "Imagine that you are William Shakespeare " + inputValue,
        })
      );
      setLoading(true);
    },
    [inputValue]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  return (
    <div className="App">
      <input
        id="input"
        type="text"
        value={inputValue}
        onChange={handleChange}
      />
      <button onClick={handleClick}>Send</button>
      <pre>{isLoading ? "loading..." : message}</pre>
    </div>
  );
};

export default William;
