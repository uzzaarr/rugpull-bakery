import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const BASE_URL = "https://rugpull-bakery.onrender.com";

function App() {
  const [data, setData] = useState([]);
  const [airdropData, setAirdropData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [airdropSummary, setAirdropSummary] = useState(null);

  useEffect(() => {
    // Fetch top minters
    axios.get(`${BASE_URL}/top-minter-fees`)
      .then((res) => {
        const cleaned = res.data.map((item) => ({
          rank: item.rank,
          total_eth_spent: Number(item.total_eth_spent || 0),
          user_address: (item.user_address || "").toLowerCase(),
          tx_count: item.tx_count || 0
        }));
        setData(cleaned);
      })
      .catch((err) => console.error(err));

    // Fetch airdrop per user
    axios.get(`${BASE_URL}/airdrop`)
      .then((res) => {
        const cleaned = res.data.map((item) => ({
          rank: item.rank,
          user_address: (item.user_address || "").toLowerCase(),
          total_eth_spent: Number(item.total_eth_spent || 0),
          tx_count: item.tx_count || 0,
          airdrop_received: Number(item.airdrop_received || 0),
          net_profit: Number(item.net_profit || 0),
        }));
        setAirdropData(cleaned);
      })
      .catch((err) => console.error(err));

    // Fetch chart summary data
    Promise.all([
      axios.get(`${BASE_URL}/reward-pool`),
      axios.get(`${BASE_URL}/reg-fees`),
      axios.get(`${BASE_URL}/gas-fees`),
    ]).then(([rewardRes, regRes, gasRes]) => {
      const rewardPool = rewardRes.data.total_reward_pool;
      const regFees = regRes.data.total_reg_fees;
      const gasFees = gasRes.data.total_gas_fees;
      const totalFees = regFees + gasFees;
      setChartData({ rewardPool, regFees, gasFees, totalFees });
    }).catch((err) => console.error(err));

    // Fetch airdrop summary
    axios.get(`${BASE_URL}/airdrop-summary`)
      .then((res) => setAirdropSummary(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Search from airdrop data (has all columns)
  const filtered = airdropData.filter((user) =>
    user.user_address.includes(search.toLowerCase())
  );

  const totalETH = data.reduce((acc, u) => acc + u.total_eth_spent, 0);

  const AIRDROP_COLORS = {
    "Recovered ✅": "#4caf50",
    "Net Loss 🔴": "#ff5a5a",
    "Rugged 💀": "#888888",
  };

  const getStatusColor = (netProfit) => {
    if (netProfit > 0) return "#4caf50";
    if (netProfit === 0) return "#888888";
    return "#ff5a5a";
  };

  const getStatusLabel = (user) => {
    if (user.airdrop_received === 0) return "💀 Rugged";
    if (user.net_profit > 0) return "✅ Recovered";
    return "🔴 Net Loss";
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", background: "#f5d6c6", minHeight: "100vh", color: "#333" }}>

      {/* 🔥 HEADER */}
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: "10px" }}>
        <img src="/logo.png" alt="logo" style={{ width: "70px" }} />
      </div>

      {/* 🔥 HERO */}
      <div style={{ textAlign: "center", marginBottom: "40px", position: "relative", padding: "20px 0" }}>
        <img src="/cookie.png" alt="cookie" style={{ position: "absolute", left: "clamp(5px, 3vw, 40px)", top: "20px", width: "clamp(40px, 5vw, 70px)" }} />
        <img src="/cookie.png" alt="cookie" style={{ position: "absolute", right: "clamp(5px, 3vw, 40px)", top: "20px", width: "clamp(40px, 5vw, 70px)" }} />
        <img src="/chef.png" alt="chef" style={{ width: "clamp(160px, 22vw, 280px)", display: "block", margin: "0 auto 20px auto" }} />
        <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(13px, 2.2vw, 22px)", lineHeight: "2", marginBottom: "25px", color: "#333" }}>
          Check if you rugged <br /> or got rugged ?
        </h2>
        <div style={{ fontSize: "clamp(48px, 9vw, 100px)", fontWeight: "900", color: "#ff5a5a", textShadow: "4px 4px 0px #e04848", lineHeight: "1" }}>
          {totalETH.toFixed(2)} ETH
        </div>
        <p style={{ marginTop: "12px", color: "#555", fontSize: "clamp(13px, 1.5vw, 16px)" }}>
          Total spent by bakers
        </p>
      </div>

      {/* 🍪 TWO COOKIE CHARTS SIDE BY SIDE */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginBottom: "40px", justifyContent: "center" }}>

        {/* LEFT COOKIE — Airdrop Analysis */}
        {airdropSummary && (
          <div style={{ background: "#fff", borderRadius: "20px", padding: "30px", flex: "1", minWidth: "280px", maxWidth: "480px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(9px, 1.3vw, 12px)", marginBottom: "20px" }}>
              🍪 Airdrop Analysis
            </h2>

            {/* CUSTOM LEGEND */}
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginBottom: "10px" }}>
              {airdropSummary.map((d, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: AIRDROP_COLORS[d.status] || "#ccc" }} />
                  <span style={{ fontSize: "11px", color: "#555" }}>{d.status}</span>
                </div>
              ))}
            </div>

            <PieChart width={260} height={240}>
              <Pie
                data={airdropSummary.map((d) => ({ name: d.status, value: d.player_count }))}
                cx={130} cy={120}
                innerRadius={70} outerRadius={110}
                paddingAngle={4}
                dataKey="value"
              >
                {airdropSummary.map((d, index) => (
                  <Cell key={index} fill={AIRDROP_COLORS[d.status] || "#ccc"} />
                ))}
              </Pie>
              <Tooltip formatter={(v, name) => [`${v} players`, name]} />
            </PieChart>

            {/* STATS */}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginTop: "10px" }}>
              {airdropSummary.map((d, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <p style={{ fontSize: "11px", color: "#666", margin: "4px 0" }}>{d.status}</p>
                  <p style={{ fontSize: "20px", fontWeight: "900", color: AIRDROP_COLORS[d.status], margin: "0" }}>{d.player_count}</p>
                  <p style={{ fontSize: "11px", color: "#999", margin: "2px 0" }}>{parseFloat(d.percentage).toFixed(1)}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RIGHT COOKIE — Rewards vs Fees */}
        {chartData && (
          <div style={{ background: "#fff", borderRadius: "20px", padding: "30px", flex: "1", minWidth: "280px", maxWidth: "480px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", textAlign: "center" }}>
            <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(9px, 1.3vw, 12px)", marginBottom: "20px" }}>
              🍪 Rewards vs Fees
            </h2>

            {/* CUSTOM LEGEND */}
            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap", marginBottom: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ff5a5a" }} />
                <span style={{ fontSize: "11px", color: "#555" }}>Reward Pool</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#ffb347" }} />
                <span style={{ fontSize: "11px", color: "#555" }}>Total Fees</span>
              </div>
            </div>

            <PieChart width={260} height={240}>
              <Pie
                data={[
                  { name: "Reward Pool", value: chartData.rewardPool },
                  { name: "Total Fees", value: chartData.totalFees },
                ]}
                cx={130} cy={120}
                innerRadius={70} outerRadius={110}
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill="#ff5a5a" />
                <Cell fill="#ffb347" />
              </Pie>
              <Tooltip formatter={(v) => v.toFixed(2) + " ETH"} />
            </PieChart>

            {/* STATS */}
            <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap", marginTop: "10px" }}>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: "#666", margin: "4px 0" }}>Reward Pool</p>
                <p style={{ fontSize: "20px", fontWeight: "900", color: "#ff5a5a", margin: "0" }}>{chartData.rewardPool.toFixed(2)} ETH</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: "#666", margin: "4px 0" }}>Reg Fees</p>
                <p style={{ fontSize: "20px", fontWeight: "900", color: "#ffb347", margin: "0" }}>{chartData.regFees.toFixed(2)} ETH</p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: "11px", color: "#666", margin: "4px 0" }}>Gas Fees</p>
                <p style={{ fontSize: "20px", fontWeight: "900", color: "#ffb347", margin: "0" }}>{chartData.gasFees.toFixed(2)} ETH</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🔍 SEARCH */}
      <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(10px, 1.5vw, 14px)" }}>
        Search Address
      </h2>
      <input
        type="text"
        placeholder="Enter wallet address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: "12px 20px", width: "min(320px, 90%)", borderRadius: "30px", border: "none", outline: "none", marginBottom: "20px", fontSize: "14px" }}
      />

      {/* 🔍 RESULTS */}
      {search && (
        <>
          {filtered.length === 0 ? (
            <p>No address found</p>
          ) : (
            filtered.slice(0, 20).map((user, index) => (
              <div key={index} onClick={() => setSelectedUser(user)}
                style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "6px", padding: "12px", marginBottom: "8px", background: "#fff", borderRadius: "10px", cursor: "pointer" }}>
                <span>#{user.rank}</span>
                <span style={{ wordBreak: "break-all", flex: 1, margin: "0 8px" }}>{user.user_address}</span>
                <span>{user.total_eth_spent.toFixed(3)} ETH</span>
                <span style={{ color: getStatusColor(user.net_profit), fontWeight: "bold" }}>
                  {getStatusLabel(user)}
                </span>
              </div>
            ))
          )}
        </>
      )}

      {/* 🧠 DETAILS PANEL */}
      {selectedUser && (
        <div style={{ marginTop: "20px", padding: "20px", background: "#fff", borderRadius: "16px", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <h2>🧠 Wallet Details</h2>
          <p style={{ wordBreak: "break-all" }}><strong>Address:</strong> {selectedUser.user_address}</p>
          <p><strong>Rank:</strong> #{selectedUser.rank}</p>
          <p><strong>Total ETH Spent:</strong> {selectedUser.total_eth_spent.toFixed(4)} ETH</p>
          <p><strong>Transactions:</strong> {selectedUser.tx_count}</p>
          <p><strong>Airdrop Received:</strong> {selectedUser.airdrop_received.toFixed(4)} ETH</p>
          <p style={{ color: getStatusColor(selectedUser.net_profit), fontWeight: "bold" }}>
            <strong>Net Profit/Loss:</strong> {selectedUser.net_profit.toFixed(4)} ETH &nbsp;
            {getStatusLabel(selectedUser)}
          </p>
          <button onClick={() => setSelectedUser(null)}
            style={{ marginTop: "10px", padding: "8px 16px", borderRadius: "20px", border: "none", background: "#ff5a5a", color: "#fff", cursor: "pointer", fontWeight: "bold" }}>
            Close
          </button>
        </div>
      )}

      {/* 🏆 TOP 10 */}
      <h2 style={{ marginTop: "30px" }}>🏆 Top Minters</h2>
      {data.slice(0, 10).map((user, index) => (
        <div key={index} onClick={() => setSelectedUser(airdropData.find(a => a.user_address === user.user_address) || user)}
          style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "6px", padding: "12px", marginBottom: "8px", background: "#fff", borderRadius: "10px", cursor: "pointer" }}>
          <span>#{user.rank}</span>
          <span>{user.user_address.slice(0, 6)}...{user.user_address.slice(-4)}</span>
          <span>{user.total_eth_spent.toFixed(3)} ETH</span>
        </div>
      ))}

      {/* 📊 CHART */}
      <h2 style={{ marginTop: "30px" }}>📊 Top ETH Spenders</h2>
      <div style={{ width: "100%", height: "clamp(200px, 35vw, 350px)" }}>
        <ResponsiveContainer>
          <BarChart data={data.slice(0, 10)}>
            <XAxis dataKey="user_address" tickFormatter={(a) => a.slice(0, 6)} />
            <YAxis />
            <Tooltip formatter={(v) => v.toFixed(3) + " ETH"} />
            <Bar dataKey="total_eth_spent" fill="#ff5a5a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}

export default App;