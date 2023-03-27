import React, { useState, useRef } from "react";
import {
  Card,
  CardContent,
  LinearProgress,
  TextField,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@mui/material";

import Divider from "@mui/material/Divider";
import env from "react-dotenv";
import "./App.css";
import logo from "./assets/logo.png";
import axios from "axios";
import GetContext from "./GetContext";
import ResultCard from "./ResultCard";

// const URL = "http://localhost:5050";
const URL = "https://shakesearch5.herokuapp.com";

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [loadLineContext, setLoadLineContext] = useState(false);
  const [loadExcerptContext, setLoadExcerptContext] = useState(false);
  const [topK, setTopK] = useState(5);
  const [hasTyped, setHasTyped] = useState(false);

  const [contextParams, setContextParams] = useState({
    play_name: "",
    act_scene: "",
    dialogue_lines: "",
    get_line_context_reply: "",
  });

  const handleSearch = async () => {
    setShowExplanation(false);
    setIsLoading(true);

    // Await the results of both fetchResults and fetchSummary
    await Promise.all([fetchResults(), fetchSummary()]);
    setSearchExecuted(true); // Set searchExecuted to true
    setIsLoading(false);
  };

  const handleGetContextClick = async (
    play_name,
    act_scene,
    dialogue_lines
  ) => {
    setContextParams({
      play_name,
      act_scene,
      dialogue_lines,
    });
    setShowExplanation(true);
    setLoadExcerptContext(true); // Set loadExcerptContext to true
    setLoadLineContext(false); // Set loadLineContext to false
  };

  const handleGetLineContextClick = async (
    play_name,
    act_scene,
    dialogue_lines,
    selectedText
  ) => {
    setContextParams({
      play_name,
      act_scene,
      dialogue_lines,
      selectedText,
    });
    setShowExplanation(true);
    setLoadLineContext(true); // Set loadLineContext to true
    setLoadExcerptContext(false); // Set loadExcerptContext to false
  };

  const handleCloseContext = () => {
    setShowExplanation(false);
  };

  const fetchResults = async () => {
    const response = await fetch(URL + "/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: searchQuery, top_k: topK }),
    });
    const data = await response.json();
    setResults(data);
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.post(URL + "/get-summary", {
        query: searchQuery,
      });

      setSummary(response.data.summary);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (!hasTyped && e.target.value.length > 0) {
      setHasTyped(true);
    } else if (hasTyped && e.target.value.length === 0) {
      setHasTyped(false);
    }
  };

  return (
    <div className="wrapper">
      <div>
        <div className="search-wrapper">
          <img src={logo} alt="logo" className="logo" />
          <div className="search-field">
            <TextField
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search"
              variant="outlined"
              size="small"
              style={{ width: 300 }}
            />
            <Button onClick={handleSearch} color="primary" size="medium">
              Search
            </Button>
          </div>
          {hasTyped && (
            <div className="top_relevant">
              <Typography className="top_rel_name" variant="body1">
                Top Relevant Results:
              </Typography>{" "}
              <div className="top_rel_sel">
                <FormControl component="fieldset" style={{ marginLeft: 10 }}>
                  <RadioGroup
                    row
                    aria-label="top-k"
                    name="top-k"
                    value={topK}
                    size="small"
                    onChange={(e) => setTopK(parseInt(e.target.value))}
                  >
                    <FormControlLabel value={5} control={<Radio />} label="5" />
                    <FormControlLabel
                      value={10}
                      control={<Radio />}
                      label="10"
                    />
                    <FormControlLabel
                      value={15}
                      control={<Radio />}
                      label="15"
                    />
                  </RadioGroup>
                </FormControl>
              </div>
            </div>
          )}
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
                    handleGetContextClick={handleGetContextClick}
                    handleGetLineContextClick={handleGetLineContextClick}
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
                      selectedText={contextParams.selectedText}
                      loadLineContext={loadLineContext}
                      loadExcerptContext={loadExcerptContext}
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
