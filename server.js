const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const DUNE_API_KEY = "YOUR_API_KEY"; // keep your real key here

// ✅ CACHE SETUP - 6 hours
let cache = {
  topMinters: { data: null, lastFetched: null },
  rewardPool: { data: null, lastFetched: null },
  regFees: { data: null, lastFetched: null },
  gasFees: { data: null, lastFetched: null },
};
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

// ✅ HELPER FUNCTION
async function fetchWithCache(cacheKey, queryId) {
  const now = Date.now();
  const cached = cache[cacheKey];

  if (cached.data && cached.lastFetched && (now - cached.lastFetched) < CACHE_DURATION) {
    console.log(`Serving ${cacheKey} from cache`);
    return cached.data;
  }

  console.log(`Fetching ${cacheKey} from Dune...`);
  const response = await axios.get(
    `https://api.dune.com/api/v1/query/${queryId}/results`,
    {
      headers: { "X-Dune-API-Key": DUNE_API_KEY },
    }
  );

  cache[cacheKey].data = response.data.result.rows;
  cache[cacheKey].lastFetched = now;
  return cache[cacheKey].data;
}

// ✅ TOP MINTERS
app.get("/top-minter-fees", async (req, res) => {
  try {
    const data = await fetchWithCache("topMinters", "6951692");
    res.json(data);
  } catch (err) {
    console.error(err);
    if (cache.topMinters.data) return res.json(cache.topMinters.data);
    res.status(500).send("Error fetching data");
  }
});

// ✅ REWARD POOL
app.get("/reward-pool", async (req, res) => {
  try {
    const data = await fetchWithCache("rewardPool", "6946334");
    res.json(data);
  } catch (err) {
    console.error(err);
    if (cache.rewardPool.data) return res.json(cache.rewardPool.data);
    res.status(500).send("Error fetching data");
  }
});

// ✅ REGISTRATION FEES
app.get("/reg-fees", async (req, res) => {
  try {
    const data = await fetchWithCache("regFees", "6946769");
    res.json(data);
  } catch (err) {
    console.error(err);
    if (cache.regFees.data) return res.json(cache.regFees.data);
    res.status(500).send("Error fetching data");
  }
});

// ✅ GAS FEES
app.get("/gas-fees", async (req, res) => {
  try {
    const data = await fetchWithCache("gasFees", "6946700");
    res.json(data);
  } catch (err) {
    console.error(err);
    if (cache.gasFees.data) return res.json(cache.gasFees.data);
    res.status(500).send("Error fetching data");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});