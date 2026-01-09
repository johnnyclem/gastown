import { useEffect, useMemo, useState, useRef } from "react";
import layoutData from "../config/town_layout.json";
import Character from "./Character.jsx";
import Courier from "./Courier.jsx";
import TrafficLayer from "./TrafficLayer.jsx";
import Zone from "./Zone.jsx";
import Minimap from "./Minimap.jsx";

const ASSET_BASE = "/assets";
const buildingSprites = {
  cityHall: `${ASSET_BASE}/building_city_hall.png`,
  house: `${ASSET_BASE}/building_house_small.png`,
  office: `${ASSET_BASE}/building_office_large.png`,
  reviewStation: `${ASSET_BASE}/building_review_station.png`,
  depot: `${ASSET_BASE}/building_depot.png`
};
const characterSprites = {
  mayor: `${ASSET_BASE}/char_mayor.png`,
  engineer: `${ASSET_BASE}/char_engineer.png`,
  polecat: `${ASSET_BASE}/char_polecat.png`
};

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
    sprite: buildingSprites.cityHall,
    emoji: "🏛️",
    cols: 4,
    rows: 4
  },
  approval_office: {
    sprite: buildingSprites.reviewStation,
    emoji: "📋",
    cols: 4,
    rows: 4
  },
  merge_depot: {
    sprite: buildingSprites.depot,
    emoji: "🚌",
    cols: 4,
    rows: 4
  },
  residential_district: {
    sprite: buildingSprites.house,
    emoji: "🏡",
    cols: 4,
    rows: 4
  },
  commercial_district: {
    sprite: buildingSprites.office,
    emoji: "🏢",
    cols: 4,
    rows: 4
  }
};

const roleSprites = {
  mayor: characterSprites.mayor,
  engineer: characterSprites.engineer,
  polecat: characterSprites.polecat
};

const characterConfig = {
  cols: 2,
  rows: 2
};

function toIso(gridX, gridY, origin) {
  const screenX = ((gridX - gridY) * TILE_WIDTH) / 2;
  const screenY = ((gridX + gridY) * TILE_HEIGHT) / 2;

  return {
    left: `${screenX + origin.x}px`,
    top: `${screenY + origin.y}px`,
    x: screenX + origin.x,
    y: screenY + origin.y
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
  
  // Viewport State
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  const viewportRef = useRef(null);

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

  const gridWidth = layout.grid_size * TILE_WIDTH;
  const gridHeight = layout.grid_size * TILE_HEIGHT;

  const gridStyle = {
    width: `${gridWidth}px`,
    height: `${gridHeight}px`
  };

  const residential = layout.zones.residential_district ?? [];
  const mergeQueue = snapshot.agents.filter(
    (agent) => agent.status === "MERGING"
  );
  const mergeQueueIndices = new Map(
    mergeQueue.map((agent, index) => [agent.name, index])
  );

  // Compute agent positions once for both Map and Minimap
  const agentPositions = useMemo(() => {
    return snapshot.agents.map((agent) => {
      const zoneKey = statusToZone[agent.status] ?? "city_hall";
      const zone = layout.zones[zoneKey];
      const position = Array.isArray(zone)
        ? pickResidentialSpot(agent.name, residential)
        : zone;
      const homeCoords = pickResidentialSpot(agent.name, residential);
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
      const homeIsoPosition = toIso(homeCoords.x, homeCoords.y, origin);
      const zIndex = (adjustedCoords.x + adjustedCoords.y) * 10 + 1;
      const sprite = roleSprites[agent.role] ?? roleSprites["engineer"];

      return {
        ...agent,
        gridX: adjustedCoords.x,
        gridY: adjustedCoords.y,
        homeCoords,
        homeIsoPosition,
        isoPosition,
        zIndex,
        sprite
      };
    });
  }, [snapshot.agents, layout, residential, mergeQueueIndices, origin]);

  const mayorOfficeIso = useMemo(() => {
    const mayorOffice = layout.zones.city_hall ?? { x: 0, y: 0 };
    return toIso(mayorOffice.x, mayorOffice.y, origin);
  }, [layout.zones, origin]);

  const approvalOfficeIso = useMemo(() => {
    const office = layout.zones.approval_office ?? { x: 0, y: 0 };
    return toIso(office.x, office.y, origin);
  }, [layout.zones, origin]);

  const trafficLinks = useMemo(() => {
    return agentPositions
      .filter((agent) => agent.status === "WORKING" && agent.role !== "mayor")
      .map((agent) => ({
        id: agent.name,
        start: { x: mayorOfficeIso.x, y: mayorOfficeIso.y },
        end: { x: agent.homeIsoPosition.x, y: agent.homeIsoPosition.y }
      }));
  }, [agentPositions, mayorOfficeIso]);

  const couriers = useMemo(() => {
    return agentPositions
      .filter((agent) => agent.status === "MERGING")
      .map((agent) => ({
        id: agent.name,
        start: { x: agent.homeIsoPosition.x, y: agent.homeIsoPosition.y },
        end: { x: approvalOfficeIso.x, y: approvalOfficeIso.y },
        zIndex: 2500 + agent.zIndex
      }));
  }, [agentPositions, approvalOfficeIso]);


  // Viewport Handlers
  const handleWheel = (e) => {
    e.preventDefault();
    const newScale = Math.min(Math.max(scale - e.deltaY * 0.001, 0.2), 3);
    setScale(newScale);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    
    // Divide by scale to ensure 1:1 movement match with cursor
    setOffset((prev) => ({ 
      x: prev.x + (dx / scale), 
      y: prev.y + (dy / scale) 
    }));
    
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="town-map">
      <button
        onClick={() => setIsDemoMode(!isDemoMode)}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 5000,
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

      <div className="map-controls" style={{ zIndex: 5000 }}>
         <button className="control-btn" onClick={() => setScale(s => Math.min(s + 0.2, 3))}>+</button>
         <button className="control-btn" onClick={() => setScale(s => Math.max(s - 0.2, 0.2))}>-</button>
         <button className="control-btn" onClick={() => { setScale(1); setOffset({x:0,y:0}); }}>⟲</button>
      </div>

      <Minimap zones={zones} agents={agentPositions} layout={layout} />

      <div 
        className="viewport" 
        ref={viewportRef}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="world"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`
          }}
        >
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
                  cols={asset.cols}
                  rows={asset.rows}
                  fallbackEmoji={asset.emoji}
                />
              );
            })}
            <TrafficLayer
              width={gridWidth}
              height={gridHeight}
              links={trafficLinks}
            />
            {couriers.map((courier) => (
              <Courier
                key={courier.id}
                start={courier.start}
                end={courier.end}
                zIndex={courier.zIndex}
              />
            ))}
            {agentPositions.map((agent) => (
              <Character
                key={agent.name}
                name={agent.name}
                role={agent.role}
                status={agent.status}
                sprite={agent.sprite}
                cols={characterConfig.cols}
                rows={characterConfig.rows}
                title={`${agent.name} (${agent.role})`}
                position={agent.isoPosition}
                zIndex={agent.zIndex + 3000}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
