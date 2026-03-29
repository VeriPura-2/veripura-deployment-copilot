import { useState, useEffect } from "react";

// ── Brand + Text Tokens ──
const C = {
  navy: "#0F2444", navyMid: "#1F3864", blue: "#2E5FA3", blueLt: "#4A80C4",
  sky: "#D6E4F0", pale: "#EBF3FA", cream: "#F8F9FB", gold: "#D4A847",
  red: "#C8504A", ink: "#1A2332", muted: "#5A6878", border: "#CBD8E8",
  white: "#FFFFFF", green: "#22c55e",
};
const T = { primary: "#FFFFFF", secondary: "#D6E4F0", tertiary: "#9AAFCA", accent: "#D4A847" };

// ── PO Pipeline Data ──
const PO_STAGES = ["PO Raised","Documents Submitted","Verifying","Verified","Cleared","Shipped","Attested"];

const PO_DATA = [
  { id:"PO-2025-0441", supplier:"Fazenda Boa Vista", origin:"Brazil",dest:"Netherlands",product:"Frozen Beef",qty:"24 MT",value:"€142,800",corridor:"Brazil → NL (Beef)",stage:6,bol:"BL-RTM-441",health:"HC-BR-0441",invoice:"INV-CBV-0441",coo:"COO-BR-0441",phyto:"PHY-BR-0441",pack:"PL-0441",docs:["bol","health","invoice","coo","phyto","pack"],client:"Carrefour Nederland BV",eta:"2025-04-12",score:94 },
  { id:"PO-2025-0442", supplier:"Agro Sul Exportações", origin:"Brazil",dest:"Netherlands",product:"Poultry Cuts",qty:"18 MT",value:"€89,400",corridor:"Brazil → NL (Poultry)",stage:4,bol:"BL-RTM-442",health:"HC-BR-0442",invoice:"INV-ASE-0442",coo:"COO-BR-0442",phyto:null,pack:"PL-0442",docs:["bol","health","invoice","coo","pack"],client:"Ahold Delhaize",eta:"2025-04-18",score:91 },
  { id:"PO-2025-0443", supplier:"Café Colombia Premium", origin:"Colombia",dest:"Netherlands",product:"Green Coffee Beans",qty:"60 MT",value:"€198,000",corridor:"Colombia → NL (Coffee)",stage:3,bol:"BL-RTM-443",health:null,invoice:"INV-CCP-0443",coo:"COO-CO-0443",phyto:"PHY-CO-0443",pack:"PL-0443",docs:["bol","invoice","coo","phyto","pack"],client:"Carrefour Nederland BV",eta:"2025-04-22",score:88 },
  { id:"PO-2025-0444", supplier:"Spice Garden India", origin:"India",dest:"Netherlands",product:"Mixed Spices",qty:"12 MT",value:"€67,200",corridor:"India → NL (Spices)",stage:2,bol:null,health:"HC-IN-0444",invoice:"INV-SGI-0444",coo:"COO-IN-0444",phyto:"PHY-IN-0444",pack:"PL-0444",docs:["health","invoice","coo","phyto","pack"],client:"Verstegen Spices",eta:"2025-05-02",score:null },
  { id:"PO-2025-0445", supplier:"Thai Sea Products", origin:"Thailand",dest:"Netherlands",product:"Frozen Shrimp",qty:"30 MT",value:"€225,000",corridor:"Thailand → NL (Seafood)",stage:5,bol:"BL-RTM-445",health:"HC-TH-0445",invoice:"INV-TSP-0445",coo:"COO-TH-0445",phyto:null,pack:"PL-0445",docs:["bol","health","invoice","coo","pack"],client:"Ahold Delhaize",eta:"2025-04-28",score:91 },
  { id:"PO-2025-0446", supplier:"Vietnam Pepper Co.", origin:"Vietnam",dest:"Netherlands",product:"Black Pepper",qty:"8 MT",value:"€44,800",corridor:"Vietnam → NL (Pepper)",stage:1,bol:null,health:null,invoice:"INV-VPC-0446",coo:null,phyto:null,pack:null,docs:["invoice"],client:"Verstegen Spices",eta:"2025-05-15",score:null },
  { id:"PO-2025-0447", supplier:"Pampa Beef Exporters", origin:"Argentina",dest:"Netherlands",product:"Chilled Beef",qty:"20 MT",value:"€118,000",corridor:"Argentina → NL (Beef)",stage:0,bol:null,health:null,invoice:null,coo:null,phyto:null,pack:null,docs:[],client:"Van der Berg Import",eta:"2025-05-20",score:null },
  { id:"PO-2025-0448", supplier:"Rio Grande Broilers", origin:"Brazil",dest:"United Kingdom",product:"Chicken Portions",qty:"15 MT",value:"€72,750",corridor:"Brazil → UK (Beef)",stage:4,bol:"BL-FXT-448",health:"HC-BR-0448",invoice:"INV-RGB-0448",coo:"COO-BR-0448",phyto:null,pack:"PL-0448",docs:["bol","health","invoice","coo","pack"],client:"Tesco PLC",eta:"2025-04-25",score:92 },
  { id:"PO-2025-0449", supplier:"Kenya Fresh Exports", origin:"Kenya",dest:"United Kingdom",product:"Green Beans",qty:"5 MT",value:"€18,500",corridor:"Kenya → UK (Vegetables)",stage:3,bol:"BL-FXT-449",health:"HC-KE-0449",invoice:"INV-KFE-0449",coo:"COO-KE-0449",phyto:"PHY-KE-0449",pack:"PL-0449",docs:["bol","health","invoice","coo","phyto","pack"],client:"Tesco PLC",eta:"2025-05-05",score:92 },
  { id:"PO-2025-0450", supplier:"Sudeste Aves", origin:"Brazil",dest:"United Kingdom",product:"Frozen Poultry",qty:"22 MT",value:"€104,500",corridor:"Brazil → UK (Poultry)",stage:2,bol:null,health:"HC-BR-0450",invoice:"INV-SA-0450",coo:"COO-BR-0450",phyto:null,pack:"PL-0450",docs:["health","invoice","coo","pack"],client:"Morrisons Import",eta:"2025-05-08",score:87 },
  { id:"PO-2025-0451", supplier:"Finca El Paraíso", origin:"Colombia",dest:"Germany",product:"Specialty Coffee",qty:"45 MT",value:"€148,500",corridor:"Colombia → DE (Coffee)",stage:6,bol:"BL-HAM-451",health:null,invoice:"INV-FEP-0451",coo:"COO-CO-0451",phyto:"PHY-CO-0451",pack:"PL-0451",docs:["bol","invoice","coo","phyto","pack"],client:"Tchibo GmbH",eta:"2025-04-10",score:95 },
  { id:"PO-2025-0452", supplier:"Serra do Mar Coffee", origin:"Brazil",dest:"Germany",product:"Roasted Coffee",qty:"38 MT",value:"€125,400",corridor:"Brazil → DE (Coffee)",stage:5,bol:"BL-HAM-452",health:null,invoice:"INV-SMC-0452",coo:"COO-BR-0452",phyto:"PHY-BR-0452",pack:"PL-0452",docs:["bol","invoice","coo","phyto","pack"],client:"Tchibo GmbH",eta:"2025-04-30",score:95 },
];

// ── VERI Token Data ──
const VERI_EVENTS = [
  { date:"2025-04-12", event:"Attestation Issued", po:"PO-2025-0451", tokens:12, type:"earn", hash:"0xA3F2...9B1C" },
  { date:"2025-04-10", event:"Cross-Doc Check Pass", po:"PO-2025-0441", tokens:3, type:"earn", hash:"0xB7E1...4D2A" },
  { date:"2025-04-08", event:"Document Re-submission", po:"PO-2025-0443", tokens:-2, type:"spend", hash:"0xC9D4...7F3E" },
  { date:"2025-04-05", event:"Attestation Issued", po:"PO-2025-0448", tokens:12, type:"earn", hash:"0xD2A8...1C5B" },
  { date:"2025-04-02", event:"Compliance Flag Raised", po:"PO-2025-0446", tokens:-5, type:"spend", hash:"0xE5F3...8A2D" },
  { date:"2025-03-28", event:"Attestation Issued", po:"PO-2025-0452", tokens:12, type:"earn", hash:"0xF1B6...3E9C" },
  { date:"2025-03-25", event:"Fast-Track Verification", po:"PO-2025-0445", tokens:8, type:"earn", hash:"0xA8C2...6D4F" },
  { date:"2025-03-20", event:"Attestation Issued", po:"PO-2025-0442", tokens:12, type:"earn", hash:"0xB3E7...9A1B" },
];

const VERI_CHART = [
  { month:"Oct", earned:24, spent:4 }, { month:"Nov", earned:36, spent:8 },
  { month:"Dec", earned:28, spent:6 }, { month:"Jan", earned:44, spent:10 },
  { month:"Feb", earned:52, spent:12 }, { month:"Mar", earned:60, spent:9 },
  { month:"Apr", earned:47, spent:7 },
];

const ATTESTATIONS = [
  { id:"ATT-2025-0112", po:"PO-2025-0451", client:"Tchibo GmbH", corridor:"Colombia → DE (Coffee)", date:"2025-04-12", hash:"0xA3F2C8D1...9B1C4E2A", status:"valid" },
  { id:"ATT-2025-0111", po:"PO-2025-0448", client:"Tesco PLC", corridor:"Brazil → UK (Beef)", date:"2025-04-05", hash:"0xD2A8B3F7...1C5B9E4D", status:"valid" },
  { id:"ATT-2025-0110", po:"PO-2025-0452", client:"Tchibo GmbH", corridor:"Brazil → DE (Coffee)", date:"2025-03-28", hash:"0xF1B6A2C9...3E9C7D5B", status:"valid" },
  { id:"ATT-2025-0109", po:"PO-2025-0445", client:"Ahold Delhaize", corridor:"Thailand → NL (Seafood)", date:"2025-03-25", hash:"0xA8C2E4F1...6D4F3B8A", status:"valid" },
  { id:"ATT-2025-0108", po:"PO-2025-0441", client:"Carrefour Nederland BV", corridor:"Brazil → NL (Beef)", date:"2025-03-20", hash:"0xB3E7C5D2...9A1B6F4C", status:"valid" },
];

