import { useState, useEffect, useRef } from "react";

// ── Brand ──
const C = {
  navy: "#0F2444", navyMid: "#1F3864", blue: "#2E5FA3", blueLt: "#4A80C4",
  sky: "#D6E4F0", pale: "#EBF3FA", cream: "#F8F9FB", gold: "#D4A847",
  red: "#C8504A", ink: "#1A2332", muted: "#5A6878", border: "#CBD8E8",
  white: "#FFFFFF", green: "#22c55e", greenBg: "#22c55e18",
};

// ── Templates ──
const TEMPLATES = [
  { id: "beef-uk", name: "Brazilian Beef → UK", icon: "🥩", corridor: "Brazil → United Kingdom", product: "Frozen Beef Cuts", regime: "IPAFFS / BTOM", docs: ["Health Certificate (EHC)", "Phytosanitary Certificate", "CHED-P (IPAFFS)", "Commercial Invoice", "Bill of Lading", "Packing List", "Certificate of Origin", "Cold Chain Compliance Record"], avgValue: "€52,000", persona: "importer" },
  { id: "coffee-nl", name: "Colombian Coffee → NL", icon: "☕", corridor: "Colombia → Netherlands", product: "Arabica Green Coffee (FCL)", regime: "TRACES NT / EUDR", docs: ["TRACES NT Health Certificate", "Phytosanitary Certificate", "EUDR Due Diligence Statement", "ICO Certificate of Origin", "Commercial Invoice", "Bill of Lading", "Weight Certificate", "Quality Grading Certificate"], avgValue: "€340,000", persona: "forwarder" },
  { id: "spices-us", name: "Indian Spices → USA", icon: "🌶️", corridor: "India → United States", product: "Turmeric, Cumin, Chili Powder", regime: "FDA FSMA / OASIS", docs: ["FDA Prior Notice", "FSVP Import Documentation", "Phytosanitary Certificate", "Certificate of Analysis (Aflatoxin)", "Commercial Invoice", "Bill of Lading", "Fumigation Certificate", "Lot Traceability Record (FSMA 204)"], avgValue: "€85,000", persona: "importer" },
];

const STEPS = [
  { n: 1, title: "Fix the Core Model", sub: "Canonical schema — no custom ontology", icon: "📐" },
  { n: 2, title: "Select Template", sub: "Choose your deployment template", icon: "📋" },
  { n: 3, title: "AI Copilot Mapping", sub: "AI maps your workflows to VeriPura", icon: "🤖" },
  { n: 4, title: "Example-Based Setup", sub: "Upload samples, not specifications", icon: "📦" },
  { n: 5, title: "Configure Overrides", sub: "Narrow, controlled customisation", icon: "⚙️" },
  { n: 6, title: "Go-Live Mode", sub: "Progressive deployment", icon: "🚀" },
  { n: 7, title: "Sandbox Validation", sub: "Test on historical shipments", icon: "🧪" },
  { n: 8, title: "Clone & Scale", sub: "Copy what works across locations", icon: "📑" },
];

// ── Sample mappings for AI copilot demo ──
const SAMPLE_MAPPINGS = [
  { clientField: "Consignment Health Cert No.", veriField: "health_certificate.reference_number", confidence: 98, status: "auto" },
  { clientField: "Exporter Name", veriField: "parties.exporter.legal_name", confidence: 96, status: "auto" },
  { clientField: "Port of Loading", veriField: "corridor.origin_port", confidence: 94, status: "auto" },
  { clientField: "Destination Port", veriField: "corridor.destination_port", confidence: 97, status: "auto" },
  { clientField: "Container Temp (°C)", veriField: "cold_chain.set_temperature_celsius", confidence: 91, status: "auto" },
  { clientField: "AQHA Stamp Ref", veriField: "health_certificate.authority_stamp_id", confidence: 78, status: "review" },
  { clientField: "Broker Notes", veriField: "— unmapped —", confidence: 0, status: "skip" },
  { clientField: "HS Code", veriField: "product.harmonized_code", confidence: 99, status: "auto" },
  { clientField: "Weight (KG Net)", veriField: "shipment.net_weight_kg", confidence: 95, status: "auto" },
  { clientField: "Vet Inspector Name", veriField: "health_certificate.inspector_name", confidence: 88, status: "auto" },
];

