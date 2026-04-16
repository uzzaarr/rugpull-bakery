const QUERY_ID = "6971541";

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
  try {
    const r = await fetch(
      `https://api.dune.com/api/v1/query/${QUERY_ID}/results`,
      { headers: { "X-Dune-API-Key": process.env.DUNE_API_KEY } }
    );
    const json = await r.json();
    const rows = json.result.rows;
    const value = Number(rows[0]?.total_gas_fees || 0).toFixed(4);
    res.json({ total_gas_fees: parseFloat(value) });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch data" });
  }
};
