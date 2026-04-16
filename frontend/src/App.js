import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const BASE_URL = "/api";

const C = {
  bg:         "#0a0604",
  card:       "#140c07",
  cardHover:  "#1e1209",
  border:     "#2a1508",
  accent:     "#ff4545",
  orange:     "#ff8c42",
  green:      "#22c55e",
  gray:       "#55545e",
  text:       "#f0e8e0",
  muted:      "#8a7060",
};

const AIRDROP_COLORS = {
  "Recovered ✅": C.green,
  "Net Loss 🔴":  C.accent,
  "Rugged 💀":    C.gray,
};

const getStatusColor = (user) => {
  if (!user) return C.gray;
  if (user.airdrop_received === 0) return C.gray;
  if (user.net_profit > 0) return C.green;
  return C.accent;
};

const getStatusLabel = (user) => {
  if (!user) return "";
  if (user.airdrop_received === 0) return "💀 Rugged";
  if (user.net_profit > 0) return "✅ Recovered";
  return "🔴 Net Loss";
};

const GLOBAL_STYLES = `
  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: ${C.bg}; }
  body { font-family: 'Inter', Arial, sans-serif; }

  @keyframes bounce    { from { transform: translateY(0); }    to { transform: translateY(-16px); } }
  @keyframes spin      { from { transform: rotate(0deg); }     to { transform: rotate(360deg); } }
  @keyframes pulse     { 0%,100% { opacity:1; }                50% { opacity:0.35; } }
  @keyframes fadeUp    { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
  @keyframes crackIn   { 0% { transform:scale(0.5) rotate(-5deg); opacity:0; } 60% { transform:scale(1.1) rotate(2deg); opacity:1; } 100% { transform:scale(1) rotate(0); opacity:1; } }
  @keyframes shake     { 0%,100% { transform:translateX(0); } 25% { transform:translateX(-8px); } 75% { transform:translateX(8px); } }
  @keyframes slideUp   { from { transform:translateY(300px); } to { transform:translateY(0); } }

  .row-item { transition: background 0.15s, transform 0.12s; }
  .row-item:hover { background: ${C.cardHover} !important; transform: translateX(3px); }

  .stat-card { transition: transform 0.2s, box-shadow 0.2s; }
  .stat-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.5); }

  .nav-tab { transition: all 0.2s; }

  .search-input { transition: border-color 0.2s, box-shadow 0.2s; }
  .search-input:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accent}22 !important; outline: none; }

  ::-webkit-scrollbar       { width: 5px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }

  .footer-link { transition: color 0.2s; }
  .footer-link:hover { color: ${C.accent} !important; }

  .close-btn { transition: opacity 0.15s, transform 0.15s; }
  .close-btn:hover { opacity: 0.85; transform: scale(0.97); }
`;

