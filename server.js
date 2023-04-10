const express = require("express");
const cors = require("cors");
const axios = require("axios");
const bodyParser = require("body-parser");
const path = require("path");
const rateLimit = require("express-rate-limit");
const Joi = require("joi");

const { Configuration, OpenAIApi } = require("openai");
const { PineconeClient } = require("@pinecone-database/pinecone");
const pinecone = new PineconeClient();
const app = express();
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, "client/build")));

// Catch-all route to serve the React app
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build", "index.html"));
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60, // Limit each IP to 60 requests per windowMs
  message: {
    status: 429, // HTTP status code for "Too Many Requests"
    error: "Too many requests, please try again later.",
  },
});

app.use("/search", apiLimiter);
app.use("/get-summary", apiLimiter);
app.use("/get-context", apiLimiter);
app.use("/chat", apiLimiter);
app.use("/reset-chat-history", apiLimiter);
app.use("/get-line-context", apiLimiter);

//-----SEARCH-----//
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

pinecone.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: "us-west4-gcp",
});

axios.defaults.headers.common["x-api-key"] = process.env.PINECONE_API_KEY;

//JOI Schema
const searchSchema = Joi.object({
  query: Joi.string().required(),
  top_k: Joi.number().integer().min(1).required(),
  model: Joi.string().required(),
});

app.post("/search", async (req, res) => {
  try {
    const { error, value } = searchSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { query: queryText, top_k: topK } = value;

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

const getSummarySchema = Joi.object({
  query: Joi.string().required(),
  matches_metadata: Joi.array().items(Joi.object().required()).required(),
  model: Joi.string().optional(),
});

app.post("/get-summary", async (req, res) => {
  const { error, value } = getSummarySchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const {
    query: query_text,
    matches_metadata: matches_metadata,
    model: model,
  } = value;

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
const chat_histories = new Map();

const getContextSchema = Joi.object({
  play_name: Joi.string().required(),
  act_scene: Joi.string().required(),
  dialogue_lines: Joi.string().required(),
  model: Joi.string().required(),
  userId: Joi.string().required(),
});

app.post("/get-context", async (req, res) => {
  const { error, value } = getContextSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { play_name, act_scene, dialogue_lines, model, userId } = value;

  const context = `Consider Shakespear's "${play_name}":\n${act_scene}\n. 
                  In 120 words provide more context about the following dialogue in this scene: ${dialogue_lines}`;

  console.log(userId);
  const chat_history = chat_histories.get(userId) || [];

  chat_history.push({ role: "system", content: context });

  const completion = await openai.createChatCompletion({
    model: model || "gpt-4",
    messages: [{ role: "system", content: context }],
  });

  chat_history.push(completion.data.choices[0].message);
  chat_histories.set(userId, chat_history);

  res.json(completion.data.choices[0].message);
});

const chatSchema = Joi.object({
  role: Joi.string().valid("user", "assistant").required(),
  content: Joi.string().required(),
  model: Joi.string().required(),
  userId: Joi.string().required(),
});

app.post("/chat", async (req, res) => {
  const { error, value } = chatSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  // Add the most recent message
  const { role, content, model, userId } = value;
  const chat_history = chat_histories.get(userId) || [];
  chat_history.push({ role, content });

  const completion = await openai.createChatCompletion({
    model: model || "gpt-4",
    messages: chat_history,
  });
  chat_history.push(completion.data.choices[0].message);
  chat_histories.set(userId, chat_history);

  res.json(completion.data.choices[0].message);
});

app.post("/reset-chat-history", (req, res) => {
  const userId = req.body.userId;
  if (userId) {
    chat_histories.delete(userId);
    res.status(200).json({ message: "Chat history reset for user" });
  } else {
    res.status(400).json({ message: "User ID is missing" });
  }
});

const getLineContextSchema = Joi.object({
  play_name: Joi.string().required(),
  act_scene: Joi.string().required(),
  dialogue_lines: Joi.string().required(),
  selectedText: Joi.string().required(),
  model: Joi.string().optional(),
  userId: Joi.string().optional(),
});

app.post("/get-line-context", async (req, res) => {
  const { error, value } = getLineContextSchema.validate(req.body);

  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { play_name, act_scene, dialogue_lines, selectedText, model, userId } =
    value;
  const chat_history = chat_histories.get(userId) || [];

  const prompt = `Consider the line "${selectedText}" from the play "${play_name}" by William Shakespeare. 
    This line is from ${act_scene}. The surrounding dialogue is as follows: ${dialogue_lines}. 
    In 80 words provide more context to this line and/or explain the significance of this line in the ${act_scene}.`;

  chat_history.push({ role: "system", content: prompt });
  const completion = await openai.createChatCompletion({
    model: model || "gpt-4",
    messages: [{ role: "system", content: prompt }],
  });
  chat_history.push(completion.data.choices[0].message);
  chat_histories.set(userId, chat_history);
  res.json(completion.data.choices[0].message);
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
