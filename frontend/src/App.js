import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

function App() {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    axios
      .get("https://rugpull-bakery.onrender.com/top-minter-fees")
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
  }, []);

  const filtered = data.filter((user) =>
    user.user_address.includes(search.toLowerCase())
  );

  const totalETH = data.reduce((acc, u) => acc + u.total_eth_spent, 0);

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
        background: "#f5d6c6",
        minHeight: "100vh",
        color: "#333"
      }}
    >
      {/* 🔥 HEADER — logo only, no top-right chef */}
      <div style={{ display: "flex", justifyContent: "flex-start", alignItems: "center", marginBottom: "10px" }}>
        <img src="/logo.png" alt="logo" style={{ width: "70px" }} />
      </div>

      {/* 🔥 HERO */}
      <div
        style={{
          textAlign: "center",
          marginBottom: "40px",
          position: "relative",
          padding: "20px 0"
        }}
      >
        {/* LEFT COOKIE */}
        <img
          src="/cookie.png"
          alt="cookie"
          style={{
            position: "absolute",
            left: "clamp(5px, 3vw, 40px)",
            top: "20px",
            width: "clamp(40px, 5vw, 70px)"
          }}
        />

        {/* RIGHT COOKIE */}
        <img
          src="/cookie.png"
          alt="cookie"
          style={{
            position: "absolute",
            right: "clamp(5px, 3vw, 40px)",
            top: "20px",
            width: "clamp(40px, 5vw, 70px)"
          }}
        />

        {/* CENTER CHEF — enlarged */}
        <img
          src="/chef.png"
          alt="chef"
          style={{
            width: "clamp(160px, 22vw, 280px)",
            marginBottom: "20px",
            display: "block",
            margin: "0 auto 20px auto"
          }}
        />

        {/* BIGGER PIXEL TEXT */}
        <h2
          style={{
            fontFamily: "'Press Start 2P', cursive",
            fontSize: "clamp(13px, 2.2vw, 22px)",
            lineHeight: "2",
            marginBottom: "25px",
            color: "#333"
          }}
        >
          Check if you rugged <br /> or got rugged ?
        </h2>

        {/* BIG ETH NUMBER */}
        <div
          style={{
            fontSize: "clamp(48px, 9vw, 100px)",
            fontWeight: "900",
            color: "#ff5a5a",
            textShadow: "4px 4px 0px #e04848",
            lineHeight: "1"
          }}
        >
          {totalETH.toFixed(2)} ETH
        </div>

        <p style={{ marginTop: "12px", color: "#555", fontSize: "clamp(13px, 1.5vw, 16px)" }}>
          Total spent by bakers
        </p>
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
        style={{
          padding: "12px 20px",
          width: "min(320px, 90%)",
          borderRadius: "30px",
          border: "none",
          outline: "none",
          marginBottom: "20px",
          fontSize: "14px"
        }}
      />

      {/* 🔍 RESULTS */}
      {search && (
        <>
          {filtered.length === 0 ? (
            <p>No address found</p>
          ) : (
            filtered.slice(0, 20).map((user, index) => (
              <div
                key={index}
                onClick={() => setSelectedUser(user)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "6px",
                  padding: "12px",
                  marginBottom: "8px",
                  background: "#fff",
                  borderRadius: "10px",
                  cursor: "pointer",
                  fontSize: "clamp(11px, 1.3vw, 14px)"
                }}
              >
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
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            fontSize: "clamp(12px, 1.4vw, 15px)"
          }}
        >
          <h2>🧠 Wallet Details</h2>
          <p style={{ wordBreak: "break-all" }}><strong>Address:</strong> {selectedUser.user_address}</p>
          <p><strong>Rank:</strong> #{selectedUser.rank}</p>
          <p><strong>Total ETH:</strong> {selectedUser.total_eth_spent.toFixed(4)}</p>
          <p><strong>Transactions:</strong> {selectedUser.tx_count}</p>
          <button
            onClick={() => setSelectedUser(null)}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              borderRadius: "20px",
              border: "none",
              background: "#ff5a5a",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold"
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* 🏆 TOP 10 */}
      <h2 style={{ marginTop: "30px" }}>🏆 Top Minters</h2>

      {data.slice(0, 10).map((user, index) => (
        <div
          key={index}
          onClick={() => setSelectedUser(user)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "6px",
            padding: "12px",
            marginBottom: "8px",
            background: "#fff",
            borderRadius: "10px",
            cursor: "pointer",
            fontSize: "clamp(11px, 1.3vw, 14px)"
          }}
        >
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
            <XAxis dataKey="user_address" tickFormatter={(a) => a.slice(0, 6)} tick={{ fontSize: "clamp(9px, 1.2vw, 12px)" }} />
            <YAxis tick={{ fontSize: "clamp(9px, 1.2vw, 12px)" }} />
            <Tooltip formatter={(v) => v.toFixed(3) + " ETH"} />
            <Bar dataKey="total_eth_spent" fill="#ff5a5a" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;