import { useState, useEffect } from "react";

// ── Brand + Text Tokens ──
const C = {
  navy: "#0F2444", navyMid: "#1F3864", blue: "#2E5FA3", blueLt: "#4A80C4",
  sky: "#D6E4F0", pale: "#EBF3FA", cream: "#F8F9FB", gold: "#D4A847",
  red: "#C8504A", ink: "#1A2332", muted: "#5A6878", border: "#CBD8E8",
  white: "#FFFFFF", green: "#22c55e",
};
// MANDATORY text tokens — never use C.muted for text on dark backgrounds
const T = { primary: "#FFFFFF", secondary: "#D6E4F0", tertiary: "#9AAFCA", accent: "#D4A847" };

// ── Data ──
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

  if (phase === "connect") {
    return (
      <div style={{ padding: 32, textAlign: "center" }}>
        <div style={{ fontSize: 12, color: T.accent, letterSpacing: 3, fontWeight: 700, marginBottom: 8 }}>STEP 1 OF 3</div>
        <h3 style={{ fontFamily: "Georgia, serif", fontSize: 24, color: T.primary, margin: "0 0 8px" }}>Connect Your TMS</h3>
        <p style={{ color: T.secondary, fontSize: 14, marginBottom: 28, maxWidth: 520, marginInline: "auto", lineHeight: 1.6 }}>
          Import your client list, branch structure, corridors, and SOPs directly from your transport management system.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, maxWidth: 500, marginInline: "auto", marginBottom: 24 }}>
          {[{ name: "CargoWise", icon: "\uD83D\uDD37" }, { name: "Descartes", icon: "\uD83D\uDFE2" }, { name: "CSV Upload", icon: "\uD83D\uDCC4" }].map(t => (
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
  }

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
              <div style={{ fontSize: 13, color: m.conf >= 90 ? C.green : m.conf >= 80 ? T.accent : T.tertiary, fontWeight: 700 }}>{m.conf > 0 ? `${m.conf}%` : "\u2014"}</div>
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

  if (phase === "review") {
    return (
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
            Pre-built configurations for 5 branches, 7 clients, and 12 corridors. Document checklists generated per corridor and regulatory regime. 4 clients set to Managed mode, 3 to Self-Service based on TMS activity flags. All configurable after import.
          </div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => { setImporting(true); setTimeout(() => onComplete(), 1500); }} disabled={importing}
            style={{ background: importing ? C.navyMid : C.gold, color: importing ? T.tertiary : C.navy, border: "none", borderRadius: 6, padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: importing ? "default" : "pointer" }}>
            {importing ? "Importing..." : "Confirm & Import"}
          </button>
        </div>
      </div>
    );
  }
  return null;
}

