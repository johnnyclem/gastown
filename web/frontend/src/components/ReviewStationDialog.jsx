import { useEffect, useState } from "react";
import { fetchMergeQueue } from "../api.js";
import BuildingDialog from "./BuildingDialog.jsx";

const statusBadge = (label, color) => (
  <span
    style={{
      display: "inline-block",
      padding: "1px 6px",
      borderRadius: "4px",
      fontSize: "0.75em",
      fontWeight: "bold",
      background: color,
      color: "#fff",
      marginLeft: "4px",
    }}
  >
    {label}
  </span>
);

const ciColors = { pass: "#22c55e", fail: "#ef4444", pending: "#eab308" };
const mergeColors = { ready: "#22c55e", conflict: "#ef4444", pending: "#eab308" };

export default function ReviewStationDialog({ onClose }) {
  const [queue, setQueue] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    const load = () =>
      fetchMergeQueue()
        .then((data) => active && setQueue(data))
        .catch((e) => active && setError(e.message));
    load();
    const timer = setInterval(load, 10000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, []);

  const content = () => {
    if (error) return <p style={{ color: "#ef4444" }}>Error: {error}</p>;
    if (!queue) return <p>Loading merge queue...</p>;
    if (queue.length === 0) return <p>No open PRs in the queue.</p>;

    return (
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {queue.map((pr) => (
          <li
            key={`${pr.repo}-${pr.number}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "4px 0",
              borderBottom: "1px dashed #555",
            }}
          >
            <span style={{ flex: 1 }}>
              <span style={{ color: "#93c5fd" }}>#{pr.number}</span>{" "}
              <span style={{ color: "#a1a1aa", fontSize: "0.8em" }}>
                [{pr.repo}]
              </span>{" "}
              {pr.title}
            </span>
            <span>
              {statusBadge(`CI: ${pr.ci_status}`, ciColors[pr.ci_status] || "#6b7280")}
              {statusBadge(pr.mergeable, mergeColors[pr.mergeable] || "#6b7280")}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <BuildingDialog title="Review Station - Merge Queue" onClose={onClose}>
      {content()}
    </BuildingDialog>
  );
}