// ── Forwarder Data ──
const FORWARDER = {
  name: "Signal International Forwarding", hq: "Rotterdam, Netherlands",
  branches: [
    { id: "rot", name: "Rotterdam HQ", country: "Netherlands", port: "NLRTM", status: "live", staff: 24, corridors: 8,
      users: [
        { name: "Pieter van Dijk", role: "org-admin", email: "p.vandijk@signal-int.com" },
        { name: "Annemarie de Vries", role: "branch-manager", email: "a.devries@signal-int.com" },
        { name: "Luuk Bakker", role: "compliance-operator", email: "l.bakker@signal-int.com" },
        { name: "Sophie Jansen", role: "compliance-operator", email: "s.jansen@signal-int.com" },
        { name: "Daan Vermeer", role: "account-manager", email: "d.vermeer@signal-int.com" },
      ],
      clients: [
        { id: "c1", name: "Carrefour Nederland BV", corridors: ["Brazil → NL (Beef)", "Colombia → NL (Coffee)"], shipments: 127, score: 94, mode: "self-service", status: "active",
          users: [
            { name: "Jan de Boer", role: "compliance-admin", email: "j.deboer@carrefour.nl" },
            { name: "Eva Mulder", role: "buyer", email: "e.mulder@carrefour.nl" },
            { name: "Karin Smit", role: "qa-manager", email: "k.smit@carrefour.nl" },
            { name: "Tom Hendriks", role: "logistics-coord", email: "t.hendriks@carrefour.nl" },
            { name: "Lisa Visser", role: "finance-viewer", email: "l.visser@carrefour.nl" },
          ]},
        { id: "c2", name: "Ahold Delhaize", corridors: ["Brazil → NL (Poultry)", "Thailand → NL (Seafood)"], shipments: 89, score: 91, mode: "managed", status: "active", users: [] },
        { id: "c3", name: "Verstegen Spices", corridors: ["India → NL (Spices)", "Vietnam → NL (Pepper)"], shipments: 43, score: 88, mode: "managed", status: "active", users: [] },
        { id: "c4", name: "Van der Berg Import", corridors: ["Argentina → NL (Beef)"], shipments: 0, score: null, mode: "managed", status: "onboarding", users: [] },
      ]},
    { id: "fel", name: "Felixstowe Branch", country: "United Kingdom", port: "GBFXT", status: "cloned", staff: 12, corridors: 5, users: [],
      clients: [
        { id: "c5", name: "Tesco PLC", corridors: ["Brazil → UK (Beef)", "Kenya → UK (Vegetables)"], shipments: 64, score: 92, mode: "self-service", status: "active", users: [] },
        { id: "c6", name: "Morrisons Import", corridors: ["Brazil → UK (Poultry)"], shipments: 31, score: 87, mode: "managed", status: "active", users: [] },
      ]},
    { id: "ham", name: "Hamburg Office", country: "Germany", port: "DEHAM", status: "cloned", staff: 8, corridors: 4, users: [],
      clients: [
        { id: "c7", name: "Tchibo GmbH", corridors: ["Colombia → DE (Coffee)", "Brazil → DE (Coffee)"], shipments: 56, score: 95, mode: "self-service", status: "active", users: [] },
      ]},
    { id: "ant", name: "Antwerp Branch", country: "Belgium", port: "BEANR", status: "pending", staff: 6, corridors: 0, users: [], clients: [] },
    { id: "nyk", name: "New York Office", country: "United States", port: "USNYC", status: "pending", staff: 4, corridors: 0, users: [], clients: [] },
  ],
};

const FF_ROLES = [
  { id: "org-admin", label: "Organisation Admin", desc: "Full access: all branches, all clients, configuration, user management, billing", color: C.gold },
  { id: "branch-manager", label: "Branch Manager", desc: "Own branch only: clients, staff, verification pipeline, branch analytics", color: C.blueLt },
  { id: "compliance-operator", label: "Compliance Operator", desc: "Assigned clients only: document upload, attestation review, work queue", color: C.green },
  { id: "account-manager", label: "Account Manager", desc: "Assigned clients read-only: verification history, performance metrics, no config access", color: T.tertiary },
];

const IMP_ROLES = [
  { id: "compliance-admin", label: "Compliance Admin", desc: "Full access: all corridors, document settings, user management, analytics dashboard", color: C.gold },
  { id: "buyer", label: "Buyer / Procurement", desc: "PO and supplier view: originate shipments, view attestation status for their orders", color: C.blueLt },
  { id: "qa-manager", label: "QA Manager", desc: "Quality and compliance focus: view attestations, flag exceptions, review document deficiencies", color: "#8b5cf6" },
  { id: "logistics-coord", label: "Logistics Coordinator", desc: "Shipment operations: submit documents, track verification status, view work queue", color: C.green },
  { id: "finance-viewer", label: "Finance Viewer", desc: "Read-only: attestation records for receivables management, audit, and insurance", color: T.tertiary },
];

const TMS_FIELDS = [
  { field: "Customer Name", sample: "Carrefour Nederland BV", mapped: "clients.legal_name", conf: 98 },
  { field: "Customer Code", sample: "CNL-0042", mapped: "clients.reference_code", conf: 96 },
  { field: "Primary Corridor", sample: "BR-NL", mapped: "corridors.origin_destination", conf: 94 },
  { field: "Product Category", sample: "Frozen Meat", mapped: "corridors.product_category", conf: 91 },
  { field: "Office / Branch", sample: "Rotterdam", mapped: "branches.name", conf: 99 },
  { field: "Port Code", sample: "NLRTM", mapped: "branches.port_code", conf: 97 },
  { field: "Contact Email", sample: "import@carrefour.nl", mapped: "clients.contact_email", conf: 95 },
  { field: "HS Code Default", sample: "0202.30", mapped: "corridors.default_hs_code", conf: 93 },
  { field: "Annual Volume (TEU)", sample: "340", mapped: "clients.annual_volume_teu", conf: 89 },
  { field: "SOP Doc Ref", sample: "SOP-NL-MEAT-v3", mapped: "corridors.sop_reference", conf: 85 },
  { field: "Internal Notes", sample: "Premium client", mapped: "\u2014 unmapped \u2014", conf: 0 },
];

// ── Personas ──
const PERSONAS = [
  { id:"veri-admin", label:"VeriPura Admin", org:"VeriPura Platform", role:"Platform Administrator", topView:"admin", color:C.gold },
  { id:"ff-org-admin", label:"Pieter van Dijk", org:"Signal Int. Forwarding", role:"org-admin (FF)", topView:"forwarder", color:C.gold },
  { id:"ff-branch-mgr", label:"Annemarie de Vries", org:"Signal Int. — Rotterdam", role:"branch-manager (FF)", topView:"forwarder", color:C.blueLt },
  { id:"ff-compliance", label:"Luuk Bakker", org:"Signal Int. — Rotterdam", role:"compliance-operator (FF)", topView:"forwarder", color:C.green },
  { id:"ff-account-mgr", label:"Daan Vermeer", org:"Signal Int. — Rotterdam", role:"account-manager (FF)", topView:"forwarder", color:T.tertiary },
  { id:"imp-comp-admin", label:"Jan de Boer", org:"Carrefour Nederland BV", role:"compliance-admin (IMP)", topView:"importer", color:C.gold },
  { id:"imp-buyer", label:"Eva Mulder", org:"Carrefour Nederland BV", role:"buyer (IMP)", topView:"importer", color:C.blueLt },
  { id:"imp-finance", label:"Lisa Visser", org:"Carrefour Nederland BV", role:"finance-viewer (IMP)", topView:"importer", color:T.tertiary },
];

// ── Admin Data ──
const ADMIN_STATS = [
  { label:"Forwarder Orgs", value:"47", sub:"12 added this quarter" },
  { label:"Importers (Self-Service)", value:"184", sub:"across all orgs" },
  { label:"Shipments Verified", value:"12,847", sub:"YTD" },
  { label:"Attestations On-Chain", value:"8,391", sub:"immutable records" },
  { label:"VERI Tokens Issued", value:"183,420", sub:"circulating" },
  { label:"Avg Verification Time", value:"4.2h", sub:"target: <6h" },
];

const ADMIN_ORGS = [
  { name:"Signal International Forwarding", country:"Netherlands", branches:5, clients:7, shipments:410, plan:"Enterprise", status:"active" },
  { name:"Maersk Logistics Solutions", country:"Denmark", branches:12, clients:31, shipments:1840, plan:"Enterprise", status:"active" },
  { name:"Kuehne+Nagel Amsterdam", country:"Netherlands", branches:3, clients:14, shipments:720, plan:"Pro", status:"active" },
  { name:"DHL Global Forwarding", country:"Germany", branches:8, clients:22, shipments:1120, plan:"Enterprise", status:"active" },
  { name:"Bolloré Transport", country:"France", branches:4, clients:9, shipments:380, plan:"Pro", status:"active" },
  { name:"Pacific Freight Solutions", country:"Singapore", branches:2, clients:5, shipments:210, plan:"Starter", status:"trial" },
  { name:"Atlas Forwarding GmbH", country:"Germany", branches:1, clients:3, shipments:0, plan:"Starter", status:"onboarding" },
];

