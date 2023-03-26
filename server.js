const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { PineconeClient } = require("@pinecone-database/pinecone");
const pinecone = new PineconeClient();
require("dotenv").config();
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const app = express();
app.use(cors());
app.use(express.json());

const INDEX_NAME = "shake";

pinecone.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: "us-west4-gcp",
});

axios.defaults.headers.common["x-api-key"] = process.env.PINECONE_API_KEY;

app.post("/search", async (req, res) => {
  const query_text = req.body.query;

  // Vectorize query using OpenAI API
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
    topK: 5,
    includeValues: true,
    includeMetadata: true,
  };
  const queryResponse = await index.query({ queryRequest });
  console.log(queryResponse.matches);
  const matchesMetadata = queryResponse.matches.map((match) => match.metadata);
  res.json(matchesMetadata);
});

app.post("/get-context", async (req, res) => {
  const { play_name, act_scene, dialogue_lines } = req.body;
  const context = `I need more context about the following scene from "${play_name}":\n${act_scene}\n${dialogue_lines}`;

  const completion = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: context }],
  });
  console.log(completion.data.choices[0].message);
  res.json(completion.data.choices[0].message);
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
