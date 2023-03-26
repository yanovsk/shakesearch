import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  LinearProgress,
  TextField,
  Typography,
  Button,
} from "@material-ui/core";
import Divider from "@mui/material/Divider";
import "./App.css";
import logo from "./assets/logo.png";
import axios from "axios";
import GetContext from "./GetContext";
import ResultCard from "./ResultCard";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchExecuted, setSearchExecuted] = useState(false);

  const [contextParams, setContextParams] = useState({
    play_name: "",
    act_scene: "",
    dialogue_lines: "",
  });

  const handleSearch = async () => {
    setShowExplanation(false);
    setIsLoading(true);

    // Await the results of both fetchResults and fetchSummary
    await Promise.all([fetchResults(), fetchSummary()]);
    setSearchExecuted(true); // Set searchExecuted to true
    setIsLoading(false);
  };

  const handleCloseContext = () => {
    setShowExplanation(false);
  };

  const fetchResults = async () => {
    const response = await fetch("http://localhost:5050/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: searchQuery }),
    });
    const data = await response.json();
    setResults(data);
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.post("http://localhost:5050/get-summary", {
        query: searchQuery,
      });

      setSummary(response.data.summary);
    } catch (err) {
      console.error(err);
    }
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
        {isLoading && <LinearProgress />}

        {!isLoading && searchExecuted && (
          <div className="card-and-expl">
            <div className="cards">
              <Card className="result-card">
                <CardContent>
                  <Divider
                    textAlign="left"
                    style={{ fontSize: 14, color: "gray" }}
                  >
                    Summary
                  </Divider>
                  <Typography variant="body1">{summary}</Typography>
                </CardContent>
              </Card>

              {results.map((result, index) => {
                return (
                  <ResultCard
                    key={index}
                    index={index}
                    result={result}
                    handleExplainClick={handleExplainClick}
                  />
                );
              })}
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
                      handleClose={handleCloseContext} // Pass the handleClose function as a prop
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