const ADMIN_ACTIVITY = [
  { time:"14:32", msg:"PO-2025-0451 attestation issued — Tchibo GmbH (Colombia → DE Coffee)", type:"attest" },
  { time:"14:18", msg:"Signal Int. Forwarding: New branch 'Antwerp' submitted for review", type:"org" },
  { time:"13:55", msg:"Compliance flag raised: PO-2025-0446 — phytosanitary cert expired", type:"flag" },
  { time:"13:41", msg:"Maersk Logistics: 3 new importer users invited (self-service)", type:"user" },
  { time:"12:59", msg:"PO-2025-0452 attestation issued — Tchibo GmbH (Brazil → DE Coffee)", type:"attest" },
  { time:"12:34", msg:"Atlas Forwarding GmbH completed TMS import — 3 clients configured", type:"org" },
  { time:"11:48", msg:"Pacific Freight Solutions: trial expires in 7 days", type:"billing" },
  { time:"10:22", msg:"Kenya → UK (Vegetables): new corridor template published by platform team", type:"platform" },
];

// ── Shared Components ──

function Badge({ text, color = C.gold, small }) {
  return <span style={{ fontSize: small ? 11 : 12, letterSpacing: 1, padding: small ? "2px 7px" : "3px 10px", borderRadius: 3, fontWeight: 700, background: `${color}20`, color }}>{text}</span>;
}

function StatCard({ label, value, sub, color = C.gold }) {
  return (
    <div style={{ background: C.navyMid, borderRadius: 8, padding: "18px 16px", border: `1px solid ${C.blue}18` }}>
      <div style={{ fontSize: 12, color: T.tertiary, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div style={{ fontFamily: "Georgia, serif", fontSize: 28, fontWeight: 700, color, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 13, color: T.tertiary, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function RoleTag({ roleId, roles }) {
  const role = roles.find(r => r.id === roleId);
  if (!role) return null;
  return <Badge text={role.label.toUpperCase()} color={role.color} small />;
}

// 7-dot stage indicator
function StageDots({ stage }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 3 }}>
      {PO_STAGES.map((s, i) => {
        const done = i < stage;
        const current = i === stage;
        const isVerifying = current && s === "Verifying";
        return (
          <div key={i} title={s} style={{
            width: current ? 12 : 8, height: current ? 12 : 8,
            borderRadius: "50%",
            background: done ? C.green : current ? (isVerifying ? C.gold : C.blueLt) : C.navyMid,
            border: `1px solid ${done ? C.green : current ? (isVerifying ? C.gold : C.blueLt) : C.blue + "44"}`,
            transition: "all 0.2s",
            animation: isVerifying ? "pulse 1.5s infinite" : "none",
            flexShrink: 0,
          }} />
        );
      })}
      <span style={{ fontSize: 11, color: T.tertiary, marginLeft: 4, whiteSpace: "nowrap" }}>{PO_STAGES[stage]}</span>
    </div>
  );
}

// ── TMS Import ──
function TmsImport({ onComplete }) {
  const [phase, setPhase] = useState("connect");
  const [mapStep, setMapStep] = useState(0);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    if (phase === "mapping") {
      const iv = setInterval(() => setMapStep(s => s < TMS_FIELDS.length - 1 ? s + 1 : s), 600);
      return () => clearInterval(iv);
    }
  }, [phase]);

  if (phase === "connect") return (
    <div style={{ padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 12, color: T.accent, letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>STEP 1 OF 3</div>
      <h3 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: T.primary, margin: "0 0 8px" }}>Connect Your TMS</h3>
      <p style={{ color: T.secondary, fontSize: 14, marginBottom: 28, maxWidth: 520, marginInline: "auto", lineHeight: 1.6 }}>
        Import your client list, branch structure, corridors, and SOPs directly from your transport management system.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, maxWidth: 500, marginInline: "auto", marginBottom: 24 }}>
        {[{ name: "CargoWise", icon: "🔷" }, { name: "Descartes", icon: "🟢" }, { name: "CSV Upload", icon: "📄" }].map(t => (
          <div key={t.name} onClick={() => setPhase("mapping")}
            style={{ background: C.navyMid, borderRadius: 8, padding: "20px 14px", cursor: "pointer", border: `1px solid ${C.blue}22`, transition: "border-color 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
            onMouseLeave={e => e.currentTarget.style.borderColor = C.blue + "22"}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{t.icon}</div>
            <div style={{ fontSize: 14, color: T.primary, fontWeight: 600 }}>{t.name}</div>
          </div>
        ))}
      </div>
      <button onClick={onComplete} style={{ background: "transparent", border: `1px solid ${C.border}`, color: T.tertiary, borderRadius: 6, padding: "8px 20px", fontSize: 13, cursor: "pointer" }}>
        Skip — set up manually
      </button>
    </div>
  );

  if (phase === "mapping") {
    const done = mapStep >= TMS_FIELDS.length - 1;
    return (
      <div style={{ padding: 20 }}>
        <div style={{ fontSize: 12, color: T.accent, letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>STEP 2 OF 3 — AI COPILOT</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, color: T.primary, margin: 0 }}>Mapping TMS to VeriPura</h3>
          <span style={{ fontSize: 13, color: done ? C.green : T.accent, fontWeight: 600 }}>{done ? "✓ Complete" : `${mapStep + 1} / ${TMS_FIELDS.length}`}</span>
        </div>
        <div style={{ background: C.navy, borderRadius: 8, padding: 14, fontFamily: "'DM Mono', monospace" }}>
          <div style={{ display: "grid", gridTemplateColumns: "150px 130px 24px 210px 50px", gap: 6, padding: "6px 0", borderBottom: `1px solid ${C.navyMid}`, fontSize: 12, color: T.tertiary, letterSpacing: 1, fontWeight: 600 }}>
            <div>TMS FIELD</div><div>SAMPLE</div><div></div><div>VERIPURA</div><div>CONF</div>
          </div>
          {TMS_FIELDS.map((m, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "150px 130px 24px 210px 50px", gap: 6, padding: "7px 0", borderBottom: `1px solid ${C.navyMid}33`, opacity: i <= mapStep ? 1 : 0.15, transition: "opacity 0.3s", alignItems: "center" }}>
              <div style={{ fontSize: 13, color: T.primary }}>{m.field}</div>
              <div style={{ fontSize: 13, color: T.tertiary }}>{m.sample}</div>
              <div style={{ fontSize: 14, color: m.conf === 0 ? C.red : T.accent, textAlign: "center" }}>{m.conf === 0 ? "✗" : "→"}</div>
              <div style={{ fontSize: 13, color: m.conf === 0 ? T.tertiary : C.blueLt }}>{m.mapped}</div>
              <div style={{ fontSize: 13, color: m.conf >= 90 ? C.green : m.conf >= 80 ? T.accent : T.tertiary, fontWeight: 700 }}>{m.conf > 0 ? `${m.conf}%` : "—"}</div>
            </div>
          ))}
        </div>
        {done && (
          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: C.green }}>✓ 10 mapped · 1 skipped</span>
            <button onClick={() => setPhase("review")} style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Review & Confirm →</button>
          </div>
        )}
      </div>
    );
  }

  if (phase === "review") return (
    <div style={{ padding: 24 }}>
      <div style={{ fontSize: 12, color: T.accent, letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>STEP 3 OF 3 — REVIEW</div>
      <h3 style={{ fontFamily: "Georgia, serif", fontSize: 20, color: T.primary, margin: "0 0 20px" }}>Ready to Import</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        <StatCard label="Branches" value="5" sub="from TMS offices" color={T.primary} />
        <StatCard label="Clients" value="7" sub="from customer DB" color={T.primary} />
        <StatCard label="Corridors" value="12" sub="from shipment history" color={T.primary} />
        <StatCard label="SOPs" value="4" sub="templates detected" color={T.primary} />
      </div>
      <div style={{ padding: 16, background: `${T.accent}10`, borderRadius: 8, border: `1px solid ${T.accent}30`, marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: T.accent, fontWeight: 700, marginBottom: 6 }}>AI Copilot Summary</div>
        <div style={{ fontSize: 14, color: T.secondary, lineHeight: 1.7 }}>
          Pre-built configurations for 5 branches, 7 clients, and 12 corridors. Document checklists generated per corridor and regulatory regime. 4 clients set to Managed mode, 3 to Self-Service based on TMS activity flags.
        </div>
      </div>
      <button onClick={() => { setImporting(true); setTimeout(() => onComplete(), 1500); }} disabled={importing}
        style={{ background: importing ? C.navyMid : C.gold, color: importing ? T.tertiary : C.navy, border: "none", borderRadius: 6, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: importing ? "default" : "pointer" }}>
        {importing ? "Importing..." : "Confirm & Import"}
      </button>
    </div>
  );
  return null;
}

// ── Role Panel ──
function RolePanel({ title, roles, users, entityType }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newRole, setNewRole] = useState(roles[0]?.id);

  return (
    <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700 }}>{title}</div>
        <button onClick={() => setShowAdd(!showAdd)} style={{ background: showAdd ? C.red + "20" : C.navy, color: showAdd ? C.red : T.secondary, border: `1px solid ${showAdd ? C.red + "40" : C.blue + "22"}`, borderRadius: 4, padding: "6px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
          {showAdd ? "Cancel" : "+ Add User"}
        </button>
      </div>
      {showAdd && (
        <div style={{ background: C.navy, borderRadius: 6, padding: 14, marginBottom: 14, border: `1px solid ${T.accent}30` }}>
          <div style={{ fontSize: 13, color: T.secondary, marginBottom: 10 }}>Assign a role to a new user:</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            {roles.map(r => (
              <button key={r.id} onClick={() => setNewRole(r.id)}
                style={{ background: newRole === r.id ? `${r.color}25` : "transparent", border: `1px solid ${newRole === r.id ? r.color : C.blue + "22"}`, borderRadius: 4, padding: "6px 12px", fontSize: 12, color: newRole === r.id ? r.color : T.tertiary, cursor: "pointer", fontWeight: 600 }}>
                {r.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 13, color: T.tertiary, marginBottom: 10, lineHeight: 1.5 }}>{roles.find(r => r.id === newRole)?.desc}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Email address" style={{ flex: 1, background: C.navyMid, border: `1px solid ${C.blue}22`, borderRadius: 4, padding: "8px 12px", color: T.primary, fontSize: 14 }} />
            <button style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 4, padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Send Invite</button>
          </div>
        </div>
      )}
      {users.length > 0 ? users.map((u, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < users.length - 1 ? `1px solid ${C.navy}` : "none" }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.navy, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: T.accent, flexShrink: 0 }}>
            {u.name.split(" ").map(n => n[0]).join("")}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, color: T.primary, fontWeight: 600 }}>{u.name}</div>
            <div style={{ fontSize: 13, color: T.tertiary }}>{u.email}</div>
          </div>
          <RoleTag roleId={u.role} roles={roles} />
        </div>
      )) : (
        <div style={{ fontSize: 14, color: T.tertiary, fontStyle: "italic", padding: "12px 0" }}>
          {entityType === "importer" ? "Managed mode — no importer users configured." : "No users configured yet."}
        </div>
      )}
      <div style={{ marginTop: 14, padding: 12, background: C.navy, borderRadius: 6 }}>
        <div style={{ fontSize: 12, color: T.tertiary, fontWeight: 600, marginBottom: 8 }}>ROLE REFERENCE</div>
        {roles.map(r => (
          <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, marginTop: 5, flexShrink: 0 }} />
            <div><span style={{ fontSize: 13, color: T.secondary, fontWeight: 600 }}>{r.label}: </span><span style={{ fontSize: 13, color: T.tertiary }}>{r.desc}</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Forwarder Sub-Views ──
function OrgView({ branches, onBranch }) {
  const [showImport, setShowImport] = useState(false);
  const totalClients = branches.reduce((s, b) => s + b.clients.length, 0);
  const totalShipments = branches.reduce((s, b) => s + b.clients.reduce((ss, c) => ss + c.shipments, 0), 0);
  const liveBranches = branches.filter(b => b.status !== "pending").length;
  const scored = branches.flatMap(b => b.clients).filter(c => c.score);
  const avgScore = scored.length ? Math.round(scored.reduce((s, c) => s + c.score, 0) / scored.length) : 0;

  if (showImport) return (
    <div style={{ background: C.navyMid, borderRadius: 10, border: `1px solid ${C.blue}18` }}>
      <TmsImport onComplete={() => setShowImport(false)} />
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 12, color: T.accent, letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>ORGANISATION OVERVIEW</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 28, color: T.primary, margin: 0 }}>{FORWARDER.name}</h2>
          <div style={{ fontSize: 14, color: T.secondary, marginTop: 4 }}>HQ: {FORWARDER.hq}</div>
        </div>
        <button onClick={() => setShowImport(true)} style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 6, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
          Import from TMS
        </button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 28 }}>
        <StatCard label="Branches" value={branches.length} sub={`${liveBranches} active`} />
        <StatCard label="Clients" value={totalClients} sub="all branches" />
        <StatCard label="Shipments" value={totalShipments} sub="verified YTD" />
        <StatCard label="Avg Score" value={avgScore} color={avgScore >= 90 ? C.green : C.gold} sub="weighted" />
        <StatCard label="Corridors" value={branches.reduce((s, b) => s + b.corridors, 0)} sub="active routes" />
      </div>
      <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>BRANCHES</div>
      <div style={{ display: "grid", gap: 8 }}>
        {branches.map(b => {
          const st = { live: C.green, cloned: C.gold, pending: T.tertiary };
          const bShip = b.clients.reduce((s, c) => s + c.shipments, 0);
          return (
            <div key={b.id} onClick={() => onBranch(b)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: C.navyMid, borderRadius: 8, cursor: "pointer", border: `1px solid ${C.blue}18`, transition: "border-color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.gold + "50"}
              onMouseLeave={e => e.currentTarget.style.borderColor = C.blue + "18"}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: st[b.status], flexShrink: 0 }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, color: T.primary, fontWeight: 600 }}>{b.name}</div>
                <div style={{ fontSize: 14, color: T.secondary }}>{b.country} · Port: {b.port} · {b.staff} staff</div>
              </div>
              <div style={{ textAlign: "right", marginRight: 8 }}>
                <div style={{ fontSize: 14, color: T.primary }}>{b.clients.length} clients</div>
                <div style={{ fontSize: 13, color: T.tertiary }}>{bShip} shipments</div>
              </div>
              <Badge text={b.status.toUpperCase()} color={st[b.status]} />
              <div style={{ color: T.tertiary, fontSize: 16 }}>→</div>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 20 }}>
        <RolePanel title="ORGANISATION USER ROLES" roles={FF_ROLES} users={branches[0]?.users || []} entityType="forwarder" />
      </div>
    </div>
  );
}

