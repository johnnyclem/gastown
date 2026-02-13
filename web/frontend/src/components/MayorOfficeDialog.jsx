import { useEffect, useState } from "react";
import { fetchMailInbox, fetchOptions, runCommand } from "../api.js";
import BuildingDialog from "./BuildingDialog.jsx";

const TABS = ["Overview", "Mail", "Admin"];

const quickCommands = [
  { label: "Status", cmd: "status" },
  { label: "Convoys", cmd: "convoy list" },
  { label: "Mail", cmd: "mail inbox" },
  { label: "Rigs", cmd: "rig list" },
  { label: "Doctor", cmd: "doctor" },
];

export default function MayorOfficeDialog({ onClose, snapshot }) {
  const [tab, setTab] = useState("Overview");
  const [options, setOptions] = useState(null);
  const [mail, setMail] = useState(null);
  const [cmdInput, setCmdInput] = useState("");
  const [cmdOutput, setCmdOutput] = useState(null);
  const [cmdRunning, setCmdRunning] = useState(false);

  useEffect(() => {
    fetchOptions().then(setOptions).catch(() => {});
    fetchMailInbox().then(setMail).catch(() => {});
  }, []);

  const handleRunCommand = async (cmd) => {
    const command = cmd || cmdInput;
    if (!command.trim()) return;
    setCmdRunning(true);
    setCmdOutput(null);
    try {
      const result = await runCommand(command);
      setCmdOutput(result);
    } catch (e) {
      setCmdOutput({ success: false, error: e.message });
    }
    setCmdRunning(false);
  };

  const statItem = (label, value) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "2px 0",
        borderBottom: "1px dashed #444",
      }}
    >
      <span style={{ color: "#a1a1aa" }}>{label}</span>
      <span style={{ color: "#93c5fd" }}>{value ?? "—"}</span>
    </div>
  );

  const renderOverview = () => (
    <div>
      {statItem("Agents", snapshot?.agents?.length ?? options?.agents?.length ?? "—")}
      {statItem("Rigs", options?.rigs?.length ?? "—")}
      {statItem("Convoys", options?.convoys?.length ?? "—")}
      {statItem("Polecats", options?.polecats?.length ?? "—")}
      {statItem("Unread Mail", mail?.unread_count ?? "—")}
    </div>
  );

  const renderMail = () => {
    if (!mail) return <p>Loading mail...</p>;
    if (!mail.messages || mail.messages.length === 0)
      return <p>No messages.</p>;

    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {mail.messages.map((m, i) => (
          <li
            key={m.id || i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "3px 0",
              borderBottom: "1px dashed #444",
            }}
          >
            <span style={{ flex: 1 }}>
              {!m.read && (
                <span style={{ color: "#eab308", marginRight: "4px" }}>
                  ●
                </span>
              )}
              {m.subject}
            </span>
            <span style={{ color: "#a1a1aa", fontSize: "0.8em", marginLeft: "8px" }}>
              {m.from}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  const renderAdmin = () => (
    <div>
      <div style={{ display: "flex", gap: "4px", marginBottom: "6px", flexWrap: "wrap" }}>
        {quickCommands.map((qc) => (
          <button
            key={qc.cmd}
            onClick={() => {
              setCmdInput(qc.cmd);
              handleRunCommand(qc.cmd);
            }}
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              color: "#93c5fd",
              cursor: "pointer",
              padding: "2px 8px",
              borderRadius: "4px",
              fontSize: "0.75em",
            }}
          >
            {qc.label}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", gap: "4px", marginBottom: "6px" }}>
        <input
          type="text"
          value={cmdInput}
          onChange={(e) => setCmdInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleRunCommand()}
          placeholder="gt command..."
          style={{
            flex: 1,
            background: "#0d1117",
            border: "1px solid #334155",
            color: "#c9d1d9",
            padding: "4px 6px",
            borderRadius: "4px",
            fontFamily: "monospace",
            fontSize: "0.8em",
          }}
        />
        <button
          onClick={() => handleRunCommand()}
          disabled={cmdRunning}
          style={{
            background: "#1e40af",
            border: "none",
            color: "#fff",
            cursor: cmdRunning ? "wait" : "pointer",
            padding: "4px 12px",
            borderRadius: "4px",
            fontSize: "0.8em",
          }}
        >
          {cmdRunning ? "..." : "Run"}
        </button>
      </div>
      {cmdOutput && (
        <div
          style={{
            background: "#0d1117",
            color: cmdOutput.success ? "#c9d1d9" : "#ef4444",
            fontFamily: "monospace",
            fontSize: "0.7em",
            lineHeight: "1.3",
            padding: "6px",
            borderRadius: "4px",
            maxHeight: "120px",
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          {cmdOutput.output || cmdOutput.error || "No output"}
        </div>
      )}
    </div>
  );

  return (
    <BuildingDialog title="Mayor's Office" onClose={onClose}>
      <div
        style={{
          display: "flex",
          gap: "2px",
          marginBottom: "8px",
          borderBottom: "1px solid #444",
          paddingBottom: "4px",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? "#1e40af" : "transparent",
              border: "none",
              color: tab === t ? "#fff" : "#93c5fd",
              cursor: "pointer",
              padding: "3px 10px",
              borderRadius: "4px 4px 0 0",
              fontSize: "0.8em",
              fontWeight: tab === t ? "bold" : "normal",
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {tab === "Overview" && renderOverview()}
      {tab === "Mail" && renderMail()}
      {tab === "Admin" && renderAdmin()}
    </BuildingDialog>
  );
}
