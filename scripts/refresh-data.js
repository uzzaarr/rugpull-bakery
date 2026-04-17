#!/usr/bin/env node
// Run this locally when you want to update the frozen data:
//   DUNE_API_KEY=<your_key> node scripts/refresh-data.js
// Then commit the updated files in data/

const axios = require("axios");
const fs = require("fs");
const path = require("path");

const DUNE_API_KEY = process.env.DUNE_API_KEY;
if (!DUNE_API_KEY) {
  console.error("DUNE_API_KEY env var is required");
  process.exit(1);
}

const DATA_DIR = path.join(__dirname, "../data");

const queries = [
  { file: "topMinters.json", queryId: "6951692" },
  { file: "rewardPool.json", queryId: "6971514" },
  { file: "regFees.json", queryId: "6971568" },
  { file: "gasFees.json", queryId: "6971541" },
  { file: "airdrop.json", queryId: "6982387" },
  { file: "airdropSummary.json", queryId: "6982342" },
  { file: "s2Data.json", queryId: "7329756" },
  { file: "s2Summary.json", queryId: "7329758" },
  { file: "s1Comparison.json", queryId: "6978317" },
];

async function fetchQuery(queryId) {
  const res = await axios.get(
    `https://api.dune.com/api/v1/query/${queryId}/results`,
    { headers: { "X-Dune-API-Key": DUNE_API_KEY } }
  );
  return res.data.result.rows;
}

(async () => {
  for (const { file, queryId } of queries) {
    try {
      console.log(`Fetching ${file} (query ${queryId})...`);
      const rows = await fetchQuery(queryId);
      fs.writeFileSync(path.join(DATA_DIR, file), JSON.stringify(rows, null, 2));
      console.log(`  Saved ${rows.length} rows`);
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
    }
  }
  console.log("\nDone. Commit the data/ folder to freeze this snapshot.");
})();