// ── Role Management Panel ──

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
          <div style={{ fontSize: 13, color: T.tertiary, marginBottom: 10, lineHeight: 1.5 }}>
            {roles.find(r => r.id === newRole)?.desc}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input placeholder="Email address" style={{ flex: 1, background: C.navyMid, border: `1px solid ${C.blue}22`, borderRadius: 4, padding: "8px 12px", color: T.primary, fontSize: 14, fontFamily: "'DM Mono', monospace" }} />
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
            <div style={{ fontSize: 13, color: T.tertiary, fontFamily: "'DM Mono', monospace" }}>{u.email}</div>
          </div>
          <RoleTag roleId={u.role} roles={roles} />
        </div>
      )) : (
        <div style={{ fontSize: 14, color: T.tertiary, fontStyle: "italic", padding: "12px 0" }}>
          {entityType === "importer" ? "Managed mode — no importer users configured. Switch to Self-Service to invite users." : "No users configured for this branch yet."}
        </div>
      )}

      {/* Role reference */}
      <div style={{ marginTop: 14, padding: 12, background: C.navy, borderRadius: 6 }}>
        <div style={{ fontSize: 12, color: T.tertiary, fontWeight: 600, marginBottom: 8 }}>ROLE REFERENCE</div>
        <div style={{ display: "grid", gap: 6 }}>
          {roles.map(r => (
            <div key={r.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.color, marginTop: 5, flexShrink: 0 }} />
              <div>
                <span style={{ fontSize: 13, color: T.secondary, fontWeight: 600 }}>{r.label}: </span>
                <span style={{ fontSize: 13, color: T.tertiary }}>{r.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Views ──

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
          🔄 Import from TMS
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
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: c.score ? (c.score >= 90 ? `${C.green}20` : `${C.gold}20`) : C.navyMid,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: c.score ? (c.score >= 90 ? C.green : C.gold) : T.tertiary, flexShrink: 0 }}>
                  {c.score || "\u2014"}
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
        <StatCard label="VeriPura Score" value={client.score || "\u2014"} color={client.score >= 90 ? C.green : client.score >= 80 ? C.gold : T.tertiary} />
        <StatCard label="Corridors" value={client.corridors.length} />
      </div>

      {/* Access Model */}
      <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18`, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>CLIENT ACCESS MODEL</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { id: "managed", title: "Managed", desc: "You handle compliance on the client\u2019s behalf. Client receives attestation reports. No client login.", icon: "\uD83D\uDEE1\uFE0F" },
            { id: "self-service", title: "Self-Service", desc: "Client gets their own dashboard. They submit documents, view attestations, and manage their users.", icon: "\uD83D\uDDA5\uFE0F" },
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

      {/* Importer Roles — only shown in self-service mode */}
      {mode === "self-service" && (
        <RolePanel title="IMPORTER USER ROLES" roles={IMP_ROLES} users={client.users || []} entityType="importer" />
      )}

      {mode === "managed" && (
        <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18`, marginBottom: 16 }}>
          <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 8 }}>MANAGED MODE</div>
          <div style={{ fontSize: 14, color: T.secondary, lineHeight: 1.6 }}>
            All compliance verification for {client.name} is managed by your team at {branch.name}. The client receives attestation reports by email. No client-side users are configured. Switch to Self-Service above to give the client direct access.
          </div>
        </div>
      )}

      {/* Corridors */}
      <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18`, marginTop: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>ACTIVE CORRIDORS</div>
        {client.corridors.map((cor, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: i < client.corridors.length - 1 ? `1px solid ${C.navy}` : "none" }}>
            <div style={{ fontSize: 14, color: T.primary }}>{cor}</div>
            <Badge text="CONFIGURED" color={C.green} small />
          </div>
        ))}
        <button style={{ marginTop: 10, background: "transparent", border: `1px solid ${C.border}`, color: T.tertiary, borderRadius: 4, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>+ Add Corridor</button>
      </div>

      {/* Document checklist */}
      <div style={{ background: C.navyMid, borderRadius: 8, padding: 20, border: `1px solid ${C.blue}18` }}>
        <div style={{ fontSize: 12, color: T.accent, letterSpacing: 2, fontWeight: 700, marginBottom: 12 }}>DOCUMENT CHECKLIST (PRIMARY CORRIDOR)</div>
        {["Health Certificate", "Phytosanitary Certificate", "Commercial Invoice", "Bill of Lading", "Certificate of Origin", "Packing List"].map((doc, i) => (
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

// ── App ──
export default function App() {
  const [view, setView] = useState("org");
  const [branch, setBranch] = useState(null);
  const [client, setClient] = useState(null);
  const [clientBranch, setClientBranch] = useState(null);

  return (
    <div style={{ minHeight: "100vh", background: C.ink, fontFamily: "'DM Sans', sans-serif", color: T.primary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Playfair+Display:wght@700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${C.ink}; }
        ::-webkit-scrollbar-thumb { background: ${C.navyMid}; border-radius: 3px; }
        input:focus { outline: 1px solid ${C.gold}; }
      `}</style>

      <nav style={{ background: C.navy, borderBottom: `2px solid ${C.gold}`, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: T.primary, padding: "14px 0" }}>
            Veri<span style={{ color: C.gold }}>Pura</span>
          </div>
          <div style={{ height: 20, width: 1, background: C.navyMid }} />
          <span style={{ fontSize: 14, color: T.secondary }}>Forwarder Command Centre</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <span onClick={() => { setView("org"); setBranch(null); setClient(null); }}
            style={{ color: view === "org" ? T.primary : T.tertiary, cursor: "pointer" }}>{FORWARDER.name}</span>
          {branch && <>
            <span style={{ color: T.tertiary }}>/</span>
            <span onClick={() => { setView("branch"); setClient(null); }}
              style={{ color: view === "branch" ? T.primary : T.tertiary, cursor: "pointer" }}>{branch.name}</span>
          </>}
          {client && <>
            <span style={{ color: T.tertiary }}>/</span>
            <span style={{ color: T.primary }}>{client.name}</span>
          </>}
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {view === "org" && <OrgView branches={FORWARDER.branches} onBranch={b => { setBranch(b); setView("branch"); }} />}
        {view === "branch" && branch && <BranchView branch={branch} onBack={() => { setView("org"); setBranch(null); }} onClient={(c, b) => { setClient(c); setClientBranch(b); setView("client"); }} />}
        {view === "client" && client && clientBranch && <ClientView client={client} branch={clientBranch} onBack={() => { setView("branch"); setClient(null); }} />}
      </div>
    </div>
  );
}
