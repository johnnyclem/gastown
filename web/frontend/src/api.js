const API_BASE = "";

async function fetchJSON(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export function fetchMergeQueue() {
  return fetchJSON(`${API_BASE}/api/merge-queue`);
}

export function fetchPolecats() {
  return fetchJSON(`${API_BASE}/api/polecats`);
}

export function fetchPaneOutput(session) {
  return fetchJSON(`${API_BASE}/api/pane-output?session=${encodeURIComponent(session)}`);
}

export function fetchMailInbox() {
  return fetchJSON(`${API_BASE}/api/mail/inbox`);
}

export function fetchOptions() {
  return fetchJSON(`${API_BASE}/api/options`);
}

export function fetchCommands() {
  return fetchJSON(`${API_BASE}/api/commands`);
}

export async function runCommand(command) {
  const resp = await fetch(`${API_BASE}/api/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command }),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}
