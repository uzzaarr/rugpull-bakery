import { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";

const BASE_URL = "/api";

const C = {
  bg:         "#120a04",
  bgDeep:     "#0d0702",
  card:       "#1f1108",
  cardHover:  "#2a1a0d",
  parchment:  "#271608",
  border:     "#3d2212",
  borderGold: "#7a4e18",
  gold:       "#c97c0a",
  goldLight:  "#e8a020",
  amber:      "#d48818",
  copper:     "#b05c18",
  green:      "#3d7050",
  greenBright:"#52c278",
  red:        "#b83818",
  redBright:  "#e04828",
  cream:      "#f2e4cc",
  ivory:      "#e8d8bc",
  muted:      "#7a6248",
  mutedLight: "#9a8060",
  textSoft:   "#c8b49a",
};

const AIRDROP_COLORS = {
  "Recovered ✅": C.greenBright,
  "Net Loss 🔴":  C.redBright,
  "Rugged 💀":    C.muted,
};

const getStatusColor = (user) => {
  if (!user) return C.muted;
  if (user.airdrop_received === 0) return C.muted;
  if (user.net_profit > 0) return C.greenBright;
  return C.redBright;
};

const getStatusLabel = (user) => {
  if (!user) return "";
  if (user.airdrop_received === 0) return "💀 Rugged";
  if (user.net_profit > 0) return "✅ Recovered";
  return "🔴 Net Loss";
};

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,900;1,400;1,700&family=Crimson+Pro:ital,wght@0,300;0,400;0,600;1,300;1,400&family=JetBrains+Mono:wght@400;500&family=Press+Start+2P&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: ${C.bg}; }
  body { font-family: 'Crimson Pro', Georgia, serif; color: ${C.cream}; }

  @keyframes bounce    { from{transform:translateY(0)} to{transform:translateY(-18px)} }
  @keyframes spin      { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes fadeUp    { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:translateY(0)} }
  @keyframes crackIn   { 0%{transform:scale(0.4) rotate(-8deg);opacity:0} 60%{transform:scale(1.12) rotate(3deg);opacity:1} 100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes shake     { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-9px)} 75%{transform:translateX(9px)} }
  @keyframes steamRise { 0%{opacity:0;transform:translateY(0) scaleX(1)} 30%{opacity:0.55;transform:translateY(-14px) scaleX(1.3)} 100%{opacity:0;transform:translateY(-42px) scaleX(0.7)} }
  @keyframes goldFlow  { 0%,100%{background-position:0% 50%} 50%{background-position:100% 50%} }
  @keyframes warmPulse { 0%,100%{box-shadow:0 0 20px rgba(201,124,10,0.12)} 50%{box-shadow:0 0 45px rgba(201,124,10,0.28)} }
  @keyframes flourFloat{ 0%,100%{transform:translateY(0) rotate(0deg);opacity:0.12} 50%{transform:translateY(-14px) rotate(180deg);opacity:0.28} }
  @keyframes slideUp   { from{transform:translateY(300px)} to{transform:translateY(0)} }
  @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }

  .row-item { transition: background 0.18s, transform 0.14s, border-color 0.2s; }
  .row-item:hover { background: ${C.cardHover} !important; transform: translateX(5px); border-color: ${C.borderGold} !important; }

  .stat-card { transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s; }
  .stat-card:hover { transform: translateY(-6px); box-shadow: 0 24px 55px rgba(0,0,0,0.65), 0 0 35px rgba(201,124,10,0.12); border-color: ${C.borderGold} !important; }

  .nav-tab { transition: all 0.2s; }

  .search-input { transition: border-color 0.2s, box-shadow 0.25s; }
  .search-input:focus { border-color: ${C.gold} !important; box-shadow: 0 0 0 3px ${C.gold}28, inset 0 1px 0 rgba(255,255,255,0.04) !important; outline: none; }

  ::-webkit-scrollbar       { width: 5px; }
  ::-webkit-scrollbar-track { background: ${C.bg}; }
  ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: ${C.borderGold}; }

  .footer-link { transition: color 0.2s; }
  .footer-link:hover { color: ${C.goldLight} !important; }

  .close-btn { transition: background 0.2s, transform 0.15s; }
  .close-btn:hover { background: ${C.amber} !important; transform: scale(0.98); }

  .section-enter { animation: fadeUp 0.55s cubic-bezier(0.22,1,0.36,1) both; }

  .gold-text {
    background: linear-gradient(120deg, ${C.copper} 0%, ${C.goldLight} 45%, ${C.amber} 70%, ${C.goldLight} 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: goldFlow 4s ease infinite;
  }

  .parchment-card {
    background: ${C.card};
    background-image:
      radial-gradient(ellipse at top left, rgba(201,124,10,0.06) 0%, transparent 60%),
      radial-gradient(ellipse at bottom right, rgba(180,90,10,0.04) 0%, transparent 55%);
    border: 1px solid ${C.border};
  }

  .parchment-card::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background: linear-gradient(180deg, rgba(255,255,255,0.025) 0%, transparent 40%);
    pointer-events: none;
  }
