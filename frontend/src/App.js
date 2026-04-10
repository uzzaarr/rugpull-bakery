import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const BASE_URL = "https://rugpull-bakery.onrender.com";

function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [chartData, setChartData] = useState(null);

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
  }, []);

  const filtered = data.filter((user) =>
    user.user_address.includes(search.toLowerCase())
  );

  const totalETH = data.reduce((acc, u) => acc + u.total_eth_spent, 0);

  // Cookie donut chart colors


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

      {/* 🍪 COOKIE DONUT CHART — Rewards vs Fees */}
      {chartData && (
        <div style={{
          background: "#fff",
          borderRadius: "20px",
          padding: "30px",
          marginBottom: "40px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(10px, 1.5vw, 14px)", marginBottom: "10px" }}>
            🍪 Rewards vs Fees
          </h2>
          <p style={{ color: "#888", fontSize: "13px", marginBottom: "20px" }}>
            Total Fees Collected: <strong>{chartData.totalFees.toFixed(2)} ETH</strong> &nbsp;|&nbsp;
            Reward Pool: <strong>{chartData.rewardPool.toFixed(2)} ETH</strong>
          </p>

          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "20px" }}>
            
            {/* LEFT STAT — Reg Fees */}
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#666" }}>Registration Fees</p>
              <p style={{ fontSize: "24px", fontWeight: "900", color: "#ff5a5a" }}>{chartData.regFees.toFixed(2)} ETH</p>
            </div>

            {/* DONUT CHART */}
            <PieChart width={280} height={280}>
              <Pie
                data={[
                  { name: "Reward Pool", value: chartData.rewardPool },
                  { name: "Total Fees", value: chartData.totalFees },
                ]}
                cx={140}
                cy={140}
                innerRadius={80}
                outerRadius={120}
                paddingAngle={4}
                dataKey="value"
              >
                <Cell fill="#ff5a5a" />
                <Cell fill="#ffb347" />
              </Pie>
              <Tooltip formatter={(v) => v.toFixed(2) + " ETH"} />
              <Legend />
            </PieChart>

            {/* RIGHT STAT — Gas Fees */}
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "13px", color: "#666" }}>Gas Fees</p>
              <p style={{ fontSize: "24px", fontWeight: "900", color: "#ffb347" }}>{chartData.gasFees.toFixed(2)} ETH</p>
            </div>

          </div>
        </div>
      )}

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
                <span style={{ wordBreak: "break-all" }}>{user.user_address}</span>
                <span>{user.total_eth_spent.toFixed(3)} ETH</span>
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
          <p><strong>Total ETH:</strong> {selectedUser.total_eth_spent.toFixed(4)}</p>
          <p><strong>Transactions:</strong> {selectedUser.tx_count}</p>
          <button onClick={() => setSelectedUser(null)}
            style={{ marginTop: "10px", padding: "8px 16px", borderRadius: "20px", border: "none", background: "#ff5a5a", color: "#fff", cursor: "pointer", fontWeight: "bold" }}>
            Close
          </button>
        </div>
      )}

      {/* 🏆 TOP 10 */}
      <h2 style={{ marginTop: "30px" }}>🏆 Top Minters</h2>
      {data.slice(0, 10).map((user, index) => (
        <div key={index} onClick={() => setSelectedUser(user)}
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