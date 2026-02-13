import { useEffect, useState, useRef } from "react";
import { fetchPolecats, fetchPaneOutput } from "../api.js";
import BuildingDialog from "./BuildingDialog.jsx";

export default function HouseDialog({ onClose, agentName }) {
  const [polecats, setPolecats] = useState(null);
  const [selected, setSelected] = useState(null);
  const [paneLines, setPaneLines] = useState([]);
  const [error, setError] = useState(null);
  const termRef = useRef(null);

  // Load polecat list
  useEffect(() => {
    let active = true;
    fetchPolecats()
      .then((data) => {
        if (!active) return;
        const list = data.polecats || [];
        setPolecats(list);
        if (agentName) {
          const match = list.find(
            (p) => p.name === agentName || p.session_id === agentName
          );
          if (match) setSelected(match);
        }
      })
      .catch((e) => active && setError(e.message));
    return () => { active = false; };
  }, [agentName]);

  // Poll pane output for selected polecat
  useEffect(() => {
    if (!selected) return;
    let active = true;
    const load = () =>
      fetchPaneOutput(selected.session_id)
        .then((data) => active && setPaneLines(data.lines || []))
        .catch(() => {});
    load();
    const timer = setInterval(load, 3000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [selected]);

  // Auto-scroll terminal
  useEffect(() => {
    if (termRef.current) {
      termRef.current.scrollTop = termRef.current.scrollHeight;
    }
  }, [paneLines]);

  const handleBack = () => {
    setSelected(null);
    setPaneLines([]);
  };

  const activityColor = (info) => {
    if (!info) return "#6b7280";
    switch (info.color_class) {
      case "green": return "#22c55e";
      case "yellow": return "#eab308";
      case "red": return "#ef4444";
      default: return "#6b7280";
    }
  };

  const content = () => {
    if (error) return <p style={{ color: "#ef4444" }}>Error: {error}</p>;
    if (!polecats) return <p>Loading workers...</p>;

    if (selected) {
      return (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <button
              onClick={handleBack}
              style={{
                background: "none",
                border: "1px solid #555",
                color: "#ccc",
                cursor: "pointer",
                padding: "2px 8px",
                borderRadius: "4px",
                fontSize: "0.8em",
              }}
            >
              Back
            </button>
            <span style={{ color: "#93c5fd", fontSize: "0.85em" }}>
              {selected.name} ({selected.rig})
            </span>
          </div>
          <div
            ref={termRef}
            style={{
              background: "#0d1117",
              color: "#c9d1d9",
              fontFamily: "monospace",
              fontSize: "0.7em",
              lineHeight: "1.3",
              padding: "6px",
              borderRadius: "4px",
              maxHeight: "150px",
              overflow: "auto",
              whiteSpace: "pre",
            }}
          >
            {paneLines.length > 0
              ? paneLines.join("\n")
              : "No output captured."}
          </div>
        </div>
      );
    }

    if (polecats.length === 0) return <p>No workers running.</p>;

    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {polecats.map((p) => (
          <li
            key={p.session_id}
            onClick={() => setSelected(p)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 0",
              borderBottom: "1px dashed #555",
              cursor: "pointer",
            }}
          >
            <span>
              <span style={{ color: "#93c5fd" }}>{p.name}</span>{" "}
              <span style={{ color: "#a1a1aa", fontSize: "0.8em" }}>
                [{p.rig}]
              </span>
            </span>
            <span
              style={{
                color: activityColor(p.last_activity),
                fontSize: "0.8em",
              }}
            >
              {p.last_activity?.formatted_age || "?"}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <BuildingDialog
      title={selected ? `Worker: ${selected.name}` : "Workers"}
      onClose={onClose}
    >
      {content()}
    </BuildingDialog>
  );
}
