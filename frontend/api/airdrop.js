const QUERY_ID = "6982387";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  try {
    const r = await fetch(
      `https://api.dune.com/api/v1/query/${QUERY_ID}/results?limit=500`,
      { headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY } }
    );
    const json = await r.json();
    if (!r.ok || !json.result) {
      console.error("Dune error:", JSON.stringify(json));
      return res.status(502).json({ error: json.error || "No result from Dune" });
    }
    res.json(json.result.rows);
  } catch (err) {
    console.error("airdrop error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
