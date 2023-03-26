import React, { useState } from "react";
import {
  Card,
  CardContent,
  Container,
  TextField,
  Typography,
  Button,
} from "@material-ui/core";
import Divider from "@mui/material/Divider";
import "./App.css";
import logo from "./assets/logo.png";
import axios from "axios";
import GetContext from "./GetContext";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const [contextParams, setContextParams] = useState({
    play_name: "",
    act_scene: "",
    dialogue_lines: "",
  });

  const handleSearch = async () => {
    setShowExplanation(false);
    const response = await fetch("http://localhost:5050/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: searchQuery }),
    });
    const data = await response.json();
    setResults(data);
  };

  const handleExplainClick = async (play_name, act_scene, dialogue_lines) => {
    setContextParams({
      play_name,
      act_scene,
      dialogue_lines,
    });
    setShowExplanation(true);
  };

  function formatDialogue(dialogue) {
    return dialogue.split("\n").map((line, index) => (
      <Typography key={index} variant="body1">
        {line}
      </Typography>
    ));
  }

  return (
    <div className="wrapper">
      <div>
        <div className="search-wrapper">
          <img src={logo} alt="logo" className="logo" />
          <div className="search-field">
            <TextField
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
              variant="outlined"
              size="small"
              style={{ width: 300 }}
            />
            <Button onClick={handleSearch} color="primary" size="medium">
              Search
            </Button>
          </div>
          <br />
        </div>
        <div className="card-and-expl">
          <div className="card">
            {results.map((result, index) => (
              <Card key={index} className="result-card">
                <CardContent>
                  <Divider
                    textAlign="left"
                    style={{ fontSize: 14, color: "gray" }}
                  >
                    Title and Scene
                  </Divider>

                  <Typography variant="h6">{result.play_name}</Typography>
                  <Typography variant="subtitle1">
                    {result.act_scene}
                  </Typography>
                  <Divider
                    textAlign="left"
                    style={{ fontSize: 14, color: "gray" }}
                  >
                    Excerpt
                  </Divider>
                  {formatDialogue(result.dialogue_lines)}
                  <Divider style={{ marginTop: 10 }} />

                  <Button
                    variant="outlined"
                    className="#outlined-buttons"
                    style={{ width: 150, height: 30, marginTop: 10 }}
                    onClick={() =>
                      handleExplainClick(
                        result.play_name,
                        result.act_scene,
                        result.dialogue_lines
                      )
                    }
                  >
                    Get Context
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <div>
            {showExplanation && (
              <>
                <div className="context">
                  <GetContext
                    key={`${contextParams.play_name}-${contextParams.act_scene}-${contextParams.dialogue_lines}`}
                    play_name={contextParams.play_name}
                    act_scene={contextParams.act_scene}
                    dialogue_lines={contextParams.dialogue_lines}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
