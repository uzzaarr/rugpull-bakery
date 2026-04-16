const QUERY_ID = "6971514";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  try {
    const r = await fetch(
      `https://api.dune.com/api/v1/query/${QUERY_ID}/results`,
      { headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY } }
    );
    const json = await r.json();
    if (!r.ok || !json.result) {
      console.error("Dune error:", JSON.stringify(json));
      return res.status(502).json({ error: json.error || "No result from Dune" });
    }
    const rows = json.result.rows;
    const value = Number(rows[0]?.balance || 0).toFixed(4);
    res.json({ total_reward_pool: parseFloat(value) });
  } catch (err) {
    console.error("reward-pool error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
