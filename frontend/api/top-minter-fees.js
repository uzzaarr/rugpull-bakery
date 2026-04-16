const QUERY_ID = "6951692";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  try {
    const r = await fetch(
      `https://api.dune.com/api/v1/query/${QUERY_ID}/results`,
      { headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY } }
    );
    const json = await r.json();
    res.json(json.result.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
