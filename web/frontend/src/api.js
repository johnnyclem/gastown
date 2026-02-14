const API_BASE = "";

class ApiError extends Error {
  constructor(message, { status, isNetwork } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isNetwork = isNetwork ?? false;
  }
}

async function fetchJSON(url, opts = {}) {
  let resp;
  try {
    resp = await fetch(url, opts);
  } catch (e) {
    throw new ApiError(
      "Cannot reach backend — is the Go server running on :8080?",
      { isNetwork: true }
    );
  }
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new ApiError(
      text || `HTTP ${resp.status}`,
      { status: resp.status }
    );
  }
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
  return fetchJSON(`${API_BASE}/api/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command }),
  });
}
