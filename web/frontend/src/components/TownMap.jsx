import { useEffect, useMemo, useState } from "react";
import layoutData from "../config/town_layout.json";

const TILE_SIZE = 32;

const statusToZone = {
  IDLE: "residential_district",
  REVIEWING: "approval_office",
  MERGING: "merge_depot",
  WORKING: "commercial_district"
};

const zoneColors = {
  city_hall: "#ffcc66",
  approval_office: "#99ccff",
  merge_depot: "#ff9966",
  residential_district: "#99dd99",
  commercial_district: "#c9a0ff"
};

function gridToScreen(x, y) {
  return {
    left: `${x * TILE_SIZE}px`,
    top: `${y * TILE_SIZE}px`
  };
}

function pickResidentialSpot(name, residential) {
  if (!residential.length) {
    return { x: 0, y: 0 };
  }
  const index = Math.abs(hashString(name)) % residential.length;
  return residential[index];
}

function hashString(value) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

export default function TownMap() {
  const [snapshot, setSnapshot] = useState({ agents: [] });
  const layout = layoutData.layout;

  useEffect(() => {
    let isMounted = true;

    const fetchSnapshot = async () => {
      const response = await fetch("/api/town/snapshot");
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      if (isMounted) {
        setSnapshot(data);
      }
    };

    fetchSnapshot();
    const timer = setInterval(fetchSnapshot, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const zones = useMemo(() => {
    const entries = [];
    const { zones } = layout;

    Object.entries(zones).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => {
          entries.push({
            id: item.id,
            key,
            x: item.x,
            y: item.y,
            label: item.id.replace(/_/g, " ")
          });
        });
      } else {
        entries.push({
          id: key,
          key,
          x: value.x,
          y: value.y,
          label: value.label ?? key.replace(/_/g, " ")
        });
      }
    });

    return entries;
  }, [layout]);

  const gridStyle = {
    width: `${layout.grid_size * TILE_SIZE}px`,
    height: `${layout.grid_size * TILE_SIZE}px`
  };

  const residential = layout.zones.residential_district ?? [];

  return (
    <div className="town-map">
      <div className="grid" style={gridStyle}>
        {zones.map((zone) => (
          <div
            key={zone.id}
            className="zone"
            style={{
              ...gridToScreen(zone.x, zone.y),
              backgroundColor: zoneColors[zone.key] ?? "#dddddd"
            }}
          >
            <span>{zone.label}</span>
          </div>
        ))}
        {snapshot.agents.map((agent) => {
          const zoneKey = statusToZone[agent.status] ?? "city_hall";
          const zone = layout.zones[zoneKey];
          const position = Array.isArray(zone)
            ? pickResidentialSpot(agent.name, residential)
            : zone;
          const coords = position ?? { x: 0, y: 0 };
          return (
            <div
              key={agent.name}
              className="agent"
              title={`${agent.name} (${agent.status})`}
              style={gridToScreen(coords.x, coords.y)}
            />
          );
        })}
      </div>
    </div>
  );
}
