const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
const path = require("path");

const { Configuration, OpenAIApi } = require("openai");
const { PineconeClient } = require("@pinecone-database/pinecone");
const pinecone = new PineconeClient();
const app = express();

require("dotenv").config();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

// Catch-all route to serve the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

//-----SEARCH-----//
pinecone.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: "us-west4-gcp",
});

axios.defaults.headers.common["x-api-key"] = process.env.PINECONE_API_KEY;

app.post("/search", async (req, res) => {
  try {
    const { query: queryText, top_k: topK } = req.body;

    const openai_response = await axios.post(
      "https://api.openai.com/v1/embeddings",
      {
        input: queryText,
        model: "text-embedding-ada-002",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const queryVector = openai_response.data.data[0].embedding;
    const pinecone_index = pinecone.Index("shake");

    const queryRequest = {
      vector: queryVector,
      topK,
      includeValues: true,
      includeMetadata: true,
    };

    const queryResponse = await pinecone_index.query({ queryRequest });

    const matches_metadata = queryResponse.matches.map(
      //metadata is the actual text excerpt that we need to show as a result
      (match) => match.metadata
    );
    res.status(200).json(matches_metadata);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
});

app.post("/get-summary", async (req, res) => {
  const {
    query: query_text,
    matches_metadata: matches_metadata,
    model: model,
  } = req.body;

  //only send first 5 results to summarize
  const results_to_summarize = matches_metadata
    .slice(0, 5)
    //only provide name of the play and act scene
    .map((result) => `${result.play_name}\n${result.act_scene}\n`)
    .join("\n");

  const summary_prompt = `Provide a 100-word summary related to "${query_text}" in Shakespeare's plays:\n\n${results_to_summarize}`;

  const completion = await openai.createChatCompletion({
    model: model || "gpt-4",
    messages: [{ role: "system", content: summary_prompt }],
  });

  res.json({ summary: completion.data.choices[0].message.content });
});

//-----CHAT-----//
let chat_history = [];

app.post("/get-context", async (req, res) => {
  const { play_name, act_scene, dialogue_lines, model } = req.body;

  const context = `Consider Shakespear's "${play_name}":\n${act_scene}\n. 
                  In 120 words provide more context about the following dialogue in this scene: ${dialogue_lines}`;

  chat_history.push({ role: "system", content: context });

  const completion = await openai.createChatCompletion({
    model: model || "gpt-4",
    messages: [{ role: "system", content: context }],
  });

  chat_history.push(completion.data.choices[0].message);
  res.json(completion.data.choices[0].message);
});

app.post("/chat", async (req, res) => {
  // Add the most recent message
  const { role, content, model } = req.body;
  chat_history.push({ role, content });

  const completion = await openai.createChatCompletion({
    model: model || "gpt-4",
    messages: chat_history,
  });
  chat_history.push(completion.data.choices[0].message);
  res.json(completion.data.choices[0].message);
});

app.post("/reset-chat-history", (req, res) => {
  chat_history = [];
  res.status(200).json({ message: "Chat history reset" });
});

app.post("/get-line-context", async (req, res) => {
  const { play_name, act_scene, dialogue_lines, selectedText, model } =
    req.body;

  const prompt = `Consider the line "${selectedText}" from the play "${play_name}" by William Shakespeare. 
    This line is from ${act_scene}. The surrounding dialogue is as follows: ${dialogue_lines}. 
    In 80 words provide more context to this line and/or explain the significance of this line in the ${act_scene}.`;

  chat_history.push({ role: "system", content: prompt });
  const completion = await openai.createChatCompletion({
    model: model || "gpt-4",
    messages: [{ role: "system", content: prompt }],
  });
  chat_history.push(completion.data.choices[0].message);
  res.json(completion.data.choices[0].message);
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
