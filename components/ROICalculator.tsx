"use client";

import { useState, useEffect, useRef } from "react";
import { Building2, Hotel, Building, Factory, ShoppingBag, Home } from "lucide-react";

const INDUSTRIES = {
  general:     { label:"General Commercial",    Icon:Building2,   inefficiencyMin:10, inefficiencyMax:40, inefficiencyDefault:20, recoveryMin:40, recoveryMax:70, recoveryDefault:55, paybackDefault:36, insight:"Most commercial facilities waste 20–35% on uncoordinated systems running without occupancy logic." },
  hospitality: { label:"Boutique Hospitality",  Icon:Hotel,       inefficiencyMin:30, inefficiencyMax:60, inefficiencyDefault:38, recoveryMin:55, recoveryMax:75, recoveryDefault:65, paybackDefault:24, insight:"Over 40% of hotel energy goes to HVAC alone. Rooms heat and cool 24/7 regardless of occupancy." },
  offices:     { label:"Offices",               Icon:Building,    inefficiencyMin:15, inefficiencyMax:40, inefficiencyDefault:25, recoveryMin:45, recoveryMax:70, recoveryDefault:58, paybackDefault:30, insight:"Average office wastes 25–35% on after-hours lighting and HVAC running in empty spaces." },
  industrial:  { label:"Commercial & Industrial",Icon:Factory,    inefficiencyMin:15, inefficiencyMax:45, inefficiencyDefault:28, recoveryMin:45, recoveryMax:70, recoveryDefault:60, paybackDefault:36, insight:"Lighting and HVAC are the two biggest costs — and the two systems with the least oversight." },
  retail:      { label:"Retail & Restaurants",  Icon:ShoppingBag, inefficiencyMin:15, inefficiencyMax:40, inefficiencyDefault:22, recoveryMin:40, recoveryMax:65, recoveryDefault:55, paybackDefault:30, insight:"Energy runs at full capacity during prep and cleaning hours when the space is largely empty." },
  residential: { label:"Residential",           Icon:Home,        inefficiencyMin:10, inefficiencyMax:40, inefficiencyDefault:18, recoveryMin:40, recoveryMax:65, recoveryDefault:52, paybackDefault:48, insight:"Homes run lighting, climate and security on separate systems with no coordination or occupancy logic." },
};

const fmt = (n: number) => "R " + Math.round(n).toLocaleString("en-ZA");

function useAnimatedNumber(value: number, duration = 500) {
  const [display, setDisplay] = useState(value);
  const startRef = useRef(value);
  const rafRef = useRef<number | null>(null);
  useEffect(() => {
    const from = startRef.current;
    const to = value;
    const began = performance.now();
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const tick = (now: number) => {
      const t = Math.min((now - began) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * ease));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
      else startRef.current = to;
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);
  return display;
}

function Slider({ value, min, max, step=1, onChange, color, label, subleft, subright, suffix="%", prefix="" }: {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  color: string;
  label: string;
  subleft: string;
  subright: string;
  suffix?: string;
  prefix?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const displayValue = suffix === "" && prefix === "" ? `R ${value.toLocaleString("en-ZA")}` : `${prefix}${value.toLocaleString("en-ZA")}${suffix}`;
  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:8,alignItems:"center"}}>
        <span style={{fontSize:13,color:"#8b949e"}}>{label}</span>
        <span style={{fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:700,color}}>{displayValue}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value} onChange={e=>onChange(Number(e.target.value))}
        style={{width:"100%",height:4,borderRadius:2,outline:"none",cursor:"pointer",appearance:"none",WebkitAppearance:"none",
          background:`linear-gradient(to right,${color} 0%,${color} ${pct}%,#2a3040 ${pct}%,#2a3040 100%)`}}/>
      <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:11,color:"#444d56"}}>
        <span>{subleft}</span><span>{subright}</span>
      </div>
    </div>
  );
}

