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
      .get("http://localhost:3001/top-minter-fees")
      .then((res) => {
        const cleaned = res.data.map((item) => ({
          rank: item.rank,
          total_eth_spent: Number(item.total_eth_spent),
          user_address: item.user_address.toLowerCase(),
          tx_count: item.tx_count
        }));
        setData(cleaned);
      })
      .catch((err) => console.error(err));
  }, []);

  const filtered = data.filter((user) =>
    user.user_address.includes(search.toLowerCase())
  );

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial",
        background: "#0d0d0d",
        minHeight: "100vh",
        color: "#fff"
      }}
    >
      <h1>🔥 Rugpull Bakery Dashboard</h1>

      {/* 🔍 SEARCH */}
      <h2>🔍 Search Address</h2>
      <input
        type="text"
        placeholder="Enter wallet address..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "300px",
          marginBottom: "20px",
          borderRadius: "8px",
          border: "none"
        }}
      />

      {/* 🔍 RESULTS */}
      {search && (
        <>
          <h3>Results:</h3>
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
                  padding: "10px",
                  marginBottom: "8px",
                  background: "#1a1a1a",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                <span>#{user.rank}</span>
                <span>{user.user_address}</span>
                <span>{user.total_eth_spent.toFixed(3)} ETH</span>
                <span>{user.tx_count} tx</span>
              </div>
            ))
          )}
        </>
      )}

      {/* 🧠 SELECTED USER PANEL */}
      {selectedUser && (
        <div
          style={{
            marginTop: "20px",
            padding: "20px",
            background: "#111",
            borderRadius: "12px",
            border: "1px solid #333"
          }}
        >
          <h2>🧠 Wallet Details</h2>
          <p><strong>Address:</strong> {selectedUser.user_address}</p>
          <p><strong>Rank:</strong> #{selectedUser.rank}</p>
          <p><strong>Total ETH Spent:</strong> {selectedUser.total_eth_spent.toFixed(4)} ETH</p>
          <p><strong>Total Transactions:</strong> {selectedUser.tx_count}</p>
        </div>
      )}

      {/* 🏆 TOP 10 */}
      <h2>🏆 Top Minters</h2>

      {data.slice(0, 10).map((user, index) => (
        <div
          key={index}
          onClick={() => setSelectedUser(user)}
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "12px",
            marginBottom: "10px",
            background: "#1a1a1a",
            borderRadius: "10px",
            cursor: "pointer"
          }}
        >
          <span>#{user.rank}</span>
          <span>
            {user.user_address.slice(0, 6)}...
            {user.user_address.slice(-4)}
          </span>
          <span>{user.total_eth_spent.toFixed(3)} ETH</span>
          <span>{user.tx_count} tx</span>
        </div>
      ))}

      {/* 📊 CHART */}
      <h2>📊 Top Minters by ETH Spent</h2>

      <div style={{ width: "100%", height: 350 }}>
        <ResponsiveContainer>
          <BarChart data={data.slice(0, 10)}>
            <XAxis
              dataKey="user_address"
              tickFormatter={(addr) => addr.slice(0, 6)}
            />
            <YAxis />
            <Tooltip formatter={(value) => value.toFixed(3) + " ETH"} />
            <Bar dataKey="total_eth_spent" fill="#00ffcc" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default App;