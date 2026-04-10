const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

// ✅ API key hidden from GitHub - set in Render Environment Variables
const DUNE_API_KEY = process.env.DUNE_API_KEY;

// 🔴 APIs DISABLED - remove these and uncomment axios routes when ready
app.get("/top-minter-fees", (req, res) => {
  res.json([]);
});

app.get("/reward-pool", (req, res) => {
  res.json({ total_reward_pool: 0 });
});

app.get("/reg-fees", (req, res) => {
  res.json({ total_reg_fees: 0 });
});

app.get("/gas-fees", (req, res) => {
  res.json({ total_gas_fees: 0 });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});