function BranchView({ branch, onBack, onClient }) {
  const st = { live: C.green, cloned: C.gold, pending: T.tertiary };
  const bShip = branch.clients.reduce((s, c) => s + c.shipments, 0);
  const liveBranch = FORWARDER.branches.find(b => b.status === "live");

  return (
    <div>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: T.tertiary, fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back to Organisation</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: st[branch.status] }} />
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: T.primary, margin: 0 }}>{branch.name}</h2>
            <Badge text={branch.status.toUpperCase()} color={st[branch.status]} />
          </div>
          <div style={{ fontSize: 14, color: T.secondary, marginTop: 4 }}>{branch.country} · Port: {branch.port} · {branch.staff} staff · {branch.corridors} corridors</div>
        </div>
        {branch.status === "pending" && liveBranch && (
          <button style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 6, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            Clone from {liveBranch.name} →
          </button>
        )}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Clients" value={branch.clients.length} />
        <StatCard label="Shipments" value={bShip} />
        <StatCard label="Corridors" value={branch.corridors} />
        <StatCard label="Staff" value={branch.staff} />
      </div>
      {branch.clients.length > 0 ? (
        <>
          <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 10 }}>IMPORTER CLIENTS</div>
          <div style={{ display: "grid", gap: 6, marginBottom: 20 }}>
            {branch.clients.map(c => (
              <div key={c.id} onClick={() => onClient(c, branch)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: C.navy, borderRadius: 6, cursor: "pointer", border: `1px solid ${C.blue}12`, transition: "border-color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = C.gold + "40"}
                onMouseLeave={e => e.currentTarget.style.borderColor = C.blue + "12"}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.score ? (c.score >= 90 ? `${C.green}20` : `${C.gold}20`) : C.navyMid, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: c.score ? (c.score >= 90 ? C.green : C.gold) : T.tertiary, flexShrink: 0 }}>
                  {c.score || "—"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, color: T.primary, fontWeight: 600 }}>{c.name}</div>
                  <div style={{ fontSize: 13, color: T.secondary }}>{c.corridors.join(" · ")}</div>
                </div>
                <Badge text={c.mode === "self-service" ? "SELF-SERVICE" : "MANAGED"} color={c.mode === "self-service" ? C.blueLt : C.gold} small />
                <Badge text={c.status === "active" ? "ACTIVE" : "ONBOARDING"} color={c.status === "active" ? C.green : C.gold} small />
                <div style={{ color: T.tertiary, fontSize: 14 }}>→</div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 16, color: T.tertiary, marginBottom: 12 }}>No clients configured yet</div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 6, padding: "10px 20px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>+ Add Client</button>
            {liveBranch && <button style={{ background: C.navyMid, color: T.secondary, border: `1px solid ${C.blue}22`, borderRadius: 6, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>Clone from {liveBranch.name}</button>}
          </div>
        </div>
      )}
      <RolePanel title="BRANCH USER ROLES" roles={FF_ROLES.filter(r => r.id !== "org-admin")} users={branch.users || []} entityType="forwarder" />
    </div>
  );
}

function ClientView({ client, branch, onBack }) {
  const [mode, setMode] = useState(client.mode);
  return (
    <div>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: T.tertiary, fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back to {branch.name}</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: T.primary, margin: 0 }}>{client.name}</h2>
          <div style={{ fontSize: 14, color: T.secondary, marginTop: 4 }}>Branch: {branch.name} · {client.corridors.length} corridor{client.corridors.length > 1 ? "s" : ""}</div>
        </div>
        <Badge text={client.status === "active" ? "ACTIVE" : "ONBOARDING"} color={client.status === "active" ? C.green : C.gold} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="Shipments" value={client.shipments} />
        <StatCard label="VeriPura Score" value={client.score || "—"} color={client.score >= 90 ? C.green : client.score >= 80 ? C.gold : T.tertiary} />
        <StatCard label="Corridors" value={client.corridors.length} />
      </div>
      <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18`, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>CLIENT ACCESS MODEL</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { id: "managed", title: "Managed", desc: "You handle compliance on the client's behalf. Client receives attestation reports. No client login.", icon: "🛡️" },
            { id: "self-service", title: "Self-Service", desc: "Client gets their own dashboard. They submit documents, view attestations, and manage their users.", icon: "🖥️" },
          ].map(m => (
            <div key={m.id} onClick={() => setMode(m.id)}
              style={{ background: mode === m.id ? `${C.gold}12` : C.navy, border: `1px solid ${mode === m.id ? C.gold : C.blue + "22"}`, borderRadius: 8, padding: 16, cursor: "pointer", transition: "all 0.2s" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 20 }}>{m.icon}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: T.primary }}>{m.title}</span>
                {mode === m.id && <Badge text="ACTIVE" color={C.green} small />}
              </div>
              <div style={{ fontSize: 14, color: T.secondary, lineHeight: 1.6 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
      {mode === "self-service" && <RolePanel title="IMPORTER USER ROLES" roles={IMP_ROLES} users={client.users || []} entityType="importer" />}
      {mode === "managed" && (
        <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18`, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>MANAGED MODE</div>
          <div style={{ fontSize: 14, color: T.secondary, lineHeight: 1.6 }}>
            All compliance verification for {client.name} is managed by your team at {branch.name}. The client receives attestation reports by email.
          </div>
        </div>
      )}
      <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18`, marginTop: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>ACTIVE CORRIDORS</div>
        {client.corridors.map((cor, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < client.corridors.length - 1 ? `1px solid ${C.navy}` : "none" }}>
            <div style={{ fontSize: 14, color: T.primary }}>{cor}</div>
            <Badge text="CONFIGURED" color={C.green} small />
          </div>
        ))}
      </div>
      <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18` }}>
        <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>DOCUMENT CHECKLIST (PRIMARY CORRIDOR)</div>
        {["Health Certificate","Phytosanitary Certificate","Commercial Invoice","Bill of Lading","Certificate of Origin","Packing List"].map((doc, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0" }}>
            <span style={{ color: C.green, fontSize: 14 }}>✓</span>
            <span style={{ fontSize: 14, color: T.primary }}>{doc}</span>
          </div>
        ))}
        <div style={{ fontSize: 13, color: T.tertiary, marginTop: 8, fontStyle: "italic" }}>Auto-generated from corridor template. Overrides available at client level.</div>
      </div>
    </div>
  );
}

