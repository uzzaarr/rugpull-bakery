const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const DUNE_API_KEY = "cVH3KXu8SFnF17Cwut5Ueac0BHiNxJ9l";  // 🔴 REPLACE THIS

app.get("/top-minter-fees", async (req, res) => {   // 🟢 UPDATED NAME
  try {
    const response = await axios.get(
      "https://api.dune.com/api/v1/query/6951692/results",  // 🟢 UPDATED QUERY ID
      {
        headers: {
          "X-Dune-API-Key": DUNE_API_KEY,
        },
      }
    );

    res.json(response.data.result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching data");
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});