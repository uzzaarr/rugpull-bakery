const express = require("express");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());

const DUNE_API_KEY = process.env.DUNE_API_KEY;
const DATA_DIR = path.join(__dirname, "data");

function loadFromFile(key) {
  const file = path.join(DATA_DIR, `${key}.json`);
  if (fs.existsSync(file)) {
    try {
      const rows = JSON.parse(fs.readFileSync(file, "utf8"));
      if (rows && rows.length > 0) {
        console.log(`${key}: loaded ${rows.length} rows from snapshot`);
        return rows;
      }
    } catch (_) {}
  }
  return null;
}

let store = {
  topMinters: loadFromFile("topMinters"),
  rewardPool: loadFromFile("rewardPool"),
  regFees: loadFromFile("regFees"),
  gasFees: loadFromFile("gasFees"),
  airdrop: loadFromFile("airdrop"),
  airdropSummary: loadFromFile("airdropSummary"),
  s2Data: loadFromFile("s2Data"),
  s2Summary: loadFromFile("s2Summary"),
  s1Comparison: loadFromFile("s1Comparison"),
};

async function fetchOnce(key, queryId) {
  if (store[key]) {
    console.log(`${key} already in memory, serving stored data`);
    return store[key];
  }
  console.log(`${key}: no snapshot found, fetching from Dune...`);
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

// ✅ S2 PER-USER DATA
app.get("/s2-data", async (req, res) => {
  try {
    const data = await fetchOnce("s2Data", "7329756");
    res.json(data);
  } catch (err) {
    console.error(err);
    if (store.s2Data) return res.json(store.s2Data);
    res.status(500).send("Error fetching data");
  }
});

// ✅ S2 AIRDROP SUMMARY
app.get("/s2-summary", async (req, res) => {
  try {
    const data = await fetchOnce("s2Summary", "7329758");
    res.json(data);
  } catch (err) {
    console.error(err);
    if (store.s2Summary) return res.json(store.s2Summary);
    res.status(500).send("Error fetching data");
  }
});

// ✅ S1 DATA FOR COMPARISON
app.get("/s1-comparison", async (req, res) => {
  try {
    const data = await fetchOnce("s1Comparison", "6978317");
    res.json(data);
  } catch (err) {
    console.error(err);
    if (store.s1Comparison) return res.json(store.s1Comparison);
    res.status(500).send("Error fetching data");
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});