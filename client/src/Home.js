import React, { useState } from "react";
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
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import logo from "./assets/logo.png";

const useStyles = makeStyles((theme) => ({
  searchContainer: {
    display: "flex",
    alignItems: "center",
  },
  searchBar: {
    flexGrow: 1,
    marginRight: theme.spacing(1),
  },
  logo: {
    maxHeight: "50px",
    marginBottom: theme.spacing(2),
  },
  resultCard: {
    marginBottom: theme.spacing(2),
  },
  explanationCard: {
    position: "fixed",
    top: "10%",
    right: "5%",
    padding: theme.spacing(2),
    width: "300px",
  },
}));

function Home() {
  const classes = useStyles();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [showExplanation, setShowExplanation] = useState(false);
  const handleSearch = async () => {
    const response = await fetch("http://localhost:5050/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: searchQuery }),
    });
    const data = await response.json();
    setResults(data);
  };

  const handleExplainClick = () => {
    setShowExplanation(!showExplanation);
  };

  function formatDialogue(dialogue) {
    return dialogue.split("\n").map((line, index) => (
      <Typography key={index} variant="body1">
        {line}
      </Typography>
    ));
  }

  return (
    <Container maxWidth="sm">
      <AppBar position="static">
        <Toolbar>
          <Box className={classes.searchContainer}>
            <img src={logo} alt="logo" className={classes.logo} />
            <TextField
              className={classes.searchBar}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search"
            />
            <IconButton onClick={handleSearch}>
              <SearchIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {results.map((result, index) => (
        <Card key={index} className={classes.resultCard}>
          <CardContent>
            <Typography variant="h6">{result.play_name}</Typography>
            <Typography variant="subtitle1">{result.act_scene}</Typography>
            {formatDialogue(result.dialogue_lines)}
            <Button
              variant="contained"
              color="primary"
              onClick={handleExplainClick}
            >
              Explain
            </Button>
          </CardContent>
        </Card>
      ))}
      {showExplanation && (
        <Card className={classes.explanationCard} elevation={3}>
          <CardContent>
            <Typography variant="h6">Explanation</Typography>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}

export default Home;