const COPILOT_CHAT = [
  { role: "copilot", text: "I've detected 47 fields in your uploaded spreadsheet. Let me map them to VeriPura's canonical schema." },
  { role: "copilot", text: "I found 38 automatic matches (confidence > 85%). 6 need your review. 3 fields don't map to our schema — they may be internal-only." },
  { role: "user", text: "The 'AQHA Stamp Ref' field — that's the veterinary authority stamp on the health certificate." },
  { role: "copilot", text: "Got it. I've mapped it to health_certificate.authority_stamp_id. Confidence updated to 95%. Shall I apply this across all Brazilian beef corridors?" },
  { role: "user", text: "Yes, apply to all Brazil corridors." },
  { role: "copilot", text: "Done. 39 auto-mapped, 5 for review, 3 skipped. Your mapping is 89% complete. Ready to move to sandbox validation?" },
];

// ── Shared Components ──

function ProgressBar({ step, total }) {
  return (
    <div style={{ display: "flex", gap: 2, marginBottom: 24 }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= step ? C.gold : C.navyMid, transition: "background 0.3s" }} />
      ))}
    </div>
  );
}

function Badge({ text, color = C.gold, bg }) {
  return <span style={{ fontSize: 10, letterSpacing: 1.5, padding: "3px 10px", borderRadius: 3, fontWeight: 700, background: bg || `${color}20`, color }}>{text}</span>;
}

function Card({ children, onClick, active, style = {} }) {
  return (
    <div onClick={onClick} style={{ background: active ? `${C.gold}15` : C.navyMid, border: `1px solid ${active ? C.gold : C.blue}22`, borderRadius: 8, padding: 20, cursor: onClick ? "pointer" : "default", transition: "all 0.2s", ...style }}
      onMouseEnter={e => { if (onClick) e.currentTarget.style.borderColor = C.gold + "60"; }}
      onMouseLeave={e => { if (onClick) e.currentTarget.style.borderColor = active ? C.gold : C.blue + "22"; }}>
      {children}
    </div>
  );
}

// ── Step Content Components ──

