import React, { useState } from "react";
import axios from "axios";
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
  Skeleton,
  Box,
  Fade,
} from "@mui/material";

import Divider from "@mui/material/Divider";
import "./App.css";
import logo from "./assets/logo.png";
import GetContext from "./GetContext";
import ResultCard from "./ResultCard";

const URL = process.env.REACT_APP_URL;

function App() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showGetContext, setShowGetContext] = useState(false);
  const [summary, setSummary] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchExecuted, setSearchExecuted] = useState(false);
  const [loadLineContext, setLoadLineContext] = useState(false);
  const [loadExcerptContext, setLoadExcerptContext] = useState(false);
  const [topK, setTopK] = useState(5);
  const [hasTyped, setHasTyped] = useState(false);
  const [gptModel, setGptModel] = useState("gpt-4");

  // Defining state variable for context parameters used in GetContext component
  const [contextParams, setContextParams] = useState({
    play_name: "",
    act_scene: "",
    dialogue_lines: "",
    get_line_context_reply: "",
  });

  const handleSearch = async () => {
    //hide context window (in was open before) and show loading bar
    setShowGetContext(false);
    setIsLoading(true);

    const data = await fetchResults();
    setSearchExecuted(true);
    setIsLoading(false);

    if (data.length > 0) {
      setIsSummaryLoading(true);
      const summaryData = await fetchSummary(data);
      setSummary(summaryData);
      setIsSummaryLoading(false);
    }
  };

  const fetchResults = async () => {
    try {
      const response = await axios.post(
        `${URL}/search`,
        {
          query: searchQuery,
          top_k: topK,
          model: gptModel,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = response.data;
      setResults(data);
      return data;
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  const fetchSummary = async (matches_metadata) => {
    try {
      const response = await axios.post(
        `${URL}/get-summary`,
        {
          query: searchQuery,
          matches_metadata: matches_metadata,
          model: gptModel,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data.summary;
    } catch (error) {
      alert(error.response.data.error);
    }
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
    setShowGetContext(true);
    setLoadExcerptContext(true);
    setLoadLineContext(false);
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
    setShowGetContext(true);
    setLoadLineContext(true);
    setLoadExcerptContext(false);
  };

  const handleCloseContext = () => {
    setShowGetContext(false);
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
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 16,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <FormControl component="fieldset">
            <RadioGroup
              row
              aria-label="gpt-version"
              name="gpt-version"
              value={gptModel}
              onChange={(e) => setGptModel(e.target.value)}
            >
              <FormControlLabel
                value="gpt-3.5-turbo"
                control={<Radio />}
                label="GPT-3.5"
              />
              <FormControlLabel
                value="gpt-4"
                control={<Radio />}
                label="GPT-4"
              />
            </RadioGroup>
          </FormControl>
        </Box>
        <div className="search-wrapper">
          <a href="https://shakesearch4.herokuapp.com">
            <img src={logo} alt="logo" className="logo" />
          </a>
          <div className="search-field">
            <TextField
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search"
              variant="outlined"
              size="small"
              color="primary"
              style={{ width: 300 }}
            />
            <Button
              onClick={handleSearch}
              color="primary"
              size="medium"
              disabled={searchQuery.length === 0}
            >
              Search
            </Button>
          </div>
          {hasTyped && (
            <div className="top_relevant">
              <Typography className="top_rel_name" variant="body1">
                Top Relevant Results:
              </Typography>
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
            {/* Summary Card */}
            <div className="cards">
              <Card className="result-card summary-card">
                <CardContent>
                  <Divider
                    textAlign="left"
                    style={{ fontSize: 14, color: "gray" }}
                  >
                    Summary
                  </Divider>
                  {isSummaryLoading ? (
                    <div>
                      <Skeleton animation="wave" />
                      <Skeleton animation="wave" />
                      <Skeleton animation="wave" />
                    </div>
                  ) : (
                    <Typography variant="body1">{summary}</Typography>
                  )}
                </CardContent>
              </Card>

              {results.map((result, index) => {
                return (
                  <ResultCard
                    result={result}
                    handleGetContextClick={handleGetContextClick}
                    handleGetLineContextClick={handleGetLineContextClick}
                  />
                );
              })}
            </div>
            <div>
              {showGetContext && (
                <>
                  <Fade in={showGetContext}>
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
                        model={gptModel}
                      />
                    </div>
                  </Fade>
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