`;

// Decorative ornamental divider using Unicode glyphs
const Ornament = ({ style }) => (
  <div style={{ textAlign: "center", color: C.borderGold, fontSize: "11px", letterSpacing: "0.3em", opacity: 0.7, ...style }}>
    ❧ ✦ ❧
  </div>
);

// Section header with Playfair Display serif
const SectionTitle = ({ children, sub, delay = "0s" }) => (
  <div style={{ marginBottom: "20px", animationDelay: delay }}>
    <h3 style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: "clamp(16px, 2.2vw, 22px)",
      fontStyle: "italic",
      fontWeight: 700,
      color: C.cream,
      margin: 0,
      letterSpacing: "-0.01em",
      lineHeight: 1.2,
    }}>
      {children}
    </h3>
    {sub && <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "13px", color: C.muted, margin: "4px 0 0", letterSpacing: "0.04em" }}>{sub}</p>}
    <div style={{ width: "36px", height: "2px", background: `linear-gradient(90deg, ${C.gold}, transparent)`, marginTop: "8px", borderRadius: "2px" }} />
  </div>
);

// Steam particle component
const Steam = () => (
  <div style={{ position: "relative", width: "60px", height: "50px", margin: "0 auto" }}>
    {[0, 1, 2].map(i => (
      <div key={i} className="steam-particle" style={{
        position: "absolute",
        bottom: 0,
        left: `${14 + i * 14}px`,
        width: "6px",
        height: "24px",
        background: `radial-gradient(ellipse, rgba(242,228,204,0.5) 0%, transparent 80%)`,
        borderRadius: "50%",
        animationDelay: `${i * 0.7}s`,
        animation: `steamRise 2s ease-out ${i * 0.7}s infinite`,
      }} />
    ))}
  </div>
);

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

  // S2 state
  const [s2Data, setS2Data] = useState([]);
  const [s2Summary, setS2Summary] = useState(null);
  const [s1CompData, setS1CompData] = useState([]);
  const [s2Search, setS2Search] = useState("");

  // Comparison state
  const [compSeasonA, setCompSeasonA] = useState("s1");
  const [compSeasonB, setCompSeasonB] = useState("s2");
  const [compSearchA, setCompSearchA] = useState("");
  const [compSearchB, setCompSearchB] = useState("");
  const [compPlayerA, setCompPlayerA] = useState(null);
  const [compPlayerB, setCompPlayerB] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${BASE_URL}/top-minter-fees`),
      axios.get(`${BASE_URL}/airdrop`),
      axios.get(`${BASE_URL}/reward-pool`),
      axios.get(`${BASE_URL}/reg-fees`),
      axios.get(`${BASE_URL}/gas-fees`),
      axios.get(`${BASE_URL}/airdrop-summary`),
      axios.get(`${BASE_URL}/s2-data`),
      axios.get(`${BASE_URL}/s2-summary`),
      axios.get(`${BASE_URL}/s1-comparison`),
    ]).then(([mintersRes, airdropRes, rewardRes, regRes, gasRes, summaryRes, s2Res, s2SumRes, s1CompRes]) => {
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
      const regFees   = regRes.data.total_reg_fees;
      const gasFees   = gasRes.data.total_gas_fees;
      setChartData({ rewardPool, regFees, gasFees, totalFees: regFees + gasFees });
      setAirdropSummary(summaryRes.data);
      setS2Data(s2Res.data.map((item) => ({
        rank: item.rank,
        user_address: (item.user_address || "").toLowerCase(),
        total_eth_spent: Number(item.total_eth_spent || 0),
        tx_count: item.tx_count || 0,
        airdrop_received: Number(item.airdrop_received || 0),
        net_profit: Number(item.net_profit || 0),
      })));
      setS2Summary(s2SumRes.data);
      setS1CompData(s1CompRes.data.map((item) => ({
        rank: item.rank,
        user_address: (item.user_address || "").toLowerCase(),
        total_eth_spent: Number(item.total_eth_spent || 0),
        tx_count: item.tx_count || 0,
        airdrop_received: Number(item.airdrop_received || 0),
        net_profit: Number(item.net_profit || 0),
      })));
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

  const s2Filtered = s2Data.filter((u) =>
    u.user_address.includes(s2Search.toLowerCase())
  );

  const compDatasetA = compSeasonA === "s1" ? s1CompData : s2Data;
  const compDatasetB = compSeasonB === "s1" ? s1CompData : s2Data;
  const compFilteredA = compSearchA
    ? compDatasetA.filter((u) => u.user_address.includes(compSearchA.toLowerCase())).slice(0, 8)
    : [];
  const compFilteredB = compSearchB
    ? compDatasetB.filter((u) => u.user_address.includes(compSearchB.toLowerCase())).slice(0, 8)
    : [];

  const compChartData = compPlayerA && compPlayerB ? [
    { metric: "ETH Spent", a: compPlayerA.total_eth_spent, b: compPlayerB.total_eth_spent },
    { metric: "Airdrop",   a: compPlayerA.airdrop_received, b: compPlayerB.airdrop_received },
    { metric: "Net P/L",   a: compPlayerA.net_profit, b: compPlayerB.net_profit },
  ] : [];

  const totalETH = data.reduce((acc, u) => acc + u.total_eth_spent, 0);

  // ── LOADING ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", minHeight: "100vh", background: C.bg,
        gap: 0,
      }}>
        <style>{GLOBAL_STYLES}</style>
        <style>{`.steam-particle { animation: steamRise 2s ease-out infinite; }`}</style>

        {/* Decorative top border */}
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.amber}, ${C.gold}, transparent)` }} />

        <div style={{ textAlign: "center", animation: "fadeUp 0.7s ease-out" }}>
          <div style={{
            display: "inline-block",
            padding: "2px 20px 0",
            borderTop: `1px solid ${C.borderGold}`,
            borderBottom: `1px solid ${C.borderGold}`,
            marginBottom: "28px",
            color: C.gold,
            fontFamily: "'Crimson Pro', serif",
            fontSize: "11px",
            letterSpacing: "0.35em",
            textTransform: "uppercase",
          }}>
            Est. Season One
          </div>

          <div style={{ position: "relative" }}>
            <img src="/chef.png" alt="chef" style={{
              width: "clamp(90px,14vw,130px)",
              display: "block",
              margin: "0 auto 8px",
              filter: "drop-shadow(0 12px 32px rgba(201,124,10,0.22))",
              animation: "bounce 0.9s infinite alternate ease-in-out",
            }} />
            <Steam />
          </div>

          <div style={{ position: "relative", display: "inline-block", marginBottom: "20px" }}>
            <img src="/cookie.png" alt="" style={{
              width: "34px",
              animation: "spin 1.6s linear infinite",
              filter: "sepia(0.4) saturate(1.5) hue-rotate(-10deg)",
            }} />
          </div>

          <p style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(13px,2vw,17px)",
            fontStyle: "italic",
            color: C.ivory,
            margin: "0 0 6px",
            animation: "pulse 2s infinite",
          }}>
            Baking your data fresh...
          </p>
          <p style={{
            fontFamily: "'Crimson Pro', serif",
            fontSize: "13px",
            color: C.muted,
            letterSpacing: "0.05em",
          }}>
            Please wait while the oven warms up 🍪
          </p>
        </div>

        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: "3px", background: `linear-gradient(90deg, transparent, ${C.gold}, ${C.amber}, ${C.gold}, transparent)` }} />
      </div>
    );
  }

  // ── MAIN ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.cream, position: "relative" }}>
      <style>{GLOBAL_STYLES}</style>
      <style>{`.steam-particle { animation: steamRise 2s ease-out infinite; }`}</style>

      {/* Top accent bar */}
      <div style={{ height: "3px", background: `linear-gradient(90deg, transparent 0%, ${C.copper} 15%, ${C.goldLight} 50%, ${C.copper} 85%, transparent 100%)` }} />

      {/* ── COOKIE POPUP ─────────────────────────────────────────────────── */}
      {selectedUser && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) setSelectedUser(null); }}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(10,5,2,0.88)",
            backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1000, flexDirection: "column",
          }}
        >
          {cookieState !== "cracked" && (
            <div
              onClick={handleCookieClick}
              style={{
                textAlign: "center", cursor: "pointer",
                transform: cookieState === "whole" ? "translateY(0)" : "translateY(320px)",
                transition: "transform 0.65s cubic-bezier(0.34,1.56,0.64,1)",
              }}
            >
              <img src="/cookie.png" alt="cookie" style={{
                width: "160px",
                filter: "sepia(0.3) saturate(1.4) hue-rotate(-8deg) drop-shadow(0 14px 44px rgba(201,124,10,0.5))",
                animation: "warmPulse 2s ease infinite",
              }} />
              <p style={{
                fontFamily: "'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "15px",
                color: C.ivory,
                marginTop: "18px",
                opacity: 0.8,
                letterSpacing: "0.02em",
              }}>
                Tap to crack open your fortune 🍪
              </p>
            </div>
          )}

          {cookieState === "cracked" && (
            <div style={{
              animation: "crackIn 0.45s cubic-bezier(0.22,1,0.36,1) forwards",
              textAlign: "center",
              maxWidth: "440px",
              width: "93%",
              padding: "0 10px",
            }}>
              <img src="/cookie-cracked.png" alt="cracked" style={{
                width: "110px",
                marginBottom: "16px",
                animation: "shake 0.35s ease-out",
                filter: "sepia(0.3) saturate(1.3) drop-shadow(0 10px 30px rgba(201,124,10,0.35))",
              }} />

              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(18px,4vw,26px)",
                fontStyle: "italic",
                fontWeight: 700,
                color: getStatusColor(selectedUser),
                marginBottom: "20px",
                textShadow: `0 0 28px ${getStatusColor(selectedUser)}44`,
              }}>
                {getStatusLabel(selectedUser)}
              </div>

              {/* Parchment card */}
              <div style={{
                background: C.parchment,
                backgroundImage: `radial-gradient(ellipse at top, rgba(201,124,10,0.08) 0%, transparent 65%)`,
                border: `1px solid ${C.border}`,
                borderTop: `1px solid ${C.borderGold}`,
                borderRadius: "20px",
                padding: "24px",
                textAlign: "left",
                boxShadow: "0 28px 70px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)",
                position: "relative",
                overflow: "hidden",
              }}>
                {/* Inner top glow */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "1px", background: `linear-gradient(90deg, transparent, ${C.borderGold}, transparent)` }} />

                <p style={{
                  fontFamily: "'Crimson Pro', serif",
                  fontSize: "10px",
                  color: C.muted,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  margin: "0 0 16px",
                }}>
                  — Baker's Receipt —
                </p>

                <div style={{ background: `${C.bg}cc`, borderRadius: "10px", padding: "11px 14px", marginBottom: "10px", border: `1px solid ${C.border}` }}>
                  <p style={{ margin: 0, fontSize: "10px", color: C.muted, marginBottom: "5px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Wallet</p>
                  <p style={{ margin: 0, wordBreak: "break-all", fontSize: "11px", color: C.textSoft, fontFamily: "'JetBrains Mono', monospace", lineHeight: "1.65" }}>
                    {selectedUser.user_address}
                  </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "10px" }}>
                  {[
                    { label: "Rank",       val: `#${selectedUser.rank}` },
                    { label: "Batches",    val: selectedUser.tx_count },
                    { label: "ETH In",     val: `${selectedUser.total_eth_spent?.toFixed(4)}` },
                    { label: "Airdrop",    val: `${selectedUser.airdrop_received?.toFixed(4)}` },
                  ].map(({ label, val }) => (
                    <div key={label} style={{ background: `${C.bg}cc`, borderRadius: "10px", padding: "11px 14px", border: `1px solid ${C.border}` }}>
                      <p style={{ margin: 0, fontSize: "10px", color: C.muted, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</p>
                      <p style={{ margin: 0, fontSize: "16px", fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.ivory }}>{val}</p>
                    </div>
                  ))}
                </div>

                <div style={{
                  background: `${C.bg}cc`,
                  borderRadius: "10px",
                  padding: "13px 14px",
                  border: `1px solid ${getStatusColor(selectedUser)}38`,
                  marginBottom: "18px",
                }}>
                  <p style={{ margin: 0, fontSize: "10px", color: C.muted, marginBottom: "5px", textTransform: "uppercase", letterSpacing: "0.07em" }}>Net Profit / Loss</p>
                  <p style={{ margin: 0, fontSize: "clamp(20px,4vw,26px)", fontFamily: "'Playfair Display', serif", fontWeight: 900, color: getStatusColor(selectedUser) }}>
                    {selectedUser.net_profit > 0 ? "+" : ""}{selectedUser.net_profit?.toFixed(4)} ETH
                  </p>
                </div>

                <button className="close-btn" onClick={() => setSelectedUser(null)} style={{
                  width: "100%", padding: "14px",
                  borderRadius: "12px", border: "none",
                  background: C.gold, color: C.bg,
                  cursor: "pointer",
                  fontFamily: "'Playfair Display', serif",
                  fontStyle: "italic",
                  fontWeight: 700,
                  fontSize: "15px",
                  letterSpacing: "0.02em",
                }}>
                  Close the Tin
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: `${C.bgDeep}ee`,
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{
          maxWidth: "1160px", margin: "0 auto",
          padding: "0 clamp(16px,4vw,52px)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          height: "64px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src="/logo.png" alt="logo" style={{ width: "34px", height: "34px", objectFit: "contain", filter: "sepia(0.2) saturate(1.3)" }} />
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "clamp(12px,1.5vw,15px)", color: C.cream, lineHeight: 1.1 }}>
                Rugpull Bakery
              </div>
              <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: "9px", color: C.muted, letterSpacing: "0.18em", textTransform: "uppercase", marginTop: "1px" }}>
                On-Chain Confectionery
              </div>
            </div>
          </div>

          <nav style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            {[
              { id: "s1", label: "Season I" },
              { id: "s2", label: "Season II" },
            ].map(({ id, label }) => (
              <button key={id} onClick={() => setPage(id)} className="nav-tab" style={{
                padding: "8px 20px",
                borderRadius: "6px",
                border: page === id ? `1px solid ${C.borderGold}` : `1px solid ${C.border}`,
                background: page === id
                  ? `linear-gradient(135deg, ${C.copper}22, ${C.gold}18)`
                  : "transparent",
                color: page === id ? C.goldLight : C.muted,
                fontFamily: "'Crimson Pro', serif",
                fontStyle: page === id ? "italic" : "normal",
                fontSize: "clamp(12px,1.3vw,14px)",
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}>
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── S2 PAGE ──────────────────────────────────────────────────────── */}
      {page === "s2" && (
        <main style={{ maxWidth: "1160px", margin: "0 auto", padding: "44px clamp(16px,4vw,52px) 90px" }}>

          {/* HERO */}
          <section className="section-enter" style={{ textAlign: "center", marginBottom: "52px", position: "relative", padding: "52px 20px 44px" }}>
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 20%, rgba(201,124,10,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "min(480px,90%)", height: "1px", background: `linear-gradient(90deg, transparent, ${C.borderGold} 30%, ${C.gold} 50%, ${C.borderGold} 70%, transparent)` }} />

            <img src="/cookie.png" alt="" aria-hidden="true" style={{ position: "absolute", left: "clamp(6px,3vw,56px)", top: "28px", width: "clamp(26px,3.5vw,48px)", opacity: 0.2, transform: "rotate(-20deg)", filter: "sepia(0.4)", animation: "flourFloat 5s ease-in-out infinite" }} />
            <img src="/cookie.png" alt="" aria-hidden="true" style={{ position: "absolute", right: "clamp(6px,3vw,56px)", top: "44px", width: "clamp(18px,2.5vw,34px)", opacity: 0.15, transform: "rotate(25deg)", filter: "sepia(0.4)", animation: "flourFloat 6.5s ease-in-out 1s infinite" }} />

            <img src="/chef.png" alt="chef" style={{ width: "clamp(110px,15vw,185px)", display: "block", margin: "0 auto 18px", filter: "drop-shadow(0 20px 50px rgba(201,124,10,0.2)) sepia(0.1)" }} />

            <div style={{ fontFamily: "'Crimson Pro', serif", fontSize: "clamp(10px,1.2vw,12px)", color: C.gold, letterSpacing: "0.22em", textTransform: "uppercase", marginBottom: "14px" }}>
              Season II · Fresh from the Oven
            </div>

            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(52px,10vw,100px)",
              fontWeight: 900, lineHeight: 1, marginBottom: "10px",
              background: `linear-gradient(130deg, ${C.copper} 0%, ${C.goldLight} 40%, ${C.amber} 65%, ${C.goldLight} 85%, ${C.copper} 100%)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              animation: "goldFlow 5s ease infinite",
            }}>
              {s2Data.reduce((a, u) => a + u.total_eth_spent, 0).toFixed(2)} ETH
            </div>
            <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", color: C.muted, fontSize: "clamp(13px,1.5vw,16px)", margin: "0 0 6px" }}>
              Total spent by S2 bakers
            </p>
            <p style={{ fontFamily: "'Crimson Pro', serif", color: C.mutedLight, fontSize: "13px", margin: 0 }}>
              {s2Data.length} bakers participated
            </p>
            <Ornament style={{ marginTop: "28px" }} />
          </section>

          {/* S2 AIRDROP PIE + SUMMARY STATS */}
          {s2Summary && (
            <section className="section-enter" style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "44px", animationDelay: "0.1s" }}>

              {/* Donut chart */}
              <div className="parchment-card chart-card" style={{ borderRadius: "20px", padding: "28px", flex: "1", minWidth: "270px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${C.borderGold}, transparent)` }} />
                <SectionTitle sub="Season II outcome distribution">Airdrop Analysis</SectionTitle>
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={s2Summary.map((d) => ({ name: d.status, value: d.player_count }))}
                      cx="50%" cy="50%" innerRadius={58} outerRadius={92}
                      paddingAngle={5} dataKey="value" stroke="none"
                    >
                      {s2Summary.map((d, i) => <Cell key={i} fill={AIRDROP_COLORS[d.status] || C.muted} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", color: C.cream, fontFamily: "'Crimson Pro', serif" }} formatter={(v, name) => [`${v} bakers`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <Ornament style={{ margin: "4px 0 14px" }} />
                <div style={{ display: "flex", justifyContent: "center", gap: "22px", flexWrap: "wrap" }}>
                  {s2Summary.map((d, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", justifyContent: "center" }}>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: AIRDROP_COLORS[d.status] }} />
                        <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: "12px", color: C.muted }}>{d.status.replace(/[✅🔴💀]/g, "").trim()}</span>
                      </div>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "19px", fontWeight: 900, color: AIRDROP_COLORS[d.status], margin: "0 0 1px" }}>{d.player_count}</p>
                      <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "11px", color: C.muted, margin: 0 }}>{parseFloat(d.percentage).toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* S2 extra summary stat cards */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: "1", minWidth: "200px", justifyContent: "center" }}>
                {[
                  { label: "Total Fees Spent",     val: `${s2Summary.reduce((a,d)=>a+parseFloat(d.total_fees_spent||0),0).toFixed(3)} ETH`, color: C.copper, icon: "⛽" },
                  { label: "Total Airdrop Given",  val: `${s2Summary.reduce((a,d)=>a+parseFloat(d.total_airdrop_received||0),0).toFixed(3)} ETH`, color: C.goldLight, icon: "🏆" },
                  { label: "Net Community P/L",    val: `${s2Summary.reduce((a,d)=>a+parseFloat(d.total_net_profit||0),0).toFixed(3)} ETH`, color: s2Summary.reduce((a,d)=>a+parseFloat(d.total_net_profit||0),0) >= 0 ? C.greenBright : C.redBright, icon: "📊" },
                ].map(({ label, val, color, icon }) => (
                  <div key={label} className="stat-card parchment-card" style={{ borderRadius: "14px", padding: "18px 20px", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }} />
                    <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "10px", color: C.muted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>{icon} {label}</p>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(16px,2vw,22px)", fontWeight: 900, color, margin: 0 }}>{val}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* S2 WALLET SEARCH */}
          <section className="section-enter" style={{ marginBottom: "44px", animationDelay: "0.18s" }}>
            <SectionTitle sub="Search any S2 baker's wallet">Baker Lookup — Season II</SectionTitle>
            <div style={{ position: "relative", display: "inline-block", width: "min(460px,100%)" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: "14px", pointerEvents: "none" }}>🔍</span>
              <input
                type="text"
                placeholder="Enter a wallet address..."
                value={s2Search}
                onChange={(e) => setS2Search(e.target.value)}
                className="search-input"
                style={{ padding: "13px 18px 13px 40px", width: "100%", borderRadius: "10px", border: `1px solid ${C.border}`, background: C.card, color: C.cream, fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", backgroundImage: `radial-gradient(ellipse at top left, rgba(201,124,10,0.04) 0%, transparent 60%)` }}
              />
            </div>
            {s2Search && (
              <div style={{ marginTop: "12px" }}>
                {s2Filtered.length === 0 ? (
                  <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", color: C.muted, fontSize: "15px" }}>No S2 baker found with that address.</p>
                ) : (
                  s2Filtered.slice(0, 20).map((user, i) => (
                    <div key={i} onClick={() => setSelectedUser(user)} className="row-item parchment-card"
                      style={{ display: "flex", alignItems: "center", gap: "10px", padding: "13px 17px", marginBottom: "6px", borderRadius: "10px", cursor: "pointer", position: "relative" }}>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "12px", color: C.muted, minWidth: "30px" }}>#{user.rank}</span>
                      <span style={{ flex: 1, fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: C.textSoft, wordBreak: "break-all" }}>{user.user_address}</span>
                      <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", fontWeight: 700, color: C.goldLight, whiteSpace: "nowrap" }}>{user.total_eth_spent.toFixed(3)} ETH</span>
                      <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: getStatusColor(user), flexShrink: 0 }} />
                    </div>
                  ))
                )}
              </div>
            )}
          </section>

          {/* PLAYER COMPARISON */}
          <section className="section-enter" style={{ animationDelay: "0.26s" }}>
            <SectionTitle sub="Compare any two bakers across seasons">Baker vs. Baker</SectionTitle>

            {/* Two-column search */}
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: "20px", alignItems: "flex-start" }}>
              {[
                { label: "Player A", season: compSeasonA, setSeason: setCompSeasonA, search: compSearchA, setSearch: setCompSearchA, results: compFilteredA, player: compPlayerA, setPlayer: setCompPlayerA, color: C.goldLight },
                { label: "Player B", season: compSeasonB, setSeason: setCompSeasonB, search: compSearchB, setSearch: setCompSearchB, results: compFilteredB, player: compPlayerB, setPlayer: setCompPlayerB, color: C.copper },
              ].map(({ label, season, setSeason, search: srch, setSearch: setSrch, results, player, setPlayer, color }) => (
                <div key={label} style={{ flex: "1", minWidth: "240px" }}>
                  <div style={{ display: "flex", gap: "8px", marginBottom: "8px", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "14px", color, fontWeight: 700, minWidth: "64px" }}>{label}</span>
                    <select
                      value={season}
                      onChange={(e) => { setSeason(e.target.value); setSrch(""); setPlayer(null); }}
                      style={{ padding: "6px 10px", borderRadius: "8px", border: `1px solid ${C.border}`, background: C.card, color: C.cream, fontFamily: "'Crimson Pro', serif", fontSize: "13px", cursor: "pointer", flex: 1 }}
                    >
                      <option value="s1">Season I</option>
                      <option value="s2">Season II</option>
                    </select>
                  </div>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Search wallet..."
                      value={srch}
                      onChange={(e) => { setSrch(e.target.value); setPlayer(null); }}
                      className="search-input"
                      style={{ padding: "11px 14px", width: "100%", borderRadius: "10px", border: `1px solid ${player ? color + "66" : C.border}`, background: C.card, color: C.cream, fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}
                    />
                    {srch && !player && results.length > 0 && (
                      <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 10, background: C.parchment, border: `1px solid ${C.border}`, borderRadius: "10px", marginTop: "4px", overflow: "hidden", boxShadow: "0 12px 32px rgba(0,0,0,0.5)" }}>
                        {results.map((u, i) => (
                          <div key={i} onClick={() => { setPlayer(u); setSrch(u.user_address); }}
                            style={{ padding: "10px 14px", cursor: "pointer", borderBottom: i < results.length - 1 ? `1px solid ${C.border}` : "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            onMouseEnter={(e) => e.currentTarget.style.background = C.cardHover}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: C.textSoft }}>{u.user_address.slice(0,10)}…{u.user_address.slice(-6)}</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ fontSize: "11px", color: C.goldLight }}>{u.total_eth_spent.toFixed(3)} ETH</span>
                              <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: getStatusColor(u) }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {player && (
                    <div style={{ marginTop: "8px", padding: "10px 14px", background: `${color}12`, border: `1px solid ${color}44`, borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", color: C.textSoft }}>{player.user_address.slice(0,10)}…</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: "12px", color }}>#{player.rank}</span>
                        <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: getStatusColor(player) }} />
                        <button onClick={() => { setPlayer(null); setSrch(""); }} style={{ background: "none", border: "none", color: C.muted, cursor: "pointer", fontSize: "14px", lineHeight: 1, padding: "0 2px" }}>×</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* VS divider */}
            {(!compPlayerA || !compPlayerB) && (
              <div style={{ textAlign: "center", padding: "20px", color: C.muted, fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontSize: "14px" }}>
                Search two wallets above to compare them
              </div>
            )}

            {/* Comparison chart + cards */}
            {compPlayerA && compPlayerB && (
              <div style={{ animation: "fadeUp 0.4s ease-out" }}>
                <div className="parchment-card" style={{ borderRadius: "20px", padding: "26px 22px", position: "relative", overflow: "hidden", marginBottom: "16px" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${C.borderGold}, transparent)` }} />
                  <div style={{ display: "flex", gap: "20px", justifyContent: "center", marginBottom: "16px", flexWrap: "wrap" }}>
                    {[{ label: "Player A", color: C.goldLight }, { label: "Player B", color: C.copper }].map(({ label, color }) => (
                      <div key={label} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: color }} />
                        <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: "13px", color: C.muted }}>{label}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ width: "100%", height: "clamp(180px,26vw,260px)" }}>
                    <ResponsiveContainer>
                      <BarChart data={compChartData} margin={{ top: 4, right: 4, left: -8, bottom: 0 }} barCategoryGap="30%">
                        <XAxis dataKey="metric" tick={{ fill: C.muted, fontSize: 11, fontFamily: "'Crimson Pro', serif" }} axisLine={{ stroke: C.border }} tickLine={false} />
                        <YAxis tick={{ fill: C.muted, fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", color: C.cream, fontFamily: "'Crimson Pro', serif" }}
                          formatter={(v, name) => [`${Number(v).toFixed(4)} ETH`, name === "a" ? `Player A (${compPlayerA.user_address.slice(0,8)}…)` : `Player B (${compPlayerB.user_address.slice(0,8)}…)`]}
                          cursor={{ fill: "rgba(201,124,10,0.04)" }}
                        />
                        <Bar dataKey="a" fill={C.goldLight} radius={[4, 4, 0, 0]} name="a" />
                        <Bar dataKey="b" fill={C.copper} radius={[4, 4, 0, 0]} name="b" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Summary cards */}
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  {[
                    { player: compPlayerA, label: "Player A", season: compSeasonA, color: C.goldLight },
                    { player: compPlayerB, label: "Player B", season: compSeasonB, color: C.copper },
                  ].map(({ player, label, season, color }) => (
                    <div key={label} className="parchment-card" style={{ flex: "1", minWidth: "220px", borderRadius: "16px", padding: "20px", position: "relative", overflow: "hidden" }}>
                      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${color}66, transparent)` }} />
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: "italic", fontWeight: 700, color, fontSize: "15px" }}>{label}</span>
                        <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: "10px", color: C.gold, letterSpacing: "0.12em", textTransform: "uppercase", padding: "2px 8px", border: `1px solid ${C.borderGold}`, borderRadius: "4px" }}>
                          {season === "s1" ? "Season I" : "Season II"}
                        </span>
                      </div>
                      <div style={{ background: `${C.bg}cc`, borderRadius: "8px", padding: "8px 12px", marginBottom: "8px", border: `1px solid ${C.border}` }}>
                        <p style={{ margin: 0, fontSize: "9px", color: C.muted, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Wallet</p>
                        <p style={{ margin: 0, fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: C.textSoft, wordBreak: "break-all" }}>{player.user_address}</p>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginBottom: "8px" }}>
                        {[
                          { label: "Rank",    val: `#${player.rank}` },
                          { label: "Batches", val: player.tx_count },
                          { label: "ETH In",  val: `${player.total_eth_spent.toFixed(4)}` },
                          { label: "Airdrop", val: `${player.airdrop_received.toFixed(4)}` },
                        ].map(({ label: l, val }) => (
                          <div key={l} style={{ background: `${C.bg}cc`, borderRadius: "8px", padding: "8px 10px", border: `1px solid ${C.border}` }}>
                            <p style={{ margin: 0, fontSize: "9px", color: C.muted, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>{l}</p>
                            <p style={{ margin: 0, fontSize: "14px", fontFamily: "'Playfair Display', serif", fontWeight: 700, color: C.ivory }}>{val}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ background: `${C.bg}cc`, borderRadius: "8px", padding: "10px 12px", border: `1px solid ${getStatusColor(player)}38` }}>
                        <p style={{ margin: 0, fontSize: "9px", color: C.muted, marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Net P/L</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <p style={{ margin: 0, fontSize: "18px", fontFamily: "'Playfair Display', serif", fontWeight: 900, color: getStatusColor(player) }}>
                            {player.net_profit > 0 ? "+" : ""}{player.net_profit.toFixed(4)} ETH
                          </p>
                          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: getStatusColor(player) }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </main>
      )}

      {/* ── S1 PAGE ──────────────────────────────────────────────────────── */}
      {page === "s1" && (
        <main style={{ maxWidth: "1160px", margin: "0 auto", padding: "44px clamp(16px,4vw,52px) 90px" }}>

          {/* ── HERO ─────────────────────────────────────────────────────── */}
          <section className="section-enter" style={{ textAlign: "center", marginBottom: "52px", position: "relative", padding: "52px 20px 44px", animationDelay: "0s" }}>
            {/* Ambient glow behind */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 20%, rgba(201,124,10,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />

            {/* Top ornamental border */}
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: "min(480px,90%)", height: "1px", background: `linear-gradient(90deg, transparent, ${C.borderGold} 30%, ${C.gold} 50%, ${C.borderGold} 70%, transparent)` }} />

            {/* Floating cookie left */}
            <img src="/cookie.png" alt="" aria-hidden="true" style={{
              position: "absolute", left: "clamp(6px,3vw,56px)", top: "28px",
              width: "clamp(26px,3.5vw,48px)", opacity: 0.22,
              transform: "rotate(-20deg)",
              filter: "sepia(0.4)",
              animation: "flourFloat 5s ease-in-out infinite",
            }} />
            <img src="/cookie.png" alt="" aria-hidden="true" style={{
              position: "absolute", right: "clamp(6px,3vw,56px)", top: "44px",
              width: "clamp(18px,2.5vw,34px)", opacity: 0.16,
              transform: "rotate(25deg)",
              filter: "sepia(0.4)",
              animation: "flourFloat 6.5s ease-in-out 1s infinite",
            }} />

            <img src="/chef.png" alt="Rugpull Bakery Chef" style={{
              width: "clamp(110px,15vw,185px)",
              display: "block",
              margin: "0 auto 18px",
              filter: "drop-shadow(0 20px 50px rgba(201,124,10,0.2)) sepia(0.1)",
            }} />

            <div style={{
              fontFamily: "'Crimson Pro', serif",
              fontSize: "clamp(10px,1.2vw,12px)",
              color: C.gold,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              marginBottom: "14px",
            }}>
              Season I · The Full Receipt
            </div>

            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(52px,10vw,100px)",
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: "10px",
              background: `linear-gradient(130deg, ${C.copper} 0%, ${C.goldLight} 40%, ${C.amber} 65%, ${C.goldLight} 85%, ${C.copper} 100%)`,
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              animation: "goldFlow 5s ease infinite",
            }}>
              {totalETH.toFixed(2)} ETH
            </div>

            <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", color: C.muted, fontSize: "clamp(13px,1.5vw,16px)", margin: 0 }}>
              Total spent by all bakers
            </p>

            <Ornament style={{ marginTop: "28px" }} />
          </section>

          {/* ── STAT CARDS ───────────────────────────────────────────────── */}
          {chartData && (
            <section className="section-enter" style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "40px", animationDelay: "0.1s" }}>
              {[
                { label: "Reward Pool",  val: `${chartData.rewardPool.toFixed(2)}`,  unit: "ETH", color: C.goldLight, icon: "🏆" },
                { label: "Reg. Fees",   val: `${chartData.regFees.toFixed(2)}`,    unit: "ETH", color: C.amber,     icon: "📋" },
                { label: "Gas Fees",    val: `${chartData.gasFees.toFixed(2)}`,    unit: "ETH", color: C.copper,    icon: "⛽" },
                ...(airdropSummary || []).map((d) => ({
                  label: d.status.replace(/[✅🔴💀]/g,"").trim(),
                  val: String(d.player_count),
                  unit: `${parseFloat(d.percentage).toFixed(1)}%`,
                  color: AIRDROP_COLORS[d.status],
                  icon: d.status.match(/[✅🔴💀]/)?.[0] || "•",
                })),
              ].map(({ label, val, unit, color, icon }) => (
                <div key={label} className="stat-card parchment-card" style={{ borderRadius: "14px", padding: "18px 20px", flex: "1", minWidth: "120px", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${color}55, transparent)` }} />
                  <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "10px", color: C.muted, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {icon} {label}
                  </p>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(16px,2vw,22px)", fontWeight: 900, color, margin: "0 0 3px", lineHeight: 1 }}>
                    {val}
                  </p>
                  <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "12px", color: C.muted, margin: 0 }}>{unit}</p>
                </div>
              ))}
            </section>
          )}

          {/* ── CHARTS ROW ───────────────────────────────────────────────── */}
          <section className="section-enter" style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "44px", animationDelay: "0.18s" }}>

            {/* Airdrop donut */}
            {airdropSummary && (
              <div className="parchment-card chart-card" style={{ borderRadius: "20px", padding: "28px", flex: "1", minWidth: "270px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${C.borderGold}, transparent)` }} />
                <SectionTitle sub="Season I outcome distribution">
                  Airdrop Analysis
                </SectionTitle>
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={airdropSummary.map((d) => ({ name: d.status, value: d.player_count }))}
                      cx="50%" cy="50%" innerRadius={58} outerRadius={92}
                      paddingAngle={5} dataKey="value" stroke="none"
                    >
                      {airdropSummary.map((d, i) => <Cell key={i} fill={AIRDROP_COLORS[d.status] || C.muted} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", color: C.cream, fontFamily: "'Crimson Pro', serif" }}
                      formatter={(v, name) => [`${v} bakers`, name]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <Ornament style={{ margin: "4px 0 14px" }} />
                <div style={{ display: "flex", justifyContent: "center", gap: "22px", flexWrap: "wrap" }}>
                  {airdropSummary.map((d, i) => (
                    <div key={i} style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", justifyContent: "center" }}>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: AIRDROP_COLORS[d.status] }} />
                        <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: "12px", color: C.muted }}>
                          {d.status.replace(/[✅🔴💀]/g, "").trim()}
                        </span>
                      </div>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "19px", fontWeight: 900, color: AIRDROP_COLORS[d.status], margin: "0 0 1px" }}>
                        {d.player_count}
                      </p>
                      <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "11px", color: C.muted, margin: 0 }}>
                        {parseFloat(d.percentage).toFixed(1)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rewards vs Fees donut */}
            {chartData && (
              <div className="parchment-card chart-card" style={{ borderRadius: "20px", padding: "28px", flex: "1", minWidth: "270px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${C.borderGold}, transparent)` }} />
                <SectionTitle sub="Where the ETH went">
                  Rewards vs. Fees
                </SectionTitle>
                <ResponsiveContainer width="100%" height={210}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Reward Pool", value: chartData.rewardPool },
                        { name: "Total Fees",  value: chartData.totalFees },
                      ]}
                      cx="50%" cy="50%" innerRadius={58} outerRadius={92}
                      paddingAngle={5} dataKey="value" stroke="none"
                    >
                      <Cell fill={C.goldLight} />
                      <Cell fill={C.copper} />
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", color: C.cream, fontFamily: "'Crimson Pro', serif" }}
                      formatter={(v) => [v.toFixed(3) + " ETH"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <Ornament style={{ margin: "4px 0 14px" }} />
                <div style={{ display: "flex", justifyContent: "center", gap: "22px", flexWrap: "wrap" }}>
                  {[
                    { label: "Reward Pool", val: chartData.rewardPool, col: C.goldLight },
                    { label: "Reg Fees",    val: chartData.regFees,    col: C.amber },
                    { label: "Gas Fees",    val: chartData.gasFees,    col: C.copper },
                  ].map(({ label, val, col }) => (
                    <div key={label} style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", justifyContent: "center" }}>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: col }} />
                        <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: "12px", color: C.muted }}>{label}</span>
                      </div>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontSize: "19px", fontWeight: 900, color: col, margin: 0 }}>
                        {val.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* ── WALLET LOOKUP ─────────────────────────────────────────────── */}
          <section className="section-enter" style={{ marginBottom: "40px", animationDelay: "0.26s" }}>
            <SectionTitle sub="Search any baker's wallet to see their outcome">
              Baker Lookup
            </SectionTitle>
            <div style={{ position: "relative", display: "inline-block", width: "min(460px, 100%)" }}>
              <span style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: C.muted, fontSize: "14px", pointerEvents: "none" }}>
                🔍
              </span>
              <input
                type="text"
                placeholder="Enter a wallet address..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
                style={{
                  padding: "13px 18px 13px 40px",
                  width: "100%",
                  borderRadius: "10px",
                  border: `1px solid ${C.border}`,
                  background: C.card,
                  color: C.cream,
                  fontSize: "13px",
                  fontFamily: "'JetBrains Mono', monospace",
                  backgroundImage: `radial-gradient(ellipse at top left, rgba(201,124,10,0.04) 0%, transparent 60%)`,
                }}
              />
            </div>

            {search && (
              <div style={{ marginTop: "12px" }}>
                {filtered.length === 0 ? (
                  <p style={{ fontFamily: "'Crimson Pro', serif", fontStyle: "italic", color: C.muted, fontSize: "15px" }}>
                    No baker found with that address.
                  </p>
                ) : (
                  filtered.slice(0, 20).map((user, i) => {
                    const au = airdropData.find(a => a.user_address === user.user_address) || user;
                    return (
                      <div key={i} onClick={() => setSelectedUser(au)} className="row-item parchment-card"
                        style={{ display: "flex", alignItems: "center", gap: "10px", padding: "13px 17px", marginBottom: "6px", borderRadius: "10px", cursor: "pointer", position: "relative" }}>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "12px", color: C.muted, minWidth: "30px" }}>#{user.rank}</span>
                        <span style={{ flex: 1, fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: C.textSoft, wordBreak: "break-all" }}>
                          {user.user_address}
                        </span>
                        <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "13px", fontWeight: 700, color: C.goldLight, whiteSpace: "nowrap" }}>
                          {user.total_eth_spent.toFixed(3)} ETH
                        </span>
                        <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: getStatusColor(au), flexShrink: 0 }} />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </section>

          {/* ── TOP MINTERS TABLE ─────────────────────────────────────────── */}
          <section className="section-enter" style={{ marginBottom: "44px", animationDelay: "0.34s" }}>
            <SectionTitle sub="The top 10 bakers by ETH spent">
              Baker's Leaderboard
            </SectionTitle>
            <div className="parchment-card" style={{ borderRadius: "18px", overflow: "hidden", position: "relative" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${C.borderGold}, transparent)` }} />

              {/* Table header */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr 120px 64px 96px",
                gap: "8px",
                padding: "12px 20px",
                borderBottom: `1px solid ${C.border}`,
                background: `rgba(201,124,10,0.04)`,
              }}>
                {["No.", "Address", "ETH Spent", "Batches", "Status"].map((h) => (
                  <span key={h} style={{ fontFamily: "'Crimson Pro', serif", fontSize: "10px", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    {h}
                  </span>
                ))}
              </div>

              {data.slice(0, 10).map((user, i) => {
                const au = airdropData.find(a => a.user_address === user.user_address);
                const sc = getStatusColor(au);
                const rankBadge = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${user.rank}`;
                const statusText = !au ? "—" : au.airdrop_received === 0 ? "Rugged" : au.net_profit > 0 ? "Recov." : "Loss";

                return (
                  <div key={i}
                    onClick={() => setSelectedUser(au || user)}
                    className="row-item"
                    style={{
                      display: "grid",
                      gridTemplateColumns: "48px 1fr 120px 64px 96px",
                      gap: "8px",
                      padding: "14px 20px",
                      cursor: "pointer",
                      borderBottom: i < 9 ? `1px solid ${C.border}` : "none",
                      alignItems: "center",
                      background: "transparent",
                      border: "1px solid transparent",
                    }}>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", color: i < 3 ? C.goldLight : C.muted, fontWeight: 700 }}>
                      {rankBadge}
                    </span>
                    <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: C.textSoft }}>
                      {user.user_address.slice(0, 8)}…{user.user_address.slice(-6)}
                    </span>
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "14px", fontWeight: 700, color: C.goldLight }}>
                      {user.total_eth_spent.toFixed(3)} ETH
                    </span>
                    <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: "13px", color: C.muted }}>
                      {user.tx_count}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: sc, flexShrink: 0 }} />
                      <span style={{ fontFamily: "'Crimson Pro', serif", fontSize: "12px", color: sc, fontWeight: 600 }}>
                        {statusText}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── BAR CHART ────────────────────────────────────────────────── */}
          <section className="section-enter" style={{ animationDelay: "0.42s" }}>
            <SectionTitle sub="ETH spent across the top 10 bakers">
              Daily Totals
            </SectionTitle>
            <div className="parchment-card chart-card" style={{ borderRadius: "20px", padding: "26px 22px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "2px", background: `linear-gradient(90deg, transparent, ${C.borderGold}, transparent)` }} />
              <div style={{ width: "100%", height: "clamp(190px,28vw,285px)" }}>
                <ResponsiveContainer>
                  <BarChart data={data.slice(0, 10)} margin={{ top: 4, right: 4, left: -8, bottom: 0 }}>
                    <XAxis
                      dataKey="user_address"
                      tickFormatter={(a) => a.slice(0, 6)}
                      tick={{ fill: C.muted, fontSize: 10, fontFamily: "'JetBrains Mono', monospace" }}
                      axisLine={{ stroke: C.border }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: C.muted, fontSize: 10, fontFamily: "'Crimson Pro', serif" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: "10px", color: C.cream, fontFamily: "'Crimson Pro', serif" }}
                      formatter={(v) => [v.toFixed(3) + " ETH", "Spent"]}
                      labelFormatter={(v) => `${v.slice(0, 6)}…${v.slice(-4)}`}
                      cursor={{ fill: "rgba(201,124,10,0.05)" }}
                    />
                    <Bar dataKey="total_eth_spent" radius={[5, 5, 0, 0]}>
                      {data.slice(0, 10).map((_, i) => (
                        <Cell
                          key={i}
                          fill={i === 0 ? C.goldLight : i === 1 ? C.amber : i === 2 ? C.gold : C.copper}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer style={{
        textAlign: "center",
        padding: "30px 20px",
        borderTop: `1px solid ${C.border}`,
        background: `${C.bgDeep}`,
      }}>
        <Ornament style={{ marginBottom: "14px" }} />
        <a
          href="https://x.com/0xAirr"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
          style={{
            fontFamily: "'Crimson Pro', serif",
            fontStyle: "italic",
            fontSize: "14px",
            color: C.muted,
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}
        >
          @0xAirr
        </a>
        <p style={{ fontFamily: "'Crimson Pro', serif", fontSize: "11px", color: C.border, margin: "10px 0 0", letterSpacing: "0.08em" }}>
          RUGPULL BAKERY · SEASON I
        </p>
      </footer>

      {/* Bottom accent bar */}
      <div style={{ height: "3px", background: `linear-gradient(90deg, transparent 0%, ${C.copper} 15%, ${C.goldLight} 50%, ${C.copper} 85%, transparent 100%)` }} />
    </div>
  );
}

export default App;