// ── PO Detail View ──
function DocCard({ label, ref_, present, checks }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background: C.navy, borderRadius: 6, border: `1px solid ${present ? C.blue + "30" : C.red + "30"}`, marginBottom: 8 }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer" }}>
        <span style={{ fontSize: 16, color: present ? C.green : C.red }}>{present ? "✓" : "✗"}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, color: T.primary, fontWeight: 600 }}>{label}</div>
          {ref_ && <div style={{ fontSize: 12, color: T.tertiary, fontFamily: "'DM Mono', monospace" }}>{ref_}</div>}
        </div>
        {!present && <Badge text="MISSING" color={C.red} small />}
        {present && <Badge text="UPLOADED" color={C.green} small />}
        <span style={{ fontSize: 12, color: T.tertiary }}>{open ? "▲" : "▼"}</span>
      </div>
      {open && present && checks && (
        <div style={{ padding: "0 14px 12px", borderTop: `1px solid ${C.navyMid}` }}>
          <div style={{ fontSize: 12, color: T.tertiary, fontWeight: 700, letterSpacing: 1, marginTop: 10, marginBottom: 8 }}>CROSS-DOCUMENT CHECKS</div>
          {checks.map((chk, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: i < checks.length - 1 ? `1px solid ${C.navyMid}` : "none" }}>
              <span style={{ fontSize: 13, color: chk.pass ? C.green : C.red }}>{chk.pass ? "✓" : "✗"}</span>
              <span style={{ fontSize: 13, color: chk.pass ? T.secondary : T.primary }}>{chk.label}</span>
              {!chk.pass && <Badge text="MISMATCH" color={C.red} small />}
            </div>
          ))}
        </div>
      )}
      {open && !present && (
        <div style={{ padding: "8px 14px 12px", borderTop: `1px solid ${C.navyMid}` }}>
          <div style={{ fontSize: 13, color: T.tertiary, marginBottom: 8 }}>Document not yet uploaded. Required for this corridor.</div>
          <button style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 4, padding: "7px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>Upload Document</button>
        </div>
      )}
    </div>
  );
}

function PODetail({ po, onBack }) {
  const docDefs = [
    { key:"bol", label:"Bill of Lading", checks:[
      { label:"Shipper name matches Health Certificate", pass:true },
      { label:"Port of loading matches corridor origin", pass:true },
      { label:"Commodity description matches invoice", pass:po.id !== "PO-2025-0443" },
    ]},
    { key:"health", label:"Health Certificate", checks:[
      { label:"Issue date within 30 days of departure", pass:true },
      { label:"Competent authority signature present", pass:true },
      { label:"Product description matches BoL", pass:true },
    ]},
    { key:"invoice", label:"Commercial Invoice", checks:[
      { label:"Invoice value within 5% of PO value", pass:true },
      { label:"Seller details match certificate of origin", pass:true },
      { label:"Currency and Incoterms specified", pass:true },
    ]},
    { key:"coo", label:"Certificate of Origin", checks:[
      { label:"Origin country matches corridor", pass:true },
      { label:"HS code matches product category", pass:po.id !== "PO-2025-0449" },
      { label:"Issuing body accredited", pass:true },
    ]},
    { key:"phyto", label:"Phytosanitary Certificate", checks:[
      { label:"Treatment method specified", pass:true },
      { label:"Certificate number on BoL", pass:true },
    ]},
    { key:"pack", label:"Packing List", checks:[
      { label:"Quantities match BoL", pass:true },
      { label:"Net/gross weight declared", pass:true },
    ]},
  ];

  const stageColor = po.stage === 6 ? C.green : po.stage === 2 ? C.gold : po.stage >= 4 ? C.blueLt : T.tertiary;

  return (
    <div>
      <button onClick={onBack} style={{ background: "transparent", border: "none", color: T.tertiary, fontSize: 14, cursor: "pointer", marginBottom: 16, padding: 0 }}>← Back to Pipeline</button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 12, color: T.accent, letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>PO DETAIL</div>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: T.primary, margin: 0 }}>{po.id}</h2>
          <div style={{ fontSize: 14, color: T.secondary, marginTop: 4 }}>{po.supplier} · {po.origin} → {po.dest} · {po.product}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 13, color: T.tertiary, marginBottom: 4 }}>ETA: {po.eta}</div>
          <Badge text={PO_STAGES[po.stage].toUpperCase()} color={stageColor} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Value" value={po.value} color={T.primary} />
        <StatCard label="Quantity" value={po.qty} color={T.primary} />
        <StatCard label="Stage" value={`${po.stage + 1}/7`} color={stageColor} sub={PO_STAGES[po.stage]} />
        <StatCard label="Docs" value={`${po.docs.length}/6`} color={po.docs.length >= 5 ? C.green : po.docs.length >= 3 ? C.gold : C.red} sub="uploaded" />
      </div>

      {/* Stage bar */}
      <div style={{ background: C.navyMid, borderRadius: 8, padding: "16px 20px", marginBottom: 20, border: `1px solid ${C.blue}18` }}>
        <div style={{ fontSize: 12, color: T.tertiary, fontWeight: 600, letterSpacing: 1, marginBottom: 12 }}>VERIFICATION PIPELINE</div>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {PO_STAGES.map((s, i) => {
            const done = i < po.stage;
            const current = i === po.stage;
            const isVerifying = current && s === "Verifying";
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                <div style={{ width: "100%", height: 3, background: done ? C.green : current ? C.gold : C.navyMid + "aa", position: "absolute", top: 10, left: i === 0 ? "50%" : 0, right: i === PO_STAGES.length - 1 ? "50%" : 0 }} />
                <div style={{ width: 22, height: 22, borderRadius: "50%", background: done ? C.green : current ? C.gold : C.navyMid, border: `2px solid ${done ? C.green : current ? C.gold : C.blue + "44"}`, zIndex: 1, display: "flex", alignItems: "center", justifyContent: "center", animation: isVerifying ? "pulse 1.5s infinite" : "none" }}>
                  {done && <span style={{ fontSize: 10, color: C.navy }}>✓</span>}
                </div>
                <div style={{ fontSize: 10, color: done ? T.secondary : current ? T.accent : T.tertiary, marginTop: 6, textAlign: "center", fontWeight: current ? 700 : 400 }}>{s}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Documents */}
      <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>DOCUMENT VERIFICATION</div>
      {docDefs.map(d => (
        <DocCard key={d.key} label={d.label} ref_={po[d.key]} present={po.docs.includes(d.key)} checks={d.checks} />
      ))}

      {po.stage === 6 && (
        <div style={{ marginTop: 16, padding: 16, background: `${C.green}10`, borderRadius: 8, border: `1px solid ${C.green}30` }}>
          <div style={{ fontSize: 13, color: C.green, fontWeight: 700, marginBottom: 4 }}>Attestation Issued</div>
          <div style={{ fontSize: 13, color: T.secondary }}>Blockchain reference: <span style={{ fontFamily: "'DM Mono', monospace", color: T.accent }}>ATT-2025-{po.id.slice(-4)}</span></div>
        </div>
      )}
    </div>
  );
}

