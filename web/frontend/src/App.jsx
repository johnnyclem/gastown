import TownMap from "./components/TownMap.jsx";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Gas Town Snapshot</h1>
        <p>Live positions from /api/town/snapshot</p>
      </header>
      <TownMap />
    </div>
  );
}

export default App;
