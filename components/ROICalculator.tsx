"use client";

import { useState, useEffect, useRef } from "react";

const fmt = (n) =>
  "R " + Math.round(n).toLocaleString("en-ZA");

const lerp = (a, b, t) => a + (b - a) * t;

function AnimatedNumber({ value, prefix = "", suffix = "", fontSize = 36, mobileFontSize = null }) {
  const [display, setDisplay] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const ref = useRef(null);
  const start = useRef(0);
  const duration = 600;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const from = start.current;
    const to = value;
    const began = performance.now();
    const tick = (now) => {
      const t = Math.min((now - began) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(lerp(from, to, ease)));
      if (t < 1) ref.current = requestAnimationFrame(tick);
      else start.current = to;
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  const actualFontSize = isMobile && mobileFontSize ? mobileFontSize : fontSize;

  return (
    <span style={{ fontSize: actualFontSize, fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
      {prefix}{display.toLocaleString("en-ZA")}{suffix}
    </span>
  );
}

export default function ROICalculator() {
  const [monthly, setMonthly] = useState(50000);
  const [inefficiency, setInefficiency] = useState(20);
  const [recovery, setRecovery] = useState(55);
  const [payback, setPayback] = useState(36);
  const [input, setInput] = useState("50000");
  const [focused, setFocused] = useState(false);

  const annual = monthly * 12;
  const wastedMonthly = monthly * (inefficiency / 100);
  const wastedAnnual = wastedMonthly * 12;
  const recoverableMonthly = wastedMonthly * (recovery / 100);
  const recoverableAnnual = recoverableMonthly * 12;
  const investmentEstimate = recoverableAnnual * (payback / 12);
  const roiPercent = investmentEstimate > 0
    ? Math.round((recoverableAnnual / investmentEstimate) * 100)
    : 0;

  const handleInput = (val) => {
    setInput(val);
    const n = parseFloat(val.replace(/[^0-9.]/g, ""));
    if (!isNaN(n) && n >= 0) setMonthly(n);
  };

  const sliderStyle = (val, min, max, color) => {
    const pct = ((val - min) / (max - min)) * 100;
    return {
      background: `linear-gradient(to right, ${color} 0%, ${color} ${pct}%, #2a3040 ${pct}%, #2a3040 100%)`,
    };
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0d1117",
      fontFamily: "'DM Sans', sans-serif",
      color: "#e8eaed",
      padding: "0",
      overflowX: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:wght@300;400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        input[type=range] {
          -webkit-appearance: none;
          width: 100%;
          height: 4px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
          transition: all 0.2s;
        }
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #40a8c4;
          box-shadow: 0 0 0 3px rgba(64,168,196,0.2);
          cursor: pointer;
          transition: box-shadow 0.2s;
        }
        input[type=range]::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 6px rgba(64,168,196,0.25);
        }
        input[type=range]::-moz-range-thumb {
          width: 18px; height: 18px;
          border-radius: 50%;
          background: #fff;
          border: 2px solid #40a8c4;
          cursor: pointer;
        }

        .result-card {
          background: #161b22;
          border: 1px solid #21262d;
          border-radius: 12px;
          padding: 24px;
          transition: transform 0.2s, border-color 0.2s;
        }
        .result-card:hover {
          transform: translateY(-2px);
          border-color: #40a8c4;
        }

        .gold-card {
          background: linear-gradient(135deg, #1a1a0f 0%, #1e1a08 100%);
          border: 1px solid #c9a84c;
        }
        .gold-card:hover { border-color: #f0c040; }

        .input-field {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 8px;
          color: #e8eaed;
          font-size: 22px;
          font-family: 'Playfair Display', serif;
          font-weight: 700;
          padding: 12px 16px;
          width: 100%;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field:focus {
          border-color: #40a8c4;
          box-shadow: 0 0 0 3px rgba(64,168,196,0.15);
        }

        .tag {
          display: inline-block;
          background: rgba(64,168,196,0.12);
          color: #40a8c4;
          border: 1px solid rgba(64,168,196,0.25);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 1.5px;
          padding: 3px 8px;
          text-transform: uppercase;
        }

        .divider {
          height: 1px;
          background: linear-gradient(to right, transparent, #30363d, transparent);
          margin: 24px 0;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.5s ease both; }
        .fade-up-1 { animation-delay: 0.05s; }
        .fade-up-2 { animation-delay: 0.1s; }
        .fade-up-3 { animation-delay: 0.15s; }
        .fade-up-4 { animation-delay: 0.2s; }
        .fade-up-5 { animation-delay: 0.25s; }

        .pulse-dot {
          width: 8px; height: 8px;
          border-radius: 50%;
          background: #40a8c4;
          display: inline-block;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          align-items: start;
        }
        .results-mini-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
        }

        @media (max-width: 768px) {
          .main-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .results-mini-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .result-card {
            padding: 16px;
          }
          .input-field {
            font-size: 18px;
            padding: 10px 14px;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #0d1117 100%)",
        borderBottom: "1px solid #21262d",
        padding: "20px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 12,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: "#fff" }}>
                SmartLux
              </span>
              <span style={{ color: "#40a8c4", fontSize: 18 }}>Automation</span>
            </div>
            <div style={{ fontSize: 11, color: "#8b949e", letterSpacing: "1.5px", textTransform: "uppercase", marginTop: 2 }}>
              ROI Discovery Calculator
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="pulse-dot" />
          <span style={{ fontSize: 12, color: "#8b949e" }}>Live calculation</span>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>

        {/* Intro line */}
        <div className="fade-up" style={{ marginBottom: 32 }}>
          <p style={{ color: "#8b949e", fontSize: 14, lineHeight: 1.6 }}>
            Use this during discovery calls. Enter the prospect's monthly electricity spend and adjust the sliders to build a live ROI picture in the conversation.
          </p>
        </div>

        <div className="main-grid">

          {/* LEFT — Inputs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Monthly spend */}
            <div className="result-card fade-up fade-up-1">
              <div style={{ marginBottom: 12 }}>
                <span className="tag">Step 1</span>
              </div>
              <label style={{ fontSize: 13, color: "#8b949e", display: "block", marginBottom: 8 }}>
                Monthly electricity spend
              </label>
              <div style={{ position: "relative" }}>
                <span style={{
                  position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                  fontSize: 22, fontFamily: "'Playfair Display', serif", fontWeight: 700,
                  color: "#40a8c4", pointerEvents: "none"
                }}>R</span>
                <input
                  className="input-field"
                  style={{ paddingLeft: 36 }}
                  value={focused ? input : monthly.toLocaleString("en-ZA")}
                  onChange={e => handleInput(e.target.value)}
                  onFocus={() => { setFocused(true); setInput(String(monthly)); }}
                  onBlur={() => setFocused(false)}
                  placeholder="50,000"
                />
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#555e6b" }}>
                Annual spend: {fmt(annual)} / year
              </div>
            </div>

            {/* Inefficiency slider */}
            <div className="result-card fade-up fade-up-2">
              <div style={{ marginBottom: 12 }}>
                <span className="tag">Step 2</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 13, color: "#8b949e" }}>Estimated inefficiency</label>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#ef5350" }}>
                  {inefficiency}%
                </span>
              </div>
              <input
                type="range" min={10} max={40} step={1}
                value={inefficiency}
                onChange={e => setInefficiency(Number(e.target.value))}
                style={sliderStyle(inefficiency, 10, 40, "#ef5350")}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#555e6b" }}>
                <span>10% — Conservative</span>
                <span>40% — High waste</span>
              </div>
              <div style={{ marginTop: 12, padding: "8px 12px", background: "rgba(239,83,80,0.08)", borderRadius: 6, borderLeft: "3px solid #ef5350" }}>
                <span style={{ fontSize: 12, color: "#ef5350" }}>
                  Monthly waste: {fmt(wastedMonthly)} &nbsp;·&nbsp; Annual: {fmt(wastedAnnual)}
                </span>
              </div>
            </div>

            {/* Recovery slider */}
            <div className="result-card fade-up fade-up-3">
              <div style={{ marginBottom: 12 }}>
                <span className="tag">Step 3</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 13, color: "#8b949e" }}>Recoverable via SmartLux</label>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#40a8c4" }}>
                  {recovery}%
                </span>
              </div>
              <input
                type="range" min={40} max={70} step={1}
                value={recovery}
                onChange={e => setRecovery(Number(e.target.value))}
                style={sliderStyle(recovery, 40, 70, "#40a8c4")}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#555e6b" }}>
                <span>40% — Partial</span>
                <span>70% — Fully optimised</span>
              </div>
            </div>

            {/* Payback slider */}
            <div className="result-card fade-up fade-up-4">
              <div style={{ marginBottom: 12 }}>
                <span className="tag">Step 4</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <label style={{ fontSize: 13, color: "#8b949e" }}>Target payback period</label>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#c9a84c" }}>
                  {payback < 12 ? `${payback}mo` : payback === 12 ? "1 yr" : `${Math.round(payback / 12 * 10) / 10} yrs`}
                </span>
              </div>
              <input
                type="range" min={12} max={84} step={6}
                value={payback}
                onChange={e => setPayback(Number(e.target.value))}
                style={sliderStyle(payback, 12, 84, "#c9a84c")}
              />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#555e6b" }}>
                <span>1 year</span>
                <span>7 years</span>
              </div>
            </div>
          </div>

          {/* RIGHT — Results */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* The key number */}
            <div className="result-card gold-card fade-up fade-up-1" style={{ textAlign: "center", padding: "32px 24px" }}>
              <div style={{ marginBottom: 12 }}>
                <span className="tag" style={{ background: "rgba(201,168,76,0.12)", color: "#c9a84c", borderColor: "rgba(201,168,76,0.3)" }}>
                  Monthly recovery
                </span>
              </div>
              <div style={{ color: "#c9a84c", marginBottom: 4 }}>
                <AnimatedNumber value={Math.round(recoverableMonthly)} prefix="R " fontSize={48} mobileFontSize={36} />
              </div>
              <div style={{ fontSize: 13, color: "#8b949e", marginTop: 4 }}>
                being lost every month that could be recovered
              </div>
              <div className="divider" style={{ margin: "20px 0" }} />
              <div style={{ fontSize: 13, color: "#8b949e", marginBottom: 4 }}>Annual recovery</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: "#c9a84c" }}>
                <AnimatedNumber value={Math.round(recoverableAnnual)} prefix="R " fontSize={28} mobileFontSize={24} />
              </div>
            </div>

            {/* Script line */}
            <div style={{
              background: "linear-gradient(135deg, #0f1f2a 0%, #0a1520 100%)",
              border: "1px solid rgba(64,168,196,0.3)",
              borderLeft: "4px solid #40a8c4",
              borderRadius: 12,
              padding: "20px 24px",
            }} className="fade-up fade-up-2">
              <div style={{ fontSize: 11, color: "#40a8c4", letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 12 }}>
                Say this on the call
              </div>
              <p style={{ fontSize: 14, color: "#c8d0d8", lineHeight: 1.7, fontStyle: "italic" }}>
                "Based on your current spend of {fmt(monthly)} per month, we're typically looking at around{" "}
                <strong style={{ color: "#fff" }}>{fmt(recoverableMonthly)} per month</strong>{" "}
                — that's <strong style={{ color: "#fff" }}>{fmt(recoverableAnnual)} per year</strong>{" "}
                — that's potentially being lost and could be recovered."
              </p>
              <div style={{ marginTop: 12, fontSize: 12, color: "#555e6b", fontStyle: "italic" }}>
                Pause. Let that number land.
              </div>
            </div>

            {/* Three result cards */}
            <div className="results-mini-grid fade-up fade-up-3">
              {[
                { label: "Inefficiency", value: fmt(wastedMonthly) + "/mo", sub: "going to waste", color: "#ef5350" },
                { label: "Recoverable", value: fmt(recoverableMonthly) + "/mo", sub: "via SmartLux", color: "#40a8c4" },
                { label: "ROI", value: roiPercent + "%", sub: "annual return", color: "#c9a84c" },
              ].map((c, i) => (
                <div key={i} className="result-card" style={{ textAlign: "center", padding: "16px 12px" }}>
                  <div style={{ fontSize: 10, color: "#8b949e", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>
                    {c.label}
                  </div>
                  <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, fontWeight: 700, color: c.color }}>
                    {c.value}
                  </div>
                  <div style={{ fontSize: 10, color: "#555e6b", marginTop: 4 }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Payback context */}
            <div className="result-card fade-up fade-up-4">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: "#8b949e" }}>Implied investment estimate</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#fff" }}>
                  {fmt(investmentEstimate)}
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: "#8b949e" }}>Payback period</span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: "#c9a84c" }}>
                  {payback < 12 ? `${payback} months` : `${Math.round(payback / 12 * 10) / 10} years`}
                </span>
              </div>
              <div className="divider" />
              <div style={{
                padding: "10px 14px",
                background: "rgba(64,168,196,0.06)",
                borderRadius: 8,
                fontSize: 12,
                color: "#8b949e",
                lineHeight: 1.6
              }}>
                <strong style={{ color: "#40a8c4" }}>Script note:</strong>{" "}
                "That's typically why most setups fall into a {payback < 24 ? "1–2" : payback < 48 ? "2–4" : "2–6"} year payback range — depending on how integrated the system is and how aggressively you optimise."
              </div>
            </div>

            {/* Reset */}
            <button
              onClick={() => { setMonthly(50000); setInput("50000"); setInefficiency(20); setRecovery(55); setPayback(36); }}
              style={{
                background: "transparent",
                border: "1px solid #30363d",
                borderRadius: 8,
                color: "#8b949e",
                fontSize: 13,
                padding: "10px 0",
                cursor: "pointer",
                width: "100%",
                transition: "border-color 0.2s, color 0.2s",
              }}
              onMouseOver={e => { e.target.style.borderColor = "#40a8c4"; e.target.style.color = "#40a8c4"; }}
              onMouseOut={e => { e.target.style.borderColor = "#30363d"; e.target.style.color = "#8b949e"; }}
            >
              Reset to defaults
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, textAlign: "center", fontSize: 11, color: "#444d56", lineHeight: 1.6 }}>
          SmartLux Automation &nbsp;·&nbsp; Powered by Loxone &nbsp;·&nbsp; sales@smartlux.co.za
          <br />
          Figures are projections based on industry benchmarks. Actual results vary by facility.
        </div>
      </div>
    </div>
  );
}