function Step1() {
  const schema = [
    { entity: "Shipment", fields: "shipment_id, origin, destination, product_code, hs_code, value, weight, status" },
    { entity: "Document", fields: "doc_type, reference, issue_date, expiry, issuing_authority, confidence_score" },
    { entity: "Party", fields: "role (exporter|importer|broker|inspector), legal_name, registration, country" },
    { entity: "Corridor", fields: "origin_country, destination_country, origin_port, destination_port, regime" },
    { entity: "Exception", fields: "exception_type, severity, document_ref, description, resolution_status" },
  ];
  return (
    <div>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>VeriPura uses one canonical schema for all deployments. Your data maps into our model — you never build a custom ontology.</p>
      <div style={{ background: C.navy, borderRadius: 8, padding: 20, fontFamily: "'DM Mono', monospace" }}>
        <div style={{ fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 12 }}>VERIPURA CANONICAL SCHEMA</div>
        {schema.map((s, i) => (
          <div key={i} style={{ padding: "8px 0", borderBottom: i < schema.length - 1 ? `1px solid ${C.navyMid}` : "none" }}>
            <span style={{ color: C.gold, fontSize: 13, fontWeight: 600 }}>{s.entity}</span>
            <span style={{ color: C.muted, fontSize: 12 }}> → {s.fields}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: 14, background: `${C.gold}10`, borderRadius: 6, border: `1px solid ${C.gold}30` }}>
        <span style={{ fontSize: 12, color: C.gold, fontWeight: 600 }}>Key principle: </span>
        <span style={{ fontSize: 12, color: C.white }}>Configure by mapping, not by implementation.</span>
      </div>
    </div>
  );
}

function Step2({ selected, setSelected }) {
  return (
    <div>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>Select a deployment template. Each template pre-configures document checklists, corridor rules, and regulatory requirements.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {TEMPLATES.map(t => (
          <Card key={t.id} onClick={() => setSelected(t)} active={selected?.id === t.id}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{t.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.white, marginBottom: 4 }}>{t.name}</div>
            <div style={{ fontSize: 11, color: C.muted, marginBottom: 8 }}>{t.corridor}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{t.regime}</div>
            <div style={{ fontSize: 11, color: C.gold, marginTop: 8 }}>Avg. shipment: {t.avgValue}</div>
            <div style={{ marginTop: 8 }}><Badge text={`${t.docs.length} DOCUMENTS`} /></div>
          </Card>
        ))}
      </div>
      {selected && (
        <div style={{ marginTop: 16, background: C.navy, borderRadius: 8, padding: 16 }}>
          <div style={{ fontSize: 10, color: C.gold, letterSpacing: 2, marginBottom: 8 }}>REQUIRED DOCUMENT CHECKLIST — {selected.name.toUpperCase()}</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {selected.docs.map((d, i) => (
              <div key={i} style={{ fontSize: 12, color: C.white, padding: "4px 0" }}>
                <span style={{ color: C.green, marginRight: 6 }}>✓</span>{d}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Step3({ template }) {
  const [tab, setTab] = useState("animated");
  const [animStep, setAnimStep] = useState(0);
  const [chatVisible, setChatVisible] = useState(0);

  useEffect(() => {
    if (tab === "animated") {
      const iv = setInterval(() => setAnimStep(s => s < SAMPLE_MAPPINGS.length - 1 ? s + 1 : s), 800);
      return () => clearInterval(iv);
    }
  }, [tab]);

  useEffect(() => {
    if (tab === "chat") {
      const iv = setInterval(() => setChatVisible(s => s < COPILOT_CHAT.length - 1 ? s + 1 : s), 1500);
      return () => clearInterval(iv);
    }
  }, [tab]);

  const tabs = [
    { id: "animated", label: "Field Mapping" },
    { id: "sidebyside", label: "Side-by-Side" },
    { id: "chat", label: "Copilot Chat" },
  ];

  return (
    <div>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 16, lineHeight: 1.6 }}>The AI Copilot reads your documents, spreadsheets, and SOPs, then maps every field to VeriPura's canonical schema. You approve — the AI proposes.</p>
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setAnimStep(0); setChatVisible(0); }}
            style={{ background: tab === t.id ? C.gold : C.navyMid, color: tab === t.id ? C.navy : C.muted, border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "animated" && (
        <div style={{ background: C.navy, borderRadius: 8, padding: 16, fontFamily: "'DM Mono', monospace" }}>
          <div style={{ display: "grid", gridTemplateColumns: "200px 24px 280px 60px 70px", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.navyMid}`, fontSize: 10, color: C.muted, letterSpacing: 1 }}>
            <div>YOUR FIELD</div><div></div><div>VERIPURA SCHEMA</div><div>CONF.</div><div>STATUS</div>
          </div>
          {SAMPLE_MAPPINGS.map((m, i) => {
            const visible = i <= animStep;
            return (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "200px 24px 280px 60px 70px", gap: 8, padding: "8px 0", borderBottom: `1px solid ${C.navyMid}44`, opacity: visible ? 1 : 0.15, transition: "opacity 0.4s", alignItems: "center" }}>
                <div style={{ fontSize: 12, color: C.white }}>{m.clientField}</div>
                <div style={{ fontSize: 14, color: m.status === "skip" ? C.red : C.gold, textAlign: "center" }}>{m.status === "skip" ? "✗" : "→"}</div>
                <div style={{ fontSize: 12, color: m.status === "skip" ? C.muted : C.blueLt }}>{m.veriField}</div>
                <div style={{ fontSize: 12, color: m.confidence >= 90 ? C.green : m.confidence >= 75 ? C.gold : C.muted, fontWeight: 700 }}>{m.confidence > 0 ? `${m.confidence}%` : "—"}</div>
                <div><Badge text={m.status.toUpperCase()} color={m.status === "auto" ? C.green : m.status === "review" ? C.gold : C.muted} /></div>
              </div>
            );
          })}
          <div style={{ marginTop: 12, fontSize: 12, color: C.gold }}>
            {animStep >= SAMPLE_MAPPINGS.length - 1 ? "✓ Mapping complete — 8 auto, 1 review, 1 skipped" : `Mapping field ${animStep + 1} of ${SAMPLE_MAPPINGS.length}...`}
          </div>
        </div>
      )}

      {tab === "sidebyside" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", gap: 0 }}>
          <div style={{ background: C.navy, borderRadius: "8px 0 0 8px", padding: 16 }}>
            <div style={{ fontSize: 10, color: C.red, letterSpacing: 2, marginBottom: 10 }}>CLIENT SPREADSHEET</div>
            {["Consignment Health Cert No.", "Exporter Name", "Port of Loading", "Destination Port", "Container Temp (°C)", "AQHA Stamp Ref", "Broker Notes", "HS Code", "Weight (KG Net)", "Vet Inspector Name"].map((f, i) => (
              <div key={i} style={{ fontSize: 12, color: C.white, padding: "6px 8px", background: i % 2 === 0 ? C.navyMid : "transparent", borderRadius: 3 }}>{f}</div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 4 }}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{ fontSize: 10, color: SAMPLE_MAPPINGS[i]?.status === "skip" ? C.red : C.gold }}>
                {SAMPLE_MAPPINGS[i]?.status === "skip" ? "✗" : "→"}
              </div>
            ))}
          </div>
          <div style={{ background: C.navyMid, borderRadius: "0 8px 8px 0", padding: 16 }}>
            <div style={{ fontSize: 10, color: C.green, letterSpacing: 2, marginBottom: 10 }}>VERIPURA SCHEMA</div>
            {SAMPLE_MAPPINGS.map((m, i) => (
              <div key={i} style={{ fontSize: 12, color: m.status === "skip" ? C.muted : C.blueLt, padding: "6px 8px", background: i % 2 === 0 ? C.navy : "transparent", borderRadius: 3, textDecoration: m.status === "skip" ? "line-through" : "none" }}>{m.veriField}</div>
            ))}
          </div>
        </div>
      )}

      {tab === "chat" && (
        <div style={{ background: C.navy, borderRadius: 8, padding: 20, maxHeight: 380, overflowY: "auto" }}>
          {COPILOT_CHAT.map((msg, i) => {
            if (i > chatVisible) return null;
            const isCopilot = msg.role === "copilot";
            return (
              <div key={i} style={{ display: "flex", justifyContent: isCopilot ? "flex-start" : "flex-end", marginBottom: 12, opacity: 0, animation: "fadeIn 0.4s ease forwards" }}>
                <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: isCopilot ? "12px 12px 12px 2px" : "12px 12px 2px 12px", background: isCopilot ? C.navyMid : `${C.gold}25`, border: `1px solid ${isCopilot ? C.blue + "33" : C.gold + "40"}` }}>
                  <div style={{ fontSize: 9, color: isCopilot ? C.gold : C.muted, letterSpacing: 1.5, marginBottom: 4 }}>{isCopilot ? "AI COPILOT" : "YOU"}</div>
                  <div style={{ fontSize: 13, color: C.white, lineHeight: 1.5 }}>{msg.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Step4({ template }) {
  const samples = [
    { type: "Sample Shipment Packet", desc: "3 recent shipments with full documentation", status: "uploaded", icon: "📄" },
    { type: "Branch / Location List", desc: "Offices, warehouses, port agents", status: "uploaded", icon: "🏢" },
    { type: "User Export (CSV)", desc: "Staff names, roles, access levels", status: "pending", icon: "👥" },
    { type: "Current Workflow / SOP", desc: "How you process compliance today", status: "uploaded", icon: "📝" },
  ];
  return (
    <div>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>We ask for examples, not specifications. Upload sample shipments and current workflows — the AI Copilot does the rest.</p>
      <div style={{ display: "grid", gap: 10 }}>
        {samples.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.navyMid, borderRadius: 8, border: `1px solid ${C.blue}22` }}>
            <div style={{ fontSize: 24 }}>{s.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, color: C.white, fontWeight: 600 }}>{s.type}</div>
              <div style={{ fontSize: 11, color: C.muted }}>{s.desc}</div>
            </div>
            <Badge text={s.status === "uploaded" ? "UPLOADED" : "PENDING"} color={s.status === "uploaded" ? C.green : C.gold} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Step5() {
  const overrides = [
    { level: "Global", scope: "All corridors", examples: "Confidence threshold (75%), default document language, timezone", locked: true },
    { level: "Regional", scope: "EU / UK / US", examples: "Regulatory regime selection, authority database preference", locked: true },
    { level: "Branch", scope: "Per office/location", examples: "Local port defaults, branch-specific approval routing", locked: false },
    { level: "Customer", scope: "Per importer client", examples: "Client-specific document requirements, custom exception rules", locked: false },
  ];
  return (
    <div>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>Overrides are narrow and controlled. Four levels, each with limited scope. No custom ontologies, no field-level schema changes.</p>
      {overrides.map((o, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.navyMid, borderRadius: 8, marginBottom: 8, border: `1px solid ${C.blue}22` }}>
          <div style={{ width: 42, height: 42, borderRadius: 6, background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: C.gold }}>{o.level.slice(0, 3).toUpperCase()}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: C.white, fontWeight: 600 }}>{o.level} <span style={{ fontSize: 11, color: C.muted, fontWeight: 400 }}>({o.scope})</span></div>
            <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{o.examples}</div>
          </div>
          <Badge text={o.locked ? "ADMIN ONLY" : "CONFIGURABLE"} color={o.locked ? C.red : C.green} />
        </div>
      ))}
    </div>
  );
}

function Step6() {
  const [mode, setMode] = useState(0);
  const modes = [
    { name: "Manual Mode", icon: "📋", desc: "VeriPura analyses documents. Results displayed in the dashboard. Your team reviews and acts on findings manually. No system integration required.", tag: "START HERE", tagColor: C.green },
    { name: "Connected Mode", icon: "🔗", desc: "VeriPura connects to your document management system or email inbox via API. Documents are ingested automatically. Attestations feed back to your existing workflow.", tag: "PHASE 2", tagColor: C.gold },
    { name: "Embedded Mode", icon: "⚡", desc: "VeriPura is embedded in your ERP, TMS, or forwarding platform. Verification happens inline with your existing process. No separate login, no context switching.", tag: "PHASE 3", tagColor: C.blueLt },
  ];
  return (
    <div>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>Go live progressively. Value appears before full integration. Each mode builds on the previous one.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {modes.map((m, i) => (
          <Card key={i} onClick={() => setMode(i)} active={mode === i}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
            <Badge text={m.tag} color={m.tagColor} />
            <div style={{ fontSize: 16, fontWeight: 700, color: C.white, marginTop: 8, marginBottom: 6 }}>{m.name}</div>
            <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{m.desc}</div>
          </Card>
        ))}
      </div>
      <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 8 }}>
        {modes.map((m, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: i <= mode ? C.gold : C.navyMid, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: i <= mode ? C.navy : C.muted }}>{i + 1}</div>
            {i < modes.length - 1 && <div style={{ width: 60, height: 2, background: i < mode ? C.gold : C.navyMid }} />}
          </div>
        ))}
        <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>Progressive deployment — no big-bang go-live</span>
      </div>
    </div>
  );
}

function Step7({ template }) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  const runSandbox = () => {
    setRunning(true); setProgress(0); setResults(null);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 15 + 5;
      if (p >= 100) { p = 100; clearInterval(iv); setRunning(false);
        setResults({ total: 50, passed: 43, flagged: 5, failed: 2, accuracy: 94.2, missingMappings: 3 });
      }
      setProgress(Math.min(p, 100));
    }, 300);
  };

  return (
    <div>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>Run VeriPura on historical shipments before going live. Compare results to your current process. Flag missing mappings.</p>
      {!results ? (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <button onClick={runSandbox} disabled={running}
            style={{ background: running ? C.navyMid : C.gold, color: running ? C.muted : C.navy, border: "none", borderRadius: 6, padding: "14px 32px", fontSize: 15, fontWeight: 700, cursor: running ? "default" : "pointer" }}>
            {running ? `Processing... ${Math.round(progress)}%` : "Run Sandbox on 50 Historical Shipments"}
          </button>
          {running && (
            <div style={{ marginTop: 16, width: "60%", marginInline: "auto", height: 6, background: C.navyMid, borderRadius: 3 }}>
              <div style={{ height: "100%", width: `${progress}%`, background: C.gold, borderRadius: 3, transition: "width 0.3s" }} />
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { label: "Shipments Analysed", val: results.total, color: C.white },
            { label: "Passed (High Confidence)", val: results.passed, color: C.green },
            { label: "Flagged (Moderate)", val: results.flagged, color: C.gold },
            { label: "Failed (Low Confidence)", val: results.failed, color: C.red },
            { label: "Verification Accuracy", val: `${results.accuracy}%`, color: C.green },
            { label: "Missing Mappings Found", val: results.missingMappings, color: C.gold },
          ].map((r, i) => (
            <div key={i} style={{ background: C.navyMid, borderRadius: 8, padding: "16px 14px", textAlign: "center" }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: r.color, fontFamily: "Georgia, serif" }}>{r.val}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>{r.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Step8({ template }) {
  const locations = [
    { name: "Rotterdam HQ", status: "live", shipments: 847 },
    { name: "Felixstowe Branch", status: "cloned", shipments: 0 },
    { name: "Hamburg Office", status: "cloned", shipments: 0 },
    { name: "Antwerp Branch", status: "pending", shipments: 0 },
  ];
  return (
    <div>
      <p style={{ color: C.muted, fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>Once one corridor or branch works, clone the approved configuration across locations with minimal edits.</p>
      {locations.map((l, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.navyMid, borderRadius: 8, marginBottom: 8, border: `1px solid ${C.blue}22` }}>
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: l.status === "live" ? C.green : l.status === "cloned" ? C.gold : C.muted }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: C.white, fontWeight: 600 }}>{l.name}</div>
            <div style={{ fontSize: 11, color: C.muted }}>{l.status === "live" ? `${l.shipments} shipments verified` : l.status === "cloned" ? "Configuration cloned — ready to activate" : "Awaiting configuration"}</div>
          </div>
          <Badge text={l.status.toUpperCase()} color={l.status === "live" ? C.green : l.status === "cloned" ? C.gold : C.muted} />
          {l.status === "live" && <button style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 4, padding: "6px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Clone →</button>}
        </div>
      ))}
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [persona, setPersona] = useState("importer");
  const [step, setStep] = useState(0);
  const [template, setTemplate] = useState(null);

  const renderStep = () => {
    switch (step) {
      case 0: return <Step1 />;
      case 1: return <Step2 selected={template} setSelected={setTemplate} />;
      case 2: return <Step3 template={template} />;
      case 3: return <Step4 template={template} />;
      case 4: return <Step5 />;
      case 5: return <Step6 />;
      case 6: return <Step7 template={template} />;
      case 7: return <Step8 template={template} />;
      default: return null;
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: C.ink, fontFamily: "'DM Sans', sans-serif", color: C.white }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.ink}; }
        ::-webkit-scrollbar-thumb { background: ${C.navyMid}; border-radius: 3px; }
      `}</style>

      {/* Nav */}
      <nav style={{ background: C.navy, borderBottom: `2px solid ${C.gold}`, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: C.white, padding: "14px 0" }}>
            Veri<span style={{ color: C.gold }}>Pura</span>
            <span style={{ fontSize: 13, color: C.muted, fontFamily: "'DM Sans'", fontWeight: 400, marginLeft: 10 }}>Deployment Copilot</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 4 }}>
          {["importer", "forwarder"].map(p => (
            <button key={p} onClick={() => setPersona(p)}
              style={{ background: persona === p ? C.gold : "transparent", color: persona === p ? C.navy : C.muted, border: "none", borderRadius: 4, padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: 1 }}>
              {p} view
            </button>
          ))}
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        <ProgressBar step={step} total={8} />

        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24 }}>
          {/* Sidebar steps */}
          <div>
            {STEPS.map((s, i) => (
              <div key={i} onClick={() => setStep(i)}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 6, cursor: "pointer", marginBottom: 4,
                  background: step === i ? `${C.gold}15` : "transparent",
                  borderLeft: step === i ? `3px solid ${C.gold}` : "3px solid transparent" }}
                onMouseEnter={e => { if (step !== i) e.currentTarget.style.background = C.navyMid; }}
                onMouseLeave={e => { if (step !== i) e.currentTarget.style.background = "transparent"; }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: step === i ? 700 : 500, color: step === i ? C.white : C.muted }}>{s.title}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{s.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Main content */}
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: C.gold, letterSpacing: 3, fontWeight: 600, marginBottom: 4 }}>STEP {step + 1} OF 8</div>
              <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, color: C.white, margin: 0 }}>{STEPS[step].title}</h2>
              {persona === "forwarder" && step === 0 && (
                <div style={{ marginTop: 8, padding: "8px 12px", background: `${C.blue}20`, borderRadius: 4, fontSize: 12, color: C.sky }}>
                  Forwarder view: you'll configure this once and deploy across all your importer clients.
                </div>
              )}
            </div>

            <div style={{ background: C.navyMid, borderRadius: 10, padding: 24, border: `1px solid ${C.blue}18`, minHeight: 340 }}>
              {renderStep()}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0}
                style={{ background: "transparent", border: `1px solid ${step === 0 ? C.navyMid : C.border}`, color: step === 0 ? C.muted : C.white, borderRadius: 6, padding: "10px 24px", fontSize: 13, cursor: step === 0 ? "default" : "pointer" }}>
                ← Previous
              </button>
              <button onClick={() => setStep(Math.min(7, step + 1))} disabled={step === 7}
                style={{ background: step === 7 ? C.navyMid : C.gold, color: step === 7 ? C.muted : C.navy, border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: step === 7 ? "default" : "pointer" }}>
                {step === 7 ? "Deployment Complete ✓" : "Next Step →"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
