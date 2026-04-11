const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const DUNE_API_KEY = process.env.DUNE_API_KEY;

let store = {
  topMinters: null,
  rewardPool: null,
  regFees: null,
  gasFees: null,
  airdrop: null,
  airdropSummary: null,
};

async function fetchOnce(key, queryId) {
  if (store[key]) {
    console.log(`${key} already fetched, serving stored data`);
    return store[key];
  }
  console.log(`Fetching ${key} for the first time...`);
  const response = await axios.get(
    `https://api.dune.com/api/v1/query/${queryId}/results`,
    { headers: { "X-Dune-API-Key": DUNE_API_KEY } }
  );
  store[key] = response.data.result.rows;
  return store[key];
}

// ✅ TOP MINTERS
app.get("/top-minter-fees", async (req, res) => {
  try {
    const data = await fetchOnce("topMinters", "6951692");
    res.json(data);
  } catch (err) {
    console.error(err);
    if (store.topMinters) return res.json(store.topMinters);
    res.status(500).send("Error fetching data");
  }
});

// ✅ REWARD POOL
app.get("/reward-pool", async (req, res) => {
  try {
    const data = await fetchOnce("rewardPool", "6971514");
    const value = Number(data[0]?.balance || 0).toFixed(4);
    res.json({ total_reward_pool: parseFloat(value) });
  } catch (err) {
    console.error(err);
    if (store.rewardPool) return res.json(store.rewardPool);
    res.status(500).send("Error fetching data");
  }
});

// ✅ REGISTRATION FEES
app.get("/reg-fees", async (req, res) => {
  try {
    const data = await fetchOnce("regFees", "6971568");
    const value = Number(data[0]?.total_reg_fees || 0).toFixed(4);
    res.json({ total_reg_fees: parseFloat(value) });
  } catch (err) {
    console.error(err);
    if (store.regFees) return res.json(store.regFees);
    res.status(500).send("Error fetching data");
  }
});

// ✅ GAS FEES
app.get("/gas-fees", async (req, res) => {
  try {
    const data = await fetchOnce("gasFees", "6971541");
    const value = Number(data[0]?.total_gas_fees || 0).toFixed(4);
    res.json({ total_gas_fees: parseFloat(value) });
  } catch (err) {
    console.error(err);
    if (store.gasFees) return res.json(store.gasFees);
    res.status(500).send("Error fetching data");
  }
});

// ✅ AIRDROP + PROFIT/LOSS PER USER
app.get("/airdrop", async (req, res) => {
  try {
   const data = await fetchOnce("airdrop", "6982387");
    res.json(data);
  } catch (err) {
    console.error(err);
    if (store.airdrop) return res.json(store.airdrop);
    res.status(500).send("Error fetching data");
  }
});

// ✅ AIRDROP SUMMARY (Rugged / Net Loss / Recovered)
app.get("/airdrop-summary", async (req, res) => {
  try {
    const data = await fetchOnce("airdropSummary", "6982342");
    res.json(data);
  } catch (err) {
    console.error(err);
    if (store.airdropSummary) return res.json(store.airdropSummary);
    res.status(500).send("Error fetching data");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});