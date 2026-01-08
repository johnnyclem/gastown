const { useEffect, useMemo, useState } = React;

const TILE_WIDTH = 72;
const TILE_HEIGHT = 36;
const ORIGIN = { x: 360, y: 160 };

const ZONES = {
  cityHall: { x: 0, y: 0 },
  mergeQueue: { x: 5, y: 4 },
  houses: [
    { x: -4, y: 1 },
    { x: -3, y: 3 },
    { x: -1, y: 4 },
    { x: 2, y: 3 },
    { x: 3, y: 1 },
  ],
};

const STATUS_TARGETS = {
  IDLE: "houses",
  WORKING: "cityHall",
  MERGING: "mergeQueue",
  REVIEWING: "cityHall",
  UNKNOWN: "houses",
};

function isoToScreen(x, y) {
  return {
    x: (x - y) * (TILE_WIDTH / 2),
    y: (x + y) * (TILE_HEIGHT / 2),
  };
}

function useTownSnapshot() {
  const [snapshot, setSnapshot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadSnapshot() {
      try {
        const response = await fetch("/api/town/snapshot");
        if (!response.ok) {
          throw new Error(`Snapshot error: ${response.status}`);
        }
        const data = await response.json();
        if (mounted) {
          setSnapshot(data);
          setLoading(false);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || "Failed to load snapshot");
          setLoading(false);
        }
      }
    }

    loadSnapshot();
    const timer = setInterval(loadSnapshot, 1000);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, []);

  return { snapshot, loading, error };
}

function TownMap({ snapshot }) {
  const h = React.createElement;
  const agents = snapshot?.agents || [];

  const housePositions = useMemo(
    () => ZONES.houses.map((house) => isoToScreen(house.x, house.y)),
    []
  );

  function zoneStyle(zone) {
    const point = isoToScreen(zone.x, zone.y);
    return {
      left: `${ORIGIN.x + point.x}px`,
      top: `${ORIGIN.y + point.y}px`,
    };
  }

  function agentStyle(agent, index) {
    const targetKey = STATUS_TARGETS[agent.status] || "houses";
    if (targetKey === "houses") {
      const house = housePositions[index % housePositions.length];
      return {
        left: `${ORIGIN.x + house.x + 14}px`,
        top: `${ORIGIN.y + house.y + 14}px`,
      };
    }
    const target = ZONES[targetKey];
    const point = isoToScreen(target.x, target.y);
    return {
      left: `${ORIGIN.x + point.x + 20}px`,
      top: `${ORIGIN.y + point.y + 20}px`,
    };
  }

  return h(
    "div",
    { className: "town-map" },
    [
      h("div", { className: "zone city-hall", style: zoneStyle(ZONES.cityHall) }, "City Hall"),
      ZONES.houses.map((house, index) =>
        h("div", {
          key: `house-${index}`,
          className: "zone house",
          style: zoneStyle(house),
          title: `House ${index + 1}`,
        })
      ),
      h(
        "div",
        { className: "zone merge-queue", style: zoneStyle(ZONES.mergeQueue) },
        "Merge Queue"
      ),
      agents.map((agent, index) =>
        h(
          "div",
          {
            key: `${agent.name}-${index}`,
            className: "agent",
            style: agentStyle(agent, index),
            title: `${agent.name} • ${agent.status}`,
          },
          agent.name?.slice(0, 2).toUpperCase()
        )
      ),
    ]
  );
}

function App() {
  const h = React.createElement;
  const { snapshot, loading, error } = useTownSnapshot();

  return h(
    "div",
    { className: "app-shell" },
    [
      h("header", { className: "app-header" }, [
        h("h1", null, "Gas Town"),
        h("p", null, "Live town snapshot"),
      ]),
      h("main", null, [
        loading && h("div", { className: "loading" }, "Loading town snapshot..."),
        error && h("div", { className: "error" }, error),
        !loading && !error && h(TownMap, { snapshot }),
      ]),
    ]
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(React.createElement(App));