// ── PO Pipeline ──
function PipelineView({ onSelectPO }) {
  const [filter, setFilter] = useState("all");
  const stages = ["all", ...PO_STAGES];
  const filtered = filter === "all" ? PO_DATA : PO_DATA.filter(p => PO_STAGES[p.stage] === filter);

  return (
    <div>
      <div style={{ fontSize: 12, color: T.accent, letterSpacing: 3, fontWeight: 700, marginBottom: 16 }}>PO PIPELINE</div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {stages.map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{ background: filter === s ? C.gold + "20" : "transparent", border: `1px solid ${filter === s ? C.gold : C.blue + "22"}`, borderRadius: 4, padding: "5px 12px", fontSize: 12, color: filter === s ? T.accent : T.tertiary, cursor: "pointer", fontWeight: filter === s ? 700 : 400 }}>
            {s === "all" ? "All" : s} {s !== "all" && `(${PO_DATA.filter(p => PO_STAGES[p.stage] === s).length})`}
          </button>
        ))}
      </div>
      <div style={{ background: C.navyMid, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.blue}18` }}>
        <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 120px 90px 90px 160px 80px", gap: 0, padding: "10px 14px", borderBottom: `1px solid ${C.navy}`, fontSize: 11, color: T.tertiary, letterSpacing: 1, fontWeight: 700 }}>
          <div>PO ID</div><div>SUPPLIER / PRODUCT</div><div>CORRIDOR</div><div>VALUE</div><div>DOCS</div><div>STAGE</div><div>ETA</div>
        </div>
        {filtered.map((po, i) => (
          <div key={po.id} onClick={() => onSelectPO(po)}
            style={{ display: "grid", gridTemplateColumns: "110px 1fr 120px 90px 90px 160px 80px", gap: 0, padding: "12px 14px", borderBottom: i < filtered.length - 1 ? `1px solid ${C.navy}` : "none", cursor: "pointer", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = C.navy + "88"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{ fontSize: 12, color: T.accent, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{po.id}</div>
            <div>
              <div style={{ fontSize: 13, color: T.primary, fontWeight: 600 }}>{po.supplier}</div>
              <div style={{ fontSize: 12, color: T.secondary }}>{po.product}</div>
            </div>
            <div style={{ fontSize: 12, color: T.secondary }}>{po.origin} → {po.dest}</div>
            <div style={{ fontSize: 13, color: T.primary, fontWeight: 600 }}>{po.value}</div>
            <div>
              <div style={{ fontSize: 13, color: po.docs.length >= 5 ? C.green : po.docs.length >= 3 ? C.gold : C.red, fontWeight: 700 }}>{po.docs.length}/6</div>
            </div>
            <div><StageDots stage={po.stage} /></div>
            <div style={{ fontSize: 12, color: T.tertiary }}>{po.eta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── VERI Token Dashboard ──
function VeriDashboard() {
  const maxEarned = Math.max(...VERI_CHART.map(d => d.earned));
  const totalEarned = VERI_EVENTS.filter(e => e.type === "earn").reduce((s, e) => s + e.tokens, 0);
  const totalSpent = VERI_EVENTS.filter(e => e.type === "spend").reduce((s, e) => s + Math.abs(e.tokens), 0);

  return (
    <div>
      <div style={{ fontSize: 12, color: T.accent, letterSpacing: 3, fontWeight: 700, marginBottom: 16 }}>VERI TOKEN ACCOUNT</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        <StatCard label="VERI Balance" value="4,820" color={C.gold} sub="tokens held" />
        <StatCard label="Earned (YTD)" value={totalEarned} color={C.green} sub="from attestations" />
        <StatCard label="Spent (YTD)" value={totalSpent} color={C.red} sub="re-submissions" />
        <StatCard label="Attestations" value="38" color={T.primary} sub="this year" />
      </div>

      {/* Bar Chart */}
      <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, marginBottom: 20, border: `1px solid ${C.blue}18` }}>
        <div style={{ fontSize: 12, color: T.tertiary, fontWeight: 700, letterSpacing: 1, marginBottom: 16 }}>TOKEN ACTIVITY — LAST 7 MONTHS</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120 }}>
          {VERI_CHART.map(d => (
            <div key={d.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2, height: "100%", justifyContent: "flex-end" }}>
              <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: "90%" }}>
                <div style={{ flex: 1, background: `${C.green}cc`, borderRadius: "3px 3px 0 0", height: `${(d.earned / maxEarned) * 100}%`, minHeight: 4 }} title={`Earned: ${d.earned}`} />
                <div style={{ flex: 1, background: `${C.red}cc`, borderRadius: "3px 3px 0 0", height: `${(d.spent / maxEarned) * 100}%`, minHeight: 2 }} title={`Spent: ${d.spent}`} />
              </div>
              <div style={{ fontSize: 11, color: T.tertiary }}>{d.month}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 12, background: `${C.green}cc`, borderRadius: 2 }} /><span style={{ fontSize: 12, color: T.tertiary }}>Earned</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 12, height: 12, background: `${C.red}cc`, borderRadius: 2 }} /><span style={{ fontSize: 12, color: T.tertiary }}>Spent</span></div>
        </div>
      </div>

      {/* Events table */}
      <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, marginBottom: 20, border: `1px solid ${C.blue}18` }}>
        <div style={{ fontSize: 12, color: T.tertiary, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>RECENT TOKEN EVENTS</div>
        <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 110px 100px 130px", fontSize: 11, color: T.tertiary, fontWeight: 700, letterSpacing: 1, marginBottom: 8, padding: "0 4px" }}>
          <div>DATE</div><div>EVENT</div><div>PO</div><div>TOKENS</div><div>TX HASH</div>
        </div>
        {VERI_EVENTS.map((e, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "100px 1fr 110px 100px 130px", padding: "9px 4px", borderTop: `1px solid ${C.navy}`, alignItems: "center" }}>
            <div style={{ fontSize: 12, color: T.tertiary }}>{e.date}</div>
            <div style={{ fontSize: 13, color: T.primary }}>{e.event}</div>
            <div style={{ fontSize: 12, color: T.accent, fontFamily: "'DM Mono', monospace" }}>{e.po}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: e.type === "earn" ? C.green : C.red }}>{e.type === "earn" ? "+" : ""}{e.tokens}</div>
            <div style={{ fontSize: 11, color: T.tertiary, fontFamily: "'DM Mono', monospace" }}>{e.hash}</div>
          </div>
        ))}
      </div>

      {/* Attestation records */}
      <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18` }}>
        <div style={{ fontSize: 12, color: T.tertiary, fontWeight: 700, letterSpacing: 1, marginBottom: 14 }}>ON-CHAIN ATTESTATION RECORDS</div>
        <div style={{ display: "grid", gridTemplateColumns: "130px 110px 160px 1fr 80px", fontSize: 11, color: T.tertiary, fontWeight: 700, letterSpacing: 1, marginBottom: 8, padding: "0 4px" }}>
          <div>ATT ID</div><div>PO REF</div><div>CLIENT</div><div>HASH</div><div>STATUS</div>
        </div>
        {ATTESTATIONS.map((a, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "130px 110px 160px 1fr 80px", padding: "9px 4px", borderTop: `1px solid ${C.navy}`, alignItems: "center" }}>
            <div style={{ fontSize: 12, color: T.accent, fontFamily: "'DM Mono', monospace" }}>{a.id}</div>
            <div style={{ fontSize: 12, color: T.secondary }}>{a.po}</div>
            <div style={{ fontSize: 12, color: T.secondary }}>{a.client}</div>
            <div style={{ fontSize: 11, color: T.tertiary, fontFamily: "'DM Mono', monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.hash}</div>
            <Badge text="VALID" color={C.green} small />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Forwarder View ──
function ForwarderView({ persona }) {
  const [tab, setTab] = useState("org");
  const [ffView, setFfView] = useState("org");
  const [branch, setBranch] = useState(null);
  const [client, setClient] = useState(null);
  const [clientBranch, setClientBranch] = useState(null);
  const [selectedPO, setSelectedPO] = useState(null);

  // Role-based tab visibility
  const canSeeOrg = ["org-admin","ff-org-admin"].includes(persona.id);
  const canSeePipeline = ["org-admin","ff-org-admin","ff-branch-mgr","ff-compliance"].includes(persona.id);
  const canSeeVeri = ["org-admin","ff-org-admin","ff-branch-mgr"].includes(persona.id);

  const tabs = [
    { id:"org", label:"Organisation", show: canSeeOrg || persona.id === "ff-branch-mgr" || persona.id === "ff-compliance" || persona.id === "ff-account-mgr" },
    { id:"pipeline", label:"Pipeline", show: canSeePipeline },
    { id:"veri", label:"VERI Account", show: canSeeVeri },
  ].filter(t => t.show);

  return (
    <div>
      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `2px solid ${C.navyMid}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: "transparent", border: "none", borderBottom: `2px solid ${tab === t.id ? C.gold : "transparent"}`, color: tab === t.id ? T.primary : T.tertiary, padding: "10px 20px", fontSize: 15, fontWeight: tab === t.id ? 700 : 400, cursor: "pointer", marginBottom: -2 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "org" && (
        <>
          {ffView === "org" && <OrgView branches={FORWARDER.branches} onBranch={b => { setBranch(b); setFfView("branch"); }} />}
          {ffView === "branch" && branch && <BranchView branch={branch} onBack={() => { setFfView("org"); setBranch(null); }} onClient={(c, b) => { setClient(c); setClientBranch(b); setFfView("client"); }} />}
          {ffView === "client" && client && clientBranch && <ClientView client={client} branch={clientBranch} onBack={() => { setFfView("branch"); setClient(null); }} />}
        </>
      )}
      {tab === "pipeline" && (
        selectedPO ? <PODetail po={selectedPO} onBack={() => setSelectedPO(null)} /> : <PipelineView onSelectPO={setSelectedPO} />
      )}
      {tab === "veri" && <VeriDashboard />}
    </div>
  );
}

// ── Importer View ──
function ImporterView({ persona }) {
  const [tab, setTab] = useState("dashboard");
  const [selectedPO, setSelectedPO] = useState(null);

  const clientPOs = PO_DATA.filter(p => p.client === "Carrefour Nederland BV");
  const attested = clientPOs.filter(p => p.stage === 6).length;
  const inProgress = clientPOs.filter(p => p.stage > 0 && p.stage < 6).length;

  // Role-based tabs
  const canSeeDash = true;
  const canSeePipeline = ["imp-comp-admin","ff-org-admin","imp-buyer","imp-qa"].includes(persona.id) || persona.id === "imp-logistics";
  const canSeeAttest = true;
  const canSeeUsers = persona.id === "imp-comp-admin";

  const tabs = [
    { id:"dashboard", label:"Dashboard", show:canSeeDash },
    { id:"pipeline", label:"My Shipments", show:canSeePipeline || persona.id === "imp-buyer" },
    { id:"attestations", label:"Attestations", show:canSeeAttest },
    { id:"users", label:"Users & Roles", show:canSeeUsers },
  ].filter(t => t.show);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: T.accent, letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>IMPORTER PORTAL</div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: T.primary, margin: 0 }}>Carrefour Nederland BV</h2>
        <div style={{ fontSize: 14, color: T.secondary, marginTop: 4 }}>Forwarder: Signal International Forwarding · Rotterdam HQ</div>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `2px solid ${C.navyMid}` }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); setSelectedPO(null); }}
            style={{ background: "transparent", border: "none", borderBottom: `2px solid ${tab === t.id ? C.gold : "transparent"}`, color: tab === t.id ? T.primary : T.tertiary, padding: "10px 20px", fontSize: 15, fontWeight: tab === t.id ? 700 : 400, cursor: "pointer", marginBottom: -2 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
            <StatCard label="Active Shipments" value={clientPOs.length} color={T.primary} />
            <StatCard label="Attested" value={attested} color={C.green} sub="compliant" />
            <StatCard label="In Progress" value={inProgress} color={C.gold} sub="being verified" />
            <StatCard label="VeriPura Score" value="94" color={C.green} sub="excellent" />
          </div>
          <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18`, marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 14 }}>ACTIVE CORRIDORS</div>
            {["Brazil → NL (Beef)","Colombia → NL (Coffee)"].map((cor, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: i === 0 ? `1px solid ${C.navy}` : "none" }}>
                <div>
                  <div style={{ fontSize: 14, color: T.primary, fontWeight: 600 }}>{cor}</div>
                  <div style={{ fontSize: 13, color: T.secondary }}>SOP active · Document checklist configured</div>
                </div>
                <Badge text="ACTIVE" color={C.green} small />
              </div>
            ))}
          </div>
          <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18` }}>
            <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>RECENT ACTIVITY</div>
            {[
              { time:"Today 14:32", msg:"PO-2025-0441 — Attestation issued (Brazil → NL Beef)", type:"attest" },
              { time:"Today 12:10", msg:"PO-2025-0443 — Verifying: cross-doc check in progress", type:"verify" },
              { time:"Yesterday", msg:"PO-2025-0443 — Commodity description mismatch flagged", type:"flag" },
            ].map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.navy}` : "none" }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: a.type === "attest" ? C.green : a.type === "flag" ? C.red : C.gold, marginTop: 5, flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: 13, color: T.primary }}>{a.msg}</div>
                  <div style={{ fontSize: 12, color: T.tertiary }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "pipeline" && (
        selectedPO ? <PODetail po={selectedPO} onBack={() => setSelectedPO(null)} /> :
        <div>
          <div style={{ fontSize: 12, color: T.accent, letterSpacing: 3, fontWeight: 700, marginBottom: 14 }}>MY SHIPMENTS</div>
          <div style={{ background: C.navyMid, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.blue}18` }}>
            <div style={{ display: "grid", gridTemplateColumns: "110px 1fr 90px 90px 160px 80px", padding: "10px 14px", borderBottom: `1px solid ${C.navy}`, fontSize: 11, color: T.tertiary, letterSpacing: 1, fontWeight: 700 }}>
              <div>PO ID</div><div>SUPPLIER / PRODUCT</div><div>VALUE</div><div>DOCS</div><div>STAGE</div><div>ETA</div>
            </div>
            {clientPOs.map((po, i) => (
              <div key={po.id} onClick={() => setSelectedPO(po)}
                style={{ display: "grid", gridTemplateColumns: "110px 1fr 90px 90px 160px 80px", padding: "12px 14px", borderBottom: i < clientPOs.length - 1 ? `1px solid ${C.navy}` : "none", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = C.navy + "88"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ fontSize: 12, color: T.accent, fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{po.id}</div>
                <div>
                  <div style={{ fontSize: 13, color: T.primary, fontWeight: 600 }}>{po.supplier}</div>
                  <div style={{ fontSize: 12, color: T.secondary }}>{po.product}</div>
                </div>
                <div style={{ fontSize: 13, color: T.primary, fontWeight: 600 }}>{po.value}</div>
                <div style={{ fontSize: 13, color: po.docs.length >= 5 ? C.green : po.docs.length >= 3 ? C.gold : C.red, fontWeight: 700 }}>{po.docs.length}/6</div>
                <div><StageDots stage={po.stage} /></div>
                <div style={{ fontSize: 12, color: T.tertiary }}>{po.eta}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "attestations" && (
        <div>
          <div style={{ fontSize: 12, color: T.accent, letterSpacing: 3, fontWeight: 700, marginBottom: 14 }}>ATTESTATION RECORDS</div>
          <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18` }}>
            {ATTESTATIONS.filter(a => a.client === "Carrefour Nederland BV").length > 0 ? (
              ATTESTATIONS.filter(a => a.client === "Carrefour Nederland BV").map((a, i) => (
                <div key={i} style={{ padding: "12px 0", borderBottom: `1px solid ${C.navy}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <div style={{ fontSize: 14, color: T.primary, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>{a.id}</div>
                    <Badge text="VALID" color={C.green} small />
                  </div>
                  <div style={{ fontSize: 13, color: T.secondary }}>PO: {a.po} · {a.corridor}</div>
                  <div style={{ fontSize: 12, color: T.tertiary }}>{a.date} · Hash: {a.hash}</div>
                </div>
              ))
            ) : (
              <div style={{ padding: "30px 0", textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 14, color: T.tertiary }}>Attestation for PO-2025-0441 issued. View in blockchain explorer.</div>
              </div>
            )}
            <div style={{ padding: "12px 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                <div style={{ fontSize: 14, color: T.primary, fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>ATT-2025-0108</div>
                <Badge text="VALID" color={C.green} small />
              </div>
              <div style={{ fontSize: 13, color: T.secondary }}>PO: PO-2025-0441 · Brazil → NL (Beef)</div>
              <div style={{ fontSize: 12, color: T.tertiary }}>2025-03-20 · Hash: 0xB3E7C5D2...9A1B6F4C</div>
            </div>
          </div>
        </div>
      )}

      {tab === "users" && (
        <RolePanel title="IMPORTER USERS & ROLES" roles={IMP_ROLES} users={FORWARDER.branches[0].clients[0].users} entityType="importer" />
      )}
    </div>
  );
}

// ── Admin View ──
function AdminView() {
  const [tab, setTab] = useState("dashboard");
  const [wizardStep, setWizardStep] = useState(0);
  const [wizardDone, setWizardDone] = useState(false);

  const WIZARD_STEPS = ["Organisation Details","Branch Setup","Client Onboarding","Corridor Config","Go Live"];

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12, color: T.accent, letterSpacing: 3, fontWeight: 700, marginBottom: 4 }}>VERIPURA ADMIN</div>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: 26, color: T.primary, margin: 0 }}>Platform Dashboard</h2>
        <div style={{ fontSize: 14, color: T.secondary, marginTop: 4 }}>Full platform visibility · All organisations · System configuration</div>
      </div>

      <div style={{ display: "flex", gap: 0, marginBottom: 24, borderBottom: `2px solid ${C.navyMid}` }}>
        {[
          { id:"dashboard", label:"Overview" },
          { id:"orgs", label:"Organisations" },
          { id:"onboarding", label:"Onboarding Wizard" },
          { id:"activity", label:"Activity Feed" },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ background: "transparent", border: "none", borderBottom: `2px solid ${tab === t.id ? C.gold : "transparent"}`, color: tab === t.id ? T.primary : T.tertiary, padding: "10px 20px", fontSize: 15, fontWeight: tab === t.id ? 700 : 400, cursor: "pointer", marginBottom: -2 }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "dashboard" && (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
            {ADMIN_STATS.map(s => <StatCard key={s.label} label={s.label} value={s.value} sub={s.sub} />)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18` }}>
              <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 14 }}>PLATFORM HEALTH</div>
              {[
                { label:"API Uptime", value:"99.98%", color:C.green },
                { label:"Avg Response Time", value:"142ms", color:C.green },
                { label:"Pending Verifications", value:"34", color:C.gold },
                { label:"Compliance Flags (Open)", value:"7", color:C.red },
                { label:"Trials Expiring (7d)", value:"3", color:C.gold },
              ].map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 4 ? `1px solid ${C.navy}` : "none" }}>
                  <span style={{ fontSize: 14, color: T.secondary }}>{m.label}</span>
                  <span style={{ fontSize: 14, fontWeight: 700, color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
            <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18` }}>
              <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 14 }}>RECENT ACTIVITY</div>
              {ADMIN_ACTIVITY.slice(0, 5).map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: i < 4 ? `1px solid ${C.navy}` : "none" }}>
                  <span style={{ fontSize: 11, color: T.tertiary, flexShrink: 0, marginTop: 2, fontFamily: "'DM Mono', monospace" }}>{a.time}</span>
                  <span style={{ fontSize: 13, color: T.secondary, lineHeight: 1.4 }}>{a.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === "orgs" && (
        <div>
          <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 14 }}>ORGANISATION DIRECTORY</div>
          <div style={{ background: C.navyMid, borderRadius: 8, overflow: "hidden", border: `1px solid ${C.blue}18` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 70px 70px 80px 90px 90px", padding: "10px 14px", borderBottom: `1px solid ${C.navy}`, fontSize: 11, color: T.tertiary, letterSpacing: 1, fontWeight: 700 }}>
              <div>ORGANISATION</div><div>COUNTRY</div><div>BRANCHES</div><div>CLIENTS</div><div>SHIPMENTS</div><div>PLAN</div><div>STATUS</div>
            </div>
            {ADMIN_ORGS.map((o, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 110px 70px 70px 80px 90px 90px", padding: "12px 14px", borderBottom: i < ADMIN_ORGS.length - 1 ? `1px solid ${C.navy}` : "none", cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.background = C.navy + "88"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{ fontSize: 14, color: T.primary, fontWeight: 600 }}>{o.name}</div>
                <div style={{ fontSize: 13, color: T.secondary }}>{o.country}</div>
                <div style={{ fontSize: 13, color: T.primary, textAlign: "center" }}>{o.branches}</div>
                <div style={{ fontSize: 13, color: T.primary, textAlign: "center" }}>{o.clients}</div>
                <div style={{ fontSize: 13, color: T.primary, textAlign: "center" }}>{o.shipments.toLocaleString()}</div>
                <Badge text={o.plan.toUpperCase()} color={o.plan === "Enterprise" ? C.gold : o.plan === "Pro" ? C.blueLt : T.tertiary} small />
                <Badge text={o.status.toUpperCase()} color={o.status === "active" ? C.green : o.status === "trial" ? C.gold : T.tertiary} small />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "onboarding" && (
        <div>
          <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 14 }}>ONBOARDING WIZARD — Atlas Forwarding GmbH</div>
          {/* Step progress */}
          <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, marginBottom: 20, border: `1px solid ${C.blue}18` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 20 }}>
              {WIZARD_STEPS.map((s, i) => {
                const done = i < wizardStep;
                const current = i === wizardStep;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                    <div style={{ width: "100%", height: 2, background: done ? C.green : C.navyMid, position: "absolute", top: 10, left: i === 0 ? "50%" : 0, right: i === WIZARD_STEPS.length - 1 ? "50%" : 0 }} />
                    <div onClick={() => !wizardDone && setWizardStep(i)} style={{ width: 22, height: 22, borderRadius: "50%", background: done ? C.green : current ? C.gold : C.navyMid, border: `2px solid ${done ? C.green : current ? C.gold : C.blue + "44"}`, zIndex: 1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {done && <span style={{ fontSize: 10, color: C.navy }}>✓</span>}
                    </div>
                    <div style={{ fontSize: 10, color: done ? T.secondary : current ? T.accent : T.tertiary, marginTop: 6, textAlign: "center", fontWeight: current ? 700 : 400 }}>{s}</div>
                  </div>
                );
              })}
            </div>

            {!wizardDone && (
              <div style={{ padding: "16px 0" }}>
                <div style={{ fontSize: 18, color: T.primary, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 8 }}>{WIZARD_STEPS[wizardStep]}</div>
                {wizardStep === 0 && <div style={{ fontSize: 14, color: T.secondary, lineHeight: 1.7 }}>Enter the legal name, HQ address, VAT number, and primary contact for the forwarder. This information will appear on all attestation documents.</div>}
                {wizardStep === 1 && <div style={{ fontSize: 14, color: T.secondary, lineHeight: 1.7 }}>Configure branch offices: location, port code, staff count, and assigned compliance operators. Branches can be cloned from the HQ template.</div>}
                {wizardStep === 2 && <div style={{ fontSize: 14, color: T.secondary, lineHeight: 1.7 }}>Add importer clients: set Managed or Self-Service mode, assign corridors, and configure document requirements per client.</div>}
                {wizardStep === 3 && <div style={{ fontSize: 14, color: T.secondary, lineHeight: 1.7 }}>Review AI-suggested document checklists for each corridor. Customise regulatory requirements per origin-destination pair.</div>}
                {wizardStep === 4 && <div style={{ fontSize: 14, color: T.secondary, lineHeight: 1.7 }}>Final review. Send welcome emails to all configured users and activate the organisation on the VeriPura platform.</div>}
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  {wizardStep > 0 && <button onClick={() => setWizardStep(s => s - 1)} style={{ background: C.navyMid, color: T.secondary, border: `1px solid ${C.blue}22`, borderRadius: 6, padding: "10px 20px", fontSize: 14, cursor: "pointer" }}>← Back</button>}
                  <button onClick={() => { if (wizardStep < WIZARD_STEPS.length - 1) setWizardStep(s => s + 1); else setWizardDone(true); }}
                    style={{ background: C.gold, color: C.navy, border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                    {wizardStep === WIZARD_STEPS.length - 1 ? "Activate Organisation" : "Next Step →"}
                  </button>
                </div>
              </div>
            )}
            {wizardDone && (
              <div style={{ padding: "20px 0", textAlign: "center" }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>✓</div>
                <div style={{ fontSize: 20, color: C.green, fontWeight: 700, fontFamily: "Georgia, serif", marginBottom: 6 }}>Organisation Activated</div>
                <div style={{ fontSize: 14, color: T.secondary }}>Atlas Forwarding GmbH is now live on VeriPura. Welcome emails sent to 3 users.</div>
                <button onClick={() => { setWizardStep(0); setWizardDone(false); }} style={{ marginTop: 16, background: C.navyMid, color: T.secondary, border: `1px solid ${C.blue}22`, borderRadius: 6, padding: "8px 18px", fontSize: 13, cursor: "pointer" }}>Reset Demo</button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div>
          <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 14 }}>PLATFORM ACTIVITY FEED</div>
          <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18` }}>
            {ADMIN_ACTIVITY.map((a, i) => {
              const col = a.type === "attest" ? C.green : a.type === "flag" ? C.red : a.type === "billing" ? C.gold : C.blueLt;
              return (
                <div key={i} style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: i < ADMIN_ACTIVITY.length - 1 ? `1px solid ${C.navy}` : "none" }}>
                  <div style={{ width: 10, height: 10, borderRadius: "50%", background: col, marginTop: 4, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, color: T.primary, lineHeight: 1.5 }}>{a.msg}</div>
                    <div style={{ fontSize: 12, color: T.tertiary, marginTop: 2 }}>Today · {a.time}</div>
                  </div>
                  <Badge text={a.type.toUpperCase()} color={col} small />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main App ──
export default function App() {
  const [topView, setTopView] = useState("admin");
  const [persona, setPersona] = useState(PERSONAS[0]);
  const [showPersonaPicker, setShowPersonaPicker] = useState(false);

  // Sync topView when persona changes
  function switchPersona(p) {
    setPersona(p);
    setTopView(p.topView);
    setShowPersonaPicker(false);
  }

  const TOP_VIEWS = [
    { id:"admin", label:"VeriPura Admin" },
    { id:"forwarder", label:"Forwarder View" },
    { id:"importer", label:"Importer View" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.ink, fontFamily: "'DM Sans', sans-serif", color: T.primary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Georgia&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.ink}; }
        ::-webkit-scrollbar-thumb { background: ${C.navyMid}; border-radius: 3px; }
        input:focus { outline: 1px solid ${C.gold}; }
        @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.6; transform:scale(1.3); } }
      `}</style>

      {/* Nav */}
      <nav style={{ background: C.navy, borderBottom: `2px solid ${C.gold}`, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100, height: 56 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: "Georgia, serif", fontSize: 22, fontWeight: 700, color: T.primary }}>
            Veri<span style={{ color: C.gold }}>Pura</span>
          </div>
          <div style={{ height: 20, width: 1, background: C.navyMid }} />
          {/* Top-level view selector */}
          <div style={{ display: "flex", gap: 2 }}>
            {TOP_VIEWS.map(v => (
              <button key={v.id} onClick={() => setTopView(v.id)}
                style={{ background: topView === v.id ? `${C.gold}15` : "transparent", border: `1px solid ${topView === v.id ? C.gold + "60" : "transparent"}`, borderRadius: 5, padding: "5px 14px", fontSize: 13, color: topView === v.id ? T.accent : T.tertiary, cursor: "pointer", fontWeight: topView === v.id ? 700 : 400 }}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Persona switcher */}
        <div style={{ position: "relative" }}>
          <button onClick={() => setShowPersonaPicker(!showPersonaPicker)}
            style={{ display: "flex", alignItems: "center", gap: 8, background: showPersonaPicker ? `${C.gold}15` : "transparent", border: `1px solid ${showPersonaPicker ? C.gold + "60" : C.blue + "33"}`, borderRadius: 6, padding: "6px 14px", cursor: "pointer" }}>
            <div style={{ width: 26, height: 26, borderRadius: "50%", background: C.navyMid, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: persona.color }}>
              {persona.label.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 13, color: T.primary, fontWeight: 600 }}>{persona.label}</div>
              <div style={{ fontSize: 11, color: T.tertiary }}>{persona.role}</div>
            </div>
            <span style={{ fontSize: 10, color: T.tertiary }}>{showPersonaPicker ? "▲" : "▼"}</span>
          </button>
          {showPersonaPicker && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, background: C.navy, border: `1px solid ${C.blue}33`, borderRadius: 8, padding: 8, width: 300, zIndex: 200, boxShadow: "0 8px 24px #00000066" }}>
              <div style={{ fontSize: 11, color: T.tertiary, fontWeight: 700, letterSpacing: 1, padding: "4px 8px 8px" }}>SWITCH PERSONA</div>
              {PERSONAS.map(p => (
                <div key={p.id} onClick={() => switchPersona(p)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", borderRadius: 5, cursor: "pointer", background: persona.id === p.id ? `${C.gold}12` : "transparent", transition: "background 0.15s" }}
                  onMouseEnter={e => { if (persona.id !== p.id) e.currentTarget.style.background = C.navyMid; }}
                  onMouseLeave={e => { if (persona.id !== p.id) e.currentTarget.style.background = "transparent"; }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: C.navyMid, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: p.color, flexShrink: 0 }}>
                    {p.label.split(" ").map(w => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: T.primary, fontWeight: 600 }}>{p.label}</div>
                    <div style={{ fontSize: 11, color: T.tertiary }}>{p.org} · {p.role}</div>
                  </div>
                  {persona.id === p.id && <span style={{ marginLeft: "auto", fontSize: 12, color: C.gold }}>✓</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </nav>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        {topView === "admin" && <AdminView />}
        {topView === "forwarder" && <ForwarderView persona={persona} />}
        {topView === "importer" && <ImporterView persona={persona} />}
      </div>
    </div>
  );
}
