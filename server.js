const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { PineconeClient } = require("@pinecone-database/pinecone");
const pinecone = new PineconeClient();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = "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";
const PINECONE_API_KEY = "9df93080-ce48-466e-8608-0c9f964f6386";
const INDEX_NAME = "shake";

pinecone.init({
  apiKey: PINECONE_API_KEY,
  environment: "us-west4-gcp",
});

axios.defaults.headers.common["x-api-key"] = PINECONE_API_KEY;

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
          Authorization: `Bearer ${OPENAI_API_KEY}`,
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

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
