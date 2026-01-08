import { useEffect, useMemo, useState } from "react";
import layoutData from "../config/town_layout.json";
import Character from "./Character.jsx";
import Zone from "./Zone.jsx";

// Building Assets
import cityHallImg from "../assets/building_city_hall.png";
import houseImg from "../assets/building_house_small.png";
import officeImg from "../assets/building_office_large.png";
import reviewStationImg from "../assets/building_review_station.png";
import depotImg from "../assets/building_depot.png";

// Character Assets
import charMayor from "../assets/char_mayor.png";
import charEngineer from "../assets/char_engineer.png";
import charPolecat from "../assets/char_polecat.png";

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;

const statusToZone = {
  IDLE: "residential_district",
  REVIEWING: "approval_office",
  MERGING: "merge_depot",
  WORKING: "commercial_district"
};

const zoneSprites = {
  city_hall: {
    sprite: cityHallImg,
    emoji: "🏛️"
  },
  approval_office: {
    sprite: reviewStationImg,
    emoji: "📋"
  },
  merge_depot: {
    sprite: depotImg,
    emoji: "🚌"
  },
  residential_district: {
    sprite: houseImg,
    emoji: "🏡"
  },
  commercial_district: {
    sprite: officeImg,
    emoji: "🏢"
  }
};

const roleSprites = {
  mayor: charMayor,
  engineer: charEngineer,
  polecat: charPolecat
};

function toIso(gridX, gridY, origin) {
  const screenX = ((gridX - gridY) * TILE_WIDTH) / 2;
  const screenY = ((gridX + gridY) * TILE_HEIGHT) / 2;

  return {
    left: `${screenX + origin.x}px`,
    top: `${screenY + origin.y}px`
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
  const [isDemoMode, setIsDemoMode] = useState(true);
  const layout = layoutData.layout;

  useEffect(() => {
    console.log("Assets Loaded:", { cityHallImg, houseImg });
  }, []);

  const mockSnapshot = {
    agents: [
      { name: "Mayor Alice", role: "mayor", status: "WORKING" }, // At City Hall (default fallback)
      { name: "Engineer Bob", role: "engineer", status: "IDLE" }, // At House
      { name: "Engineer Charlie", role: "engineer", status: "WORKING" }, // At Office
      { name: "Engineer Dave", role: "engineer", status: "MERGING" }, // In Queue
      { name: "Polecat P1", role: "polecat", status: "ROAMING" }, // Roaming
      { name: "Polecat P2", role: "polecat", status: "ROAMING" }
    ]
  };

  useEffect(() => {
    let isMounted = true;

    const fetchSnapshot = async () => {
      if (isDemoMode) {
        if (isMounted) setSnapshot(mockSnapshot);
        return;
      }

      try {
        const response = await fetch("/api/town/snapshot");
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        if (isMounted) {
          setSnapshot(data);
        }
      } catch (e) {
        console.error("Failed to fetch snapshot", e);
      }
    };

    fetchSnapshot();
    const timer = setInterval(fetchSnapshot, 1000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [isDemoMode]);

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

  const origin = useMemo(
    () => ({
      x: (layout.grid_size * TILE_WIDTH) / 2,
      y: TILE_HEIGHT * 2
    }),
    [layout.grid_size]
  );

  const gridStyle = {
    width: `${layout.grid_size * TILE_WIDTH}px`,
    height: `${layout.grid_size * TILE_HEIGHT}px`
  };

  const residential = layout.zones.residential_district ?? [];
  const mergeQueue = snapshot.agents.filter(
    (agent) => agent.status === "MERGING"
  );
  const mergeQueueIndices = new Map(
    mergeQueue.map((agent, index) => [agent.name, index])
  );

  return (
    <div className="town-map">
      <button
        onClick={() => setIsDemoMode(!isDemoMode)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          padding: "8px 16px",
          background: isDemoMode ? "#2563eb" : "#e5e7eb",
          color: isDemoMode ? "white" : "black",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}
      >
        {isDemoMode ? "Disable Demo" : "Enable Demo"}
      </button>
      <div className="grid" style={gridStyle}>
        {zones.map((zone) => {
          const asset = zoneSprites[zone.key] ?? {};
          const position = toIso(zone.x, zone.y, origin);
          const zIndex = (zone.x + zone.y) * 10;
          return (
            <Zone
              key={zone.id}
              label={zone.label}
              position={position}
              zIndex={zIndex}
              sprite={asset.sprite}
              fallbackEmoji={asset.emoji}
            />
          );
        })}
        {snapshot.agents.map((agent) => {
          const zoneKey = statusToZone[agent.status] ?? "city_hall";
          const zone = layout.zones[zoneKey];
          const position = Array.isArray(zone)
            ? pickResidentialSpot(agent.name, residential)
            : zone;
          const coords = position ?? { x: 0, y: 0 };
          const mergeIndex = mergeQueueIndices.get(agent.name);
          const queueOffset = mergeIndex ? mergeIndex : 0;
          const adjustedCoords =
            agent.status === "MERGING"
              ? {
                  x: coords.x + queueOffset,
                  y: coords.y + queueOffset
                }
              : coords;
          const isoPosition = toIso(adjustedCoords.x, adjustedCoords.y, origin);
          const zIndex = (adjustedCoords.x + adjustedCoords.y) * 10 + 1;
          const sprite = roleSprites[agent.role] ?? roleSprites["engineer"];

          return (
            <Character
              key={agent.name}
              name={agent.name}
              role={agent.role}
              status={agent.status}
              sprite={sprite}
              title={`${agent.name} (${agent.role})`}
              position={isoPosition}
              zIndex={zIndex}
            />
          );
        })}
      </div>
    </div>
  );
}