function App() {
  const [data, setData] = useState([]);
  const [airdropData, setAirdropData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [airdropSummary, setAirdropSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cookieState, setCookieState] = useState("hidden");
  const [page, setPage] = useState("s1");

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE_URL}/top-minter-fees`),
      axios.get(`${BASE_URL}/airdrop`),
      axios.get(`${BASE_URL}/reward-pool`),
      axios.get(`${BASE_URL}/reg-fees`),
      axios.get(`${BASE_URL}/gas-fees`),
      axios.get(`${BASE_URL}/airdrop-summary`),
    ]).then(([mintersRes, airdropRes, rewardRes, regRes, gasRes, summaryRes]) => {
      setData(mintersRes.data.map((item) => ({
        rank: item.rank,
        total_eth_spent: Number(item.total_eth_spent || 0),
        user_address: (item.user_address || "").toLowerCase(),
        tx_count: item.tx_count || 0,
      })));
      setAirdropData(airdropRes.data.map((item) => ({
        rank: item.rank,
        user_address: (item.user_address || "").toLowerCase(),
        total_eth_spent: Number(item.total_eth_spent || 0),
        tx_count: item.tx_count || 0,
        airdrop_received: Number(item.airdrop_received || 0),
        net_profit: Number(item.net_profit || 0),
      })));
      const rewardPool = rewardRes.data.total_reward_pool;
      const regFees = regRes.data.total_reg_fees;
      const gasFees = gasRes.data.total_gas_fees;
      setChartData({ rewardPool, regFees, gasFees, totalFees: regFees + gasFees });
      setAirdropSummary(summaryRes.data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (selectedUser) {
      setCookieState("rising");
      setTimeout(() => setCookieState("whole"), 50);
    } else {
      setCookieState("hidden");
    }
  }, [selectedUser]);

  const handleCookieClick = () => {
    if (cookieState === "whole") setCookieState("cracked");
  };

  const filtered = airdropData.filter((u) =>
    u.user_address.includes(search.toLowerCase())
  );

  const totalETH = data.reduce((acc, u) => acc + u.total_eth_spent, 0);

  // ── LOADING ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "100vh", background: C.bg,
      }}>
        <style>{GLOBAL_STYLES}</style>
        <img src="/chef.png" alt="chef" style={{ width: "110px", marginBottom: "24px", animation: "bounce 0.85s infinite alternate ease-in-out" }} />
        <img src="/cookie.png" alt="" style={{ width: "38px", marginBottom: "20px", animation: "spin 1.4s linear infinite" }} />
        <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "11px", color: C.accent, textAlign: "center", lineHeight: "2.4", animation: "pulse 1.6s infinite" }}>
          Baking data...<br />please wait 🍪
        </p>
      </div>
    );
  }

  // ── MAIN ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ── COOKIE POPUP ─────────────────────────────────────────────────── */}
      {selectedUser && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedUser(null); }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.78)",
            backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, flexDirection: "column",
          }}
        >
          {/* whole cookie */}
          {cookieState !== "cracked" && (
            <div
              onClick={handleCookieClick}
              style={{
                textAlign: "center", cursor: "pointer",
                transform: cookieState === "whole" ? "translateY(0)" : "translateY(320px)",
                transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <img src="/cookie.png" alt="cookie" style={{ width: "160px", filter: "drop-shadow(0 12px 40px rgba(255,140,66,0.45))" }} />
              <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "10px", color: "#fff", marginTop: "16px", lineHeight: "2.2", opacity: 0.75 }}>
                tap to crack! 🍪
              </p>
            </div>
          )}

          {/* cracked cookie + details */}
          {cookieState === "cracked" && (
            <div style={{ animation: "crackIn 0.4s ease-out forwards", textAlign: "center", maxWidth: "420px", width: "92%", padding: "0 8px" }}>
              <img src="/cookie-cracked.png" alt="cracked" style={{ width: "120px", marginBottom: "14px", animation: "shake 0.3s ease-out", filter: "drop-shadow(0 10px 28px rgba(255,140,66,0.3))" }} />

              <div style={{
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "clamp(14px, 3.5vw, 22px)",
                fontWeight: "900", color: getStatusColor(selectedUser),
                marginBottom: "18px",
                textShadow: `0 0 24px ${getStatusColor(selectedUser)}55`,
              }}>
                {getStatusLabel(selectedUser)}
              </div>

              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "22px", textAlign: "left", boxShadow: "0 24px 64px rgba(0,0,0,0.7)" }}>
                <p style={{ fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 14px 0" }}>Wallet Details</p>

                {/* address */}
                <div style={{ background: C.bg, borderRadius: "10px", padding: "10px 14px", marginBottom: "10px" }}>
                  <p style={{ margin: 0, fontSize: "9px", color: C.muted, marginBottom: "4px" }}>ADDRESS</p>
                  <p style={{ margin: 0, wordBreak: "break-all", fontSize: "11px", color: C.text, fontFamily: "monospace", lineHeight: "1.6" }}>{selectedUser.user_address}</p>
                </div>

                {/* grid stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                  {[
                    { label: "RANK",     val: `#${selectedUser.rank}` },
                    { label: "TX COUNT", val: selectedUser.tx_count },
                    { label: "ETH SPENT", val: `${selectedUser.total_eth_spent?.toFixed(4)} ETH` },
                    { label: "AIRDROP",  val: `${selectedUser.airdrop_received?.toFixed(4)} ETH` },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ background: C.bg, borderRadius: "10px", padding: "10px 14px" }}>
                      <p style={{ margin: 0, fontSize: "9px", color: C.muted, marginBottom: "4px" }}>{label}</p>
                      <p style={{ margin: 0, fontSize: "15px", fontWeight: "700", color: C.text }}>{val}</p>
                    </div>
                  ))}
                </div>

                {/* net profit */}
                <div style={{ background: C.bg, borderRadius: "10px", padding: "12px 14px", border: `1px solid ${getStatusColor(selectedUser)}33`, marginBottom: "16px" }}>
                  <p style={{ margin: 0, fontSize: "9px", color: C.muted, marginBottom: "4px" }}>NET PROFIT / LOSS</p>
                  <p style={{ margin: 0, fontSize: "22px", fontWeight: "900", color: getStatusColor(selectedUser) }}>
                    {selectedUser.net_profit > 0 ? "+" : ""}{selectedUser.net_profit?.toFixed(4)} ETH
                  </p>
                </div>

                <button className="close-btn" onClick={() => setSelectedUser(null)} style={{
                  width: "100%", padding: "13px", borderRadius: "12px",
                  border: "none", background: C.accent, color: "#fff",
                  cursor: "pointer", fontWeight: "700", fontSize: "14px",
                }}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: `${C.bg}f0`,
        backdropFilter: "blur(14px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ maxWidth: "1140px", margin: "0 auto", padding: "0 clamp(16px,4vw,48px)", display: "flex", justifyContent: "space-between", alignItems: "center", height: "62px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img src="/logo.png" alt="logo" style={{ width: "36px", height: "36px", objectFit: "contain" }} />
            <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "9px", color: C.text, display: "block" }}>
              Rugpull Bakery
            </span>
          </div>
          <nav style={{ display: "flex", gap: "8px" }}>
            {["s1", "s2"].map((p) => (
              <button key={p} onClick={() => setPage(p)} className="nav-tab" style={{
                padding: "7px 18px", borderRadius: "20px",
                border: page === p ? "none" : `1px solid ${C.border}`,
                background: page === p ? C.accent : "transparent",
                color: page === p ? "#fff" : C.muted,
                fontFamily: "'Press Start 2P', cursive",
                fontSize: "9px", cursor: "pointer",
              }}>
                {p.toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── S2 PAGE ──────────────────────────────────────────────────────── */}
      {page === "s2" && (
        <div style={{ textAlign: "center", padding: "120px 20px", animation: "fadeUp 0.5s ease-out" }}>
          <img src="/chef.png" alt="chef" style={{ width: "120px", marginBottom: "24px", opacity: 0.55 }} />
          <h2 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(11px, 2vw, 17px)", color: C.accent, lineHeight: "2.4", marginBottom: "16px" }}>
            Season 2<br />Coming Soon 🍪
          </h2>
          <p style={{ color: C.muted, fontSize: "14px" }}>The oven is still warm.</p>
        </div>
      )}

      {/* ── S1 PAGE ──────────────────────────────────────────────────────── */}
      {page === "s1" && (
        <main style={{ maxWidth: "1140px", margin: "0 auto", padding: "40px clamp(16px,4vw,48px) 80px" }}>

          {/* HERO */}
          <section style={{ textAlign: "center", marginBottom: "48px", animation: "fadeUp 0.5s ease-out", position: "relative", padding: "48px 20px 36px" }}>
            {/* radial glow */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 0%, rgba(255,69,69,0.1) 0%, transparent 68%)", pointerEvents: "none" }} />
            {/* floating cookies */}
            <img src="/cookie.png" alt="" aria-hidden="true" style={{ position: "absolute", left: "clamp(8px,4vw,64px)", top: "24px", width: "clamp(28px,3.5vw,50px)", opacity: 0.4, transform: "rotate(-18deg)" }} />
            <img src="/cookie.png" alt="" aria-hidden="true" style={{ position: "absolute", right: "clamp(8px,4vw,64px)", top: "36px", width: "clamp(22px,2.8vw,40px)", opacity: 0.3, transform: "rotate(22deg)" }} />

            <img src="/chef.png" alt="chef" style={{ width: "clamp(120px,16vw,200px)", display: "block", margin: "0 auto 20px", filter: "drop-shadow(0 20px 48px rgba(255,140,66,0.18))" }} />

            <p style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(9px,1.3vw,12px)", color: C.muted, marginBottom: "12px", lineHeight: "2" }}>
              Season 1 · Did you get rugged?
            </p>

            <div style={{
              fontSize: "clamp(48px,9vw,92px)", fontWeight: "900", lineHeight: "1", marginBottom: "10px",
              background: "linear-gradient(130deg,#ff4545 0%,#ff8c42 55%,#ffb347 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              {totalETH.toFixed(2)} ETH
            </div>
            <p style={{ color: C.muted, fontSize: "clamp(12px,1.4vw,15px)", margin: 0 }}>Total spent by all bakers</p>
          </section>

          {/* STAT CARDS */}
          {chartData && (
            <section style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "36px", animation: "fadeUp 0.6s ease-out" }}>
              {[
                { label: "Reward Pool", val: `${chartData.rewardPool.toFixed(2)} ETH`, color: C.accent },
                { label: "Reg Fees",    val: `${chartData.regFees.toFixed(2)} ETH`,    color: C.orange },
                { label: "Gas Fees",    val: `${chartData.gasFees.toFixed(2)} ETH`,    color: C.orange },
                ...(airdropSummary || []).map((d) => ({
                  label: d.status.replace(/[✅🔴💀]/g, "").trim(),
                  val: String(d.player_count),
                  sub: `${parseFloat(d.percentage).toFixed(1)}%`,
                  color: AIRDROP_COLORS[d.status],
                })),
              ].map(({ label, val, sub, color }) => (
                <div key={label} className="stat-card" style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "14px", padding: "18px 20px", flex: "1", minWidth: "120px" }}>
                  <p style={{ fontSize: "9px", color: C.muted, margin: "0 0 7px", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
                  <p style={{ fontSize: "clamp(15px,1.8vw,20px)", fontWeight: "900", color, margin: "0 0 3px" }}>{val}</p>
                  {sub && <p style={{ fontSize: "10px", color: C.muted, margin: 0 }}>{sub}</p>}
                </div>
              ))}
            </section>
          )}

          {/* CHARTS ROW */}
          <section style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "40px", animation: "fadeUp 0.7s ease-out" }}>

            {/* Airdrop donut */}
            {airdropSummary && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "26px", flex: "1", minWidth: "270px" }}>
                <h3 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(8px,1.1vw,10px)", margin: "0 0 18px", color: C.text }}>
                  🍪 Airdrop Analysis
                </h3>
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie data={airdropSummary.map((d) => ({ name: d.status, value: d.player_count }))}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                      {airdropSummary.map((d, i) => <Cell key={i} fill={AIRDROP_COLORS[d.status] || "#ccc"} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", color: C.text }}
                      formatter={(v, name) => [`${v} players`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginTop: "10px" }}>
                  {airdropSummary.map((d, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: AIRDROP_COLORS[d.status] }} />
                        <span style={{ fontSize: "10px", color: C.muted }}>{d.status.replace(/[✅🔴💀]/g, "").trim()}</span>
                      </div>
                      <p style={{ fontSize: "17px", fontWeight: "900", color: AIRDROP_COLORS[d.status], margin: "0 0 2px" }}>{d.player_count}</p>
                      <p style={{ fontSize: "10px", color: C.muted, margin: 0 }}>{parseFloat(d.percentage).toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewards vs Fees donut */}
            {chartData && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "26px", flex: "1", minWidth: "270px" }}>
                <h3 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(8px,1.1vw,10px)", margin: "0 0 18px", color: C.text }}>
                  🍪 Rewards vs Fees
                </h3>
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie data={[
                      { name: "Reward Pool", value: chartData.rewardPool },
                      { name: "Total Fees",  value: chartData.totalFees },
                    ]} cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={4} dataKey="value">
                      <Cell fill={C.accent} />
                      <Cell fill={C.orange} />
                    </Pie>
                    <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", color: C.text }}
                      formatter={(v) => v.toFixed(3) + " ETH"} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: "flex", justifyContent: "center", gap: "20px", flexWrap: "wrap", marginTop: "10px" }}>
                  {[
                    { label: "Reward Pool", val: chartData.rewardPool, col: C.accent },
                    { label: "Reg Fees",    val: chartData.regFees,    col: C.orange },
                    { label: "Gas Fees",    val: chartData.gasFees,    col: C.orange },
                  ].map(({ label, val, col }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", marginBottom: "4px" }}>
                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: col }} />
                        <span style={{ fontSize: "10px", color: C.muted }}>{label}</span>
                      </div>
                      <p style={{ fontSize: "17px", fontWeight: "900", color: col, margin: 0 }}>{val.toFixed(2)} ETH</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* WALLET LOOKUP */}
          <section style={{ marginBottom: "36px", animation: "fadeUp 0.8s ease-out" }}>
            <h3 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(9px,1.2vw,11px)", margin: "0 0 14px", color: C.text }}>
              🔍 Wallet Lookup
            </h3>
            <input
              type="text"
              placeholder="Enter wallet address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              style={{
                padding: "13px 18px", width: "min(420px, 100%)",
                borderRadius: "12px", border: `1px solid ${C.border}`,
                background: C.card, color: C.text,
                fontSize: "13px", fontFamily: "monospace",
              }}
            />

            {search && (
              <div style={{ marginTop: "10px" }}>
                {filtered.length === 0 ? (
                  <p style={{ color: C.muted, fontSize: "14px" }}>No address found</p>
                ) : (
                  filtered.slice(0, 20).map((user, i) => {
                    const au = airdropData.find(a => a.user_address === user.user_address) || user;
                    return (
                      <div key={i} onClick={() => setSelectedUser(au)} className="row-item"
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", marginBottom: "5px", background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", cursor: "pointer" }}>
                        <span style={{ fontSize: "11px", color: C.muted, minWidth: "28px" }}>#{user.rank}</span>
                        <span style={{ flex: 1, fontSize: "12px", fontFamily: "monospace", color: C.text, wordBreak: "break-all" }}>{user.user_address}</span>
                        <span style={{ fontSize: "12px", fontWeight: "700", color: C.orange, whiteSpace: "nowrap" }}>{user.total_eth_spent.toFixed(3)} ETH</span>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: getStatusColor(au), flexShrink: 0 }} />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </section>

          {/* TOP MINTERS TABLE */}
          <section style={{ marginBottom: "40px", animation: "fadeUp 0.9s ease-out" }}>
            <h3 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(9px,1.2vw,11px)", margin: "0 0 14px", color: C.text }}>
              🏆 Top Minters
            </h3>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "16px", overflow: "hidden" }}>
              {/* header row */}
              <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 110px 64px 90px", gap: "8px", padding: "10px 18px", borderBottom: `1px solid ${C.border}` }}>
                {["#", "Address", "ETH Spent", "TXs", "Status"].map((h) => (
                  <span key={h} style={{ fontSize: "9px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</span>
                ))}
              </div>

              {data.slice(0, 10).map((user, i) => {
                const au = airdropData.find(a => a.user_address === user.user_address);
                const sc = getStatusColor(au);
                const rankBadge = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${user.rank}`;
                const statusText = !au ? "—" : au.airdrop_received === 0 ? "Rugged" : au.net_profit > 0 ? "Recov." : "Loss";
                return (
                  <div key={i} onClick={() => setSelectedUser(au || user)} className="row-item"
                    style={{ display: "grid", gridTemplateColumns: "44px 1fr 110px 64px 90px", gap: "8px", padding: "13px 18px", cursor: "pointer", borderBottom: i < 9 ? `1px solid ${C.border}` : "none", alignItems: "center" }}>
                    <span style={{ fontSize: "13px", color: i < 3 ? C.orange : C.muted, fontWeight: "700" }}>{rankBadge}</span>
                    <span style={{ fontSize: "12px", fontFamily: "monospace", color: C.text }}>
                      {user.user_address.slice(0, 8)}...{user.user_address.slice(-6)}
                    </span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: C.accent }}>{user.total_eth_spent.toFixed(3)} ETH</span>
                    <span style={{ fontSize: "12px", color: C.muted }}>{user.tx_count}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: sc, flexShrink: 0 }} />
                      <span style={{ fontSize: "10px", color: sc, fontWeight: "600" }}>{statusText}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* BAR CHART */}
          <section style={{ animation: "fadeUp 1s ease-out" }}>
            <h3 style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "clamp(9px,1.2vw,11px)", margin: "0 0 14px", color: C.text }}>
              📊 Top ETH Spenders
            </h3>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "20px", padding: "24px" }}>
              <div style={{ width: "100%", height: "clamp(180px,28vw,280px)" }}>
                <ResponsiveContainer>
                  <BarChart data={data.slice(0, 10)} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                    <XAxis dataKey="user_address" tickFormatter={(a) => a.slice(0, 6)} tick={{ fill: C.muted, fontSize: 10 }} axisLine={{ stroke: C.border }} tickLine={false} />
                    <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", color: C.text }}
                      formatter={(v) => [v.toFixed(3) + " ETH", "ETH Spent"]}
                      labelFormatter={(v) => `${v.slice(0, 6)}...${v.slice(-4)}`}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Bar dataKey="total_eth_spent" fill={C.accent} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* FOOTER */}
      <footer style={{ textAlign: "center", padding: "28px", borderTop: `1px solid ${C.border}` }}>
        <a href="https://x.com/0xAirr" target="_blank" rel="noopener noreferrer"
          className="footer-link"
          style={{ fontFamily: "'Press Start 2P', cursive", fontSize: "10px", color: C.muted, textDecoration: "none" }}>
          @0xAirr
        </a>
      </footer>
    </div>
  );
}

export default App;
