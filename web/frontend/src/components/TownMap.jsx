import { useEffect, useMemo, useState } from "react";
import layoutData from "../config/town_layout.json";
import Character from "./Character.jsx";
import Zone from "./Zone.jsx";
import mayorsOfficeSprite from "../assets/mayors-office.svg";
import houseSprite from "../assets/house.svg";
import reviewStationSprite from "../assets/review-station.svg";
import mergeQueueSprite from "../assets/merge-queue.svg";

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
    sprite: mayorsOfficeSprite,
    emoji: "🏛️"
  },
  approval_office: {
    sprite: reviewStationSprite,
    emoji: "📋"
  },
  merge_depot: {
    sprite: mergeQueueSprite,
    emoji: "🚌"
  },
  residential_district: {
    sprite: houseSprite,
    emoji: "🏡"
  },
  commercial_district: {
    sprite: null,
    emoji: "🏢"
  }
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
      <div className="grid" style={gridStyle}>
        {zones.map((zone) => {
          const asset = zoneSprites[zone.key] ?? {};
          const position = toIso(zone.x, zone.y, origin);
          const zIndex = zone.x + zone.y;
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
          const zIndex = adjustedCoords.x + adjustedCoords.y + 1;

          return (
            <Character
              key={agent.name}
              name={agent.name}
              title={`${agent.name} (${agent.status})`}
              position={isoPosition}
              zIndex={zIndex}
            />
          );
        })}
      </div>
    </div>
  );
}