export default function ROICalculator() {
  const [industryKey, setIndustryKey] = useState<keyof typeof INDUSTRIES>("general");
  const [monthly, setMonthly] = useState(50000);
  const [inputVal, setInputVal] = useState("50,000");
  const [focused, setFocused] = useState(false);
  const [inefficiency, setInefficiency] = useState(20);
  const [recovery, setRecovery] = useState(55);
  const [payback, setPayback] = useState(36);
  const [investment, setInvestment] = useState(150000);
  const [investmentInput, setInvestmentInput] = useState("150,000");
  const [investmentFocused, setInvestmentFocused] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"sales" | "prospect">("sales");
  const [viewDropOpen, setViewDropOpen] = useState(false);
  const isProspect = viewMode === "prospect";
  const ind = INDUSTRIES[industryKey];

  useEffect(() => {
    setInefficiency(ind.inefficiencyDefault);
    setRecovery(ind.recoveryDefault);
    setPayback(ind.paybackDefault);
  }, [industryKey, ind.inefficiencyDefault, ind.recoveryDefault, ind.paybackDefault]);

  const wastedMonthly = monthly * (inefficiency / 100);
  const recoverableMonthly = wastedMonthly * (recovery / 100);
  const recoverableAnnual = recoverableMonthly * 12;
  const roiPct = investment > 0 ? Math.round((recoverableAnnual / investment) * 100) : 0;
  const calculatedPaybackMonths = recoverableMonthly > 0 ? Math.round(investment / recoverableMonthly) : 0;

  const animRM = useAnimatedNumber(Math.round(recoverableMonthly));
  const animRA = useAnimatedNumber(Math.round(recoverableAnnual));
  const animW  = useAnimatedNumber(Math.round(wastedMonthly));
  const animI  = useAnimatedNumber(Math.round(investment));
  const animRoi= useAnimatedNumber(roiPct);
  const animPayback = useAnimatedNumber(calculatedPaybackMonths);

  const paybackLabel = calculatedPaybackMonths <= 12 ? `${calculatedPaybackMonths} mo` : calculatedPaybackMonths < 24 ? `${(calculatedPaybackMonths/12).toFixed(1)} yrs` : `${Math.round(calculatedPaybackMonths/12)} yrs`;
  const paybackRange = calculatedPaybackMonths <= 24 ? "1-2" : calculatedPaybackMonths <= 48 ? "2-4" : "2-6";

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;1,400&display=swap');
    *{box-sizing:border-box;margin:0;padding:0;}
    input[type=range]{-webkit-appearance:none;}
    input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid #40a8c4;box-shadow:0 0 0 3px rgba(64,168,196,0.18);cursor:pointer;transition:box-shadow 0.2s;}
    input[type=range]::-webkit-slider-thumb:hover{box-shadow:0 0 0 6px rgba(64,168,196,0.22);}
    input[type=range]::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#fff;border:2px solid #40a8c4;cursor:pointer;}
    .card{background:#161b22;border:1px solid #21262d;border-radius:12px;padding:20px;transition:border-color 0.2s;}
    .card:hover{border-color:#30363d;}
    .tag{display:inline-block;background:rgba(64,168,196,0.1);color:#40a8c4;border:1px solid rgba(64,168,196,0.2);border-radius:4px;font-size:10px;font-weight:600;letter-spacing:1.5px;padding:3px 8px;text-transform:uppercase;}
    .divider{height:1px;background:linear-gradient(to right,transparent,#30363d,transparent);margin:16px 0;}
    .drop-item{padding:11px 14px;cursor:pointer;border-radius:8px;transition:background 0.15s;display:flex;align-items:center;gap:10px;font-size:14px;color:#c8d0d8;}
    .drop-item:hover{background:#21262d;}
    .drop-item.active{background:rgba(64,168,196,0.1);color:#40a8c4;}
    .pulse{width:8px;height:8px;border-radius:50%;background:#40a8c4;display:inline-block;animation:pulse 2s infinite;}
    @keyframes pulse{0%,100%{opacity:1;transform:scale(1);}50%{opacity:0.4;transform:scale(0.8);}}
    .reset-btn{background:transparent;border:1px solid #30363d;border-radius:8px;color:#8b949e;font-size:13px;padding:10px 0;cursor:pointer;width:100%;transition:border-color 0.2s,color 0.2s;font-family:'DM Sans',sans-serif;}
    .reset-btn:hover{border-color:#40a8c4;color:#40a8c4;}
    .two-col{display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start;}
    .three-col{display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;}
    @media(max-width:768px){
      .two-col{grid-template-columns:1fr!important;gap:14px!important;}
      .three-col{grid-template-columns:1fr!important;gap:10px!important;}
      .card{padding:16px;}
      .gold-number{font-size:36px!important;}
      .annual-number{font-size:24px!important;}
    }
  `;

  return (
    <div style={{minHeight:"100vh",background:"#0d1117",fontFamily:"'DM Sans',sans-serif",color:"#e8eaed"}}>
      <style>{css}</style>

      {/* Header */}
      <div style={{background:"linear-gradient(180deg,#1a1a2e 0%,#0d1117 100%)",borderBottom:"1px solid #21262d",padding:"18px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10}}>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:700,color:"#fff"}}>SmartLux</span>
            <span style={{color:"#40a8c4",fontSize:18,fontFamily:"'Playfair Display',serif"}}>Automation</span>
          </div>
          <div style={{fontSize:11,color:"#8b949e",letterSpacing:"1.5px",textTransform:"uppercase",marginTop:2}}>ROI Discovery Calculator</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
          <div style={{position:"relative"}}>
            <button onClick={()=>setViewDropOpen(o=>!o)} style={{background:isProspect?"rgba(64,168,196,0.12)":"#161b22",border:`1px solid ${viewDropOpen?"#40a8c4":"#30363d"}`,borderRadius:8,padding:"8px 12px",cursor:"pointer",display:"flex",alignItems:"center",gap:8,color:"#e8eaed",fontFamily:"'DM Sans',sans-serif",fontSize:13,fontWeight:600}}>
              <span style={{color:isProspect?"#40a8c4":"#8b949e"}}>{isProspect?"Prospect View":"Sales View"}</span>
              <span style={{color:"#40a8c4",fontSize:12,transform:viewDropOpen?"rotate(180deg)":"none",transition:"transform 0.2s"}}>&#9662;</span>
            </button>
            {viewDropOpen && (
              <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"#161b22",border:"1px solid #30363d",borderRadius:10,padding:8,zIndex:100,minWidth:200,boxShadow:"0 16px 40px rgba(0,0,0,0.5)"}}>
                <div className={`drop-item${!isProspect?" active":""}`} onClick={()=>{setViewMode("sales");setViewDropOpen(false);}}>
                  <span>Sales View</span>
                  {!isProspect&&<span style={{marginLeft:"auto",color:"#40a8c4",fontSize:12}}>&#10003;</span>}
                </div>
                <div className={`drop-item${isProspect?" active":""}`} onClick={()=>{setViewMode("prospect");setViewDropOpen(false);}}>
                  <span>Prospect View</span>
                  {isProspect&&<span style={{marginLeft:"auto",color:"#40a8c4",fontSize:12}}>&#10003;</span>}
                </div>
              </div>
            )}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span className="pulse"/><span style={{fontSize:12,color:"#8b949e"}}>Live calculation</span>
          </div>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:"0 auto",padding:"20px 16px"}}>

        {/* Dropdown */}
        <div style={{marginBottom:18,position:"relative"}}>
          <div style={{marginBottom:8,fontSize:11,color:"#8b949e",letterSpacing:"1px",textTransform:"uppercase"}}>Select Industry</div>
          <button onClick={()=>setDropOpen(o=>!o)} style={{width:"100%",background:"#161b22",border:`1px solid ${dropOpen?"#40a8c4":"#30363d"}`,borderRadius:10,padding:"13px 16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"space-between",color:"#e8eaed",fontFamily:"'DM Sans',sans-serif",fontSize:15,transition:"border-color 0.2s",boxShadow:dropOpen?"0 0 0 3px rgba(64,168,196,0.12)":"none"}}>
            <span style={{display:"flex",alignItems:"center",gap:10}}>
              <ind.Icon size={19} color="#40a8c4" strokeWidth={2} />
              <span style={{fontWeight:600}}>{ind.label}</span>
            </span>
            <span style={{color:"#40a8c4",fontSize:16,display:"inline-block",transform:dropOpen?"rotate(180deg)":"none",transition:"transform 0.2s"}}>&#9662;</span>
          </button>
          {dropOpen && (
            <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:"#161b22",border:"1px solid #30363d",borderRadius:10,padding:8,zIndex:100,boxShadow:"0 16px 40px rgba(0,0,0,0.5)"}}>
              {(Object.entries(INDUSTRIES) as [keyof typeof INDUSTRIES, typeof INDUSTRIES[keyof typeof INDUSTRIES]][]).map(([key,val])=>(
                <div key={key} className={`drop-item${industryKey===key?" active":""}`} onClick={()=>{setIndustryKey(key);setDropOpen(false);}}>
                  <val.Icon size={17} color={industryKey===key?"#40a8c4":"#8b949e"} strokeWidth={2} />
                  <span>{val.label}</span>
                  {industryKey===key&&<span style={{marginLeft:"auto",color:"#40a8c4",fontSize:12}}>&#10003;</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Insight */}
        <div style={{marginBottom:20,padding:"11px 16px",background:"rgba(64,168,196,0.05)",border:"1px solid rgba(64,168,196,0.14)",borderLeft:"3px solid #40a8c4",borderRadius:8,fontSize:13,color:"#8b949e",lineHeight:1.6,fontStyle:"italic"}}>
          <strong style={{color:"#40a8c4",fontStyle:"normal"}}>Industry insight: </strong>{ind.insight}
        </div>

        <div className="two-col">

          {/* LEFT */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div className="card">
              <div style={{marginBottom:12}}><span className="tag">Step 1</span></div>
              <label style={{fontSize:13,color:"#8b949e",display:"block",marginBottom:8}}>Monthly electricity spend</label>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:19,fontFamily:"'Playfair Display',serif",fontWeight:700,color:"#40a8c4",pointerEvents:"none"}}>R</span>
                <input style={{background:"#21262d",border:"1px solid #30363d",borderRadius:8,color:"#e8eaed",fontSize:19,fontFamily:"'Playfair Display',serif",fontWeight:700,padding:"11px 13px 11px 32px",width:"100%",outline:"none"}}
                  value={focused?inputVal:monthly.toLocaleString("en-ZA")}
                  onChange={e=>{setInputVal(e.target.value);const n=parseFloat(e.target.value.replace(/[^0-9.]/g,""));if(!isNaN(n)&&n>=0)setMonthly(n);}}
                  onFocus={()=>{setFocused(true);setInputVal(String(monthly));}}
                  onBlur={()=>setFocused(false)} placeholder="50,000"/>
              </div>
              <div style={{marginTop:7,fontSize:12,color:"#444d56"}}>Annual: {fmt(monthly*12)}</div>
            </div>

            <div className="card">
              <div style={{marginBottom:14}}><span className="tag">Step 2</span></div>
              <Slider label="Estimated inefficiency" value={inefficiency} min={ind.inefficiencyMin} max={ind.inefficiencyMax} onChange={setInefficiency} color="#ef5350" subleft={`${ind.inefficiencyMin}% — Low`} subright={`${ind.inefficiencyMax}% — High`}/>
              <div style={{marginTop:10,padding:"7px 11px",background:"rgba(239,83,80,0.07)",borderRadius:6,borderLeft:"3px solid #ef5350"}}>
                <span style={{fontSize:12,color:"#ef5350"}}>Monthly waste: {fmt(wastedMonthly)} · Annual: {fmt(wastedMonthly*12)}</span>
              </div>
            </div>

            <div className="card">
              <div style={{marginBottom:14}}><span className="tag">Step 3</span></div>
              <Slider label="Recoverable via SmartLux" value={recovery} min={ind.recoveryMin} max={ind.recoveryMax} onChange={setRecovery} color="#40a8c4" subleft={`${ind.recoveryMin}% — Partial`} subright={`${ind.recoveryMax}% — Fully optimised`}/>
            </div>

            <div className="card">
              <div style={{marginBottom:14}}><span className="tag">Step 4</span></div>
              <label style={{fontSize:13,color:"#8b949e",display:"block",marginBottom:8}}>Initial investment / Budget</label>
              <div style={{position:"relative"}}>
                <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:19,fontFamily:"'Playfair Display',serif",fontWeight:700,color:"#c9a84c",pointerEvents:"none"}}>R</span>
                <input style={{background:"#21262d",border:"1px solid #30363d",borderRadius:8,color:"#e8eaed",fontSize:19,fontFamily:"'Playfair Display',serif",fontWeight:700,padding:"11px 13px 11px 32px",width:"100%",outline:"none"}}
                  value={investmentFocused?investmentInput:investment.toLocaleString("en-ZA")}
                  onChange={e=>{setInvestmentInput(e.target.value);const n=parseFloat(e.target.value.replace(/[^0-9.]/g,""));if(!isNaN(n)&&n>=0)setInvestment(n);}}
                  onFocus={()=>{setInvestmentFocused(true);setInvestmentInput(String(investment));}}
                  onBlur={()=>setInvestmentFocused(false)} placeholder="150,000"/>
              </div>
              <Slider label="Adjust investment" value={investment} min={50000} max={1000000} step={10000} onChange={setInvestment} color="#c9a84c" subleft="R 50k" subright="R 1M" suffix=""/>
              <div style={{marginTop:6,fontSize:12,color:"#c9a84c",textAlign:"right"}}>Payback: {paybackLabel}</div>
            </div>
          </div>

          {/* RIGHT */}
          <div style={{display:"flex",flexDirection:"column",gap:14}}>
            <div className="card" style={{background:"linear-gradient(135deg,#1a1a0f,#1e1a08)",border:"1px solid #c9a84c",textAlign:"center",padding:"26px 18px"}}>
              <div style={{marginBottom:10}}><span className="tag" style={{background:"rgba(201,168,76,0.1)",color:"#c9a84c",borderColor:"rgba(201,168,76,0.25)"}}>Monthly recovery</span></div>
              <div className="gold-number" style={{fontFamily:"'Playfair Display',serif",fontSize:46,fontWeight:900,color:"#c9a84c",lineHeight:1}}>R {animRM.toLocaleString("en-ZA")}</div>
              <div style={{fontSize:13,color:"#8b949e",marginTop:8}}>being lost every month that could be recovered</div>
              <div className="divider"/>
              <div style={{fontSize:13,color:"#8b949e",marginBottom:4}}>Annual recovery</div>
              <div className="annual-number" style={{fontFamily:"'Playfair Display',serif",fontSize:28,fontWeight:700,color:"#c9a84c"}}>R {animRA.toLocaleString("en-ZA")}</div>
            </div>

            {!isProspect && (
              <div style={{background:"linear-gradient(135deg,#0f1f2a,#0a1520)",border:"1px solid rgba(64,168,196,0.22)",borderLeft:"4px solid #40a8c4",borderRadius:12,padding:"16px 18px"}}>
                <div style={{fontSize:10,color:"#40a8c4",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:10}}>Say this on the call</div>
                <p style={{fontSize:13,color:"#c8d0d8",lineHeight:1.75,fontStyle:"italic"}}>
                  &quot;Based on your current spend of <strong style={{color:"#fff",fontStyle:"normal"}}>{fmt(monthly)}</strong> per month, we&apos;re typically looking at around <strong style={{color:"#fff",fontStyle:"normal"}}>{fmt(recoverableMonthly)} per month</strong> — that&apos;s <strong style={{color:"#fff",fontStyle:"normal"}}>{fmt(recoverableAnnual)} per year</strong> — that&apos;s potentially being lost and could be recovered.&quot;
                </p>
                <div style={{marginTop:9,fontSize:11,color:"#555e6b",fontStyle:"italic"}}>Pause. Let that number land.</div>
              </div>
            )}

            <div className="three-col">
              {[
                {label:"Inefficiency", val:`R ${animW.toLocaleString("en-ZA")}/mo`, color:"#ef5350"},
                {label:"Recoverable",  val:`R ${animRM.toLocaleString("en-ZA")}/mo`, color:"#40a8c4"},
                {label:"Annual ROI",   val:`${animRoi}%`, color:"#c9a84c"},
              ].map((c,i)=>(
                <div key={i} className="card" style={{textAlign:"center",padding:"13px 8px"}}>
                  <div style={{fontSize:10,color:"#8b949e",letterSpacing:"1px",textTransform:"uppercase",marginBottom:7}}>{c.label}</div>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:c.color}}>{c.val}</div>
                </div>
              ))}
            </div>

            <div className="card">
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{fontSize:13,color:"#8b949e"}}>Implied investment</span>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:"#fff"}}>R {animI.toLocaleString("en-ZA")}</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:"#8b949e"}}>Payback period</span>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:19,fontWeight:700,color:"#c9a84c"}}>{paybackLabel}</span>
              </div>
              {!isProspect && <>
                <div className="divider"/>
                <div style={{padding:"9px 12px",background:"rgba(64,168,196,0.05)",borderRadius:8,fontSize:12,color:"#8b949e",lineHeight:1.6}}>
                  <strong style={{color:"#40a8c4"}}>Script note: </strong>&quot;That&apos;s typically why most setups fall into a {paybackRange} year payback range — depending on how integrated the system is and how aggressively you optimise.&quot;
                </div>
              </>}
            </div>

            <button className="reset-btn" onClick={()=>{setInefficiency(ind.inefficiencyDefault);setRecovery(ind.recoveryDefault);setPayback(ind.paybackDefault);setMonthly(50000);setInputVal("50,000");setInvestment(150000);setInvestmentInput("150,000");}}>
              Reset to {ind.label} defaults
            </button>
          </div>
        </div>

        <div style={{marginTop:32,textAlign:"center",fontSize:11,color:"#444d56",lineHeight:1.8}}>
          SmartLux Automation · Powered by Loxone · sales@smartlux.co.za<br/>
          Figures are projections based on industry benchmarks. Actual results vary by facility.
        </div>
      </div>
    </div>
  );
}
