const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const DUNE_API_KEY = "YOUR_API_KEY"; // keep your real key here

// ✅ CACHE SETUP - 6 hours
let cachedData = null;
let lastFetched = null;
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

app.get("/top-minter-fees", async (req, res) => {
  try {
    const now = Date.now();

    // ✅ Return cached data if still fresh
    if (cachedData && lastFetched && (now - lastFetched) < CACHE_DURATION) {
      console.log("Serving from cache");
      return res.json(cachedData);
    }

    // ✅ Fetch fresh from Dune
    console.log("Fetching from Dune...");
    const response = await axios.get(
      "https://api.dune.com/api/v1/query/6951692/results",
      {
        headers: {
          "X-Dune-API-Key": DUNE_API_KEY,
        },
      }
    );

    cachedData = response.data.result.rows;
    lastFetched = now;

    res.json(cachedData);
  } catch (err) {
    console.error(err);
    // ✅ If Dune fails, return old cache instead of crashing
    if (cachedData) return res.json(cachedData);
    res.status(500).send("Error fetching data");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});