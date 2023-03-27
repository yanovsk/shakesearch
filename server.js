const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
require("dotenv").config();
const path = require("path");

const { Configuration, OpenAIApi } = require("openai");
const { PineconeClient } = require("@pinecone-database/pinecone");
const pinecone = new PineconeClient();
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

//-----SEARCH-----
pinecone.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: "us-west4-gcp",
});

axios.defaults.headers.common["x-api-key"] = process.env.PINECONE_API_KEY;

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

// ...

// Catch-all route to serve the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

app.post("/search", async (req, res) => {
  const query_text = req.body.query;

  const openai_res = await axios
    .post(
      "https://api.openai.com/v1/embeddings",
      {
        input: query_text,
        model: "text-embedding-ada-002",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    )
    .catch((error) => {
      console.error(error);
    });

  const query_vector = openai_res.data.data[0].embedding;

  const index = pinecone.Index("shake");
  const queryRequest = {
    vector: query_vector,
    topK: req.body.top_k,
    includeValues: true,
    includeMetadata: true,
  };
  const queryResponse = await index.query({ queryRequest });
  const matchesMetadata = queryResponse.matches.map((match) => match.metadata);
  res.json(matchesMetadata);
});

//CHAT
let chatHistory = [];

app.post("/get-context", async (req, res) => {
  const { play_name, act_scene, dialogue_lines } = req.body;
  const context = `Provide more context about Shakespeare's play "${play_name}":\n${act_scene}\n${dialogue_lines}`;
  chatHistory.push({ role: "system", content: context });

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: context }],
  });

  chatHistory.push(completion.data.choices[0].message);
  console.log("Push", chatHistory);
  res.json(completion.data.choices[0].message);
});

app.post("/get-summary", async (req, res) => {
  const { query } = req.body;
  const summary_prompt = `Provide a short summary about the search results related to "${query}" in Shakespeare's plays.`;

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: summary_prompt }],
  });

  res.json({ summary: completion.data.choices[0].message.content });
});

app.post("/chat", async (req, res) => {
  //add the most recent message
  chatHistory.push(req.body);

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: chatHistory,
  });
  chatHistory.push(completion.data.choices[0].message);
  console.log(chatHistory);
  res.json(completion.data.choices[0].message);
});

app.post("/reset-chat-history", (req, res) => {
  chatHistory = [];
  res.status(200).json({ message: "Chat history reset" });
  console.log("reset:", chatHistory);
});

app.post("/get-line-context", async (req, res) => {
  console.log(req.body);

  const { play_name, act_scene, dialogue_lines, selectedText } = req.body;
  const prompt = `In the play "${play_name}" by William Shakespeare, there is a line: "${selectedText}". This line is from ${act_scene}. The surrounding dialogue is as follows: ${dialogue_lines}. Please provide more context and explain the significance of this line in the play.`;

  chatHistory.push({ role: "system", content: prompt });
  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "system", content: prompt }],
  });
  chatHistory.push(completion.data.choices[0].message);
  console.log("Getting line context", completion.data.choices[0].message);
  res.json(completion.data.choices[0].message);
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
