import Foundation

enum APIClientError: LocalizedError {
    case invalidBaseURL(String)
    case requestFailed(status: Int, body: String)
    case dashboardAPINotFound(baseURL: String)

    var errorDescription: String? {
        switch self {
        case .invalidBaseURL(let baseURL):
            return "Invalid base URL: \(baseURL)"
        case .requestFailed(let status, let body):
            if body.isEmpty {
                return "Request failed with status \(status)."
            }
            return "Request failed with status \(status): \(body)"
        case .dashboardAPINotFound(let baseURL):
            return "No dashboard API endpoints found at \(baseURL). Start `gt dashboard` and use that exact URL."
        }
    }
}

struct APIClient {
    let settings: ConnectionSettings
    private let session: URLSession = .shared

    private var decoder: JSONDecoder {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return decoder
    }

    func fetchSnapshot() async throws -> DashboardSnapshot {
        do {
            let data = try await send(path: "/api/dashboard/snapshot/v1")
            return try decoder.decode(DashboardSnapshot.self, from: data)
        } catch APIClientError.requestFailed(let status, _) where status == 404 {
            do {
                let data = try await send(path: "/api/town/snapshot")
                let legacy = try decoder.decode(LegacyTownSnapshot.self, from: data)
                return mapLegacySnapshot(legacy)
            } catch APIClientError.requestFailed(let status, _) where status == 404 {
                throw APIClientError.dashboardAPINotFound(baseURL: settings.baseURL)
            }
        }
    }

    func fetchProjection() async throws -> TownProjection? {
        let tenant = normalized(settings.tenantId)
        let path: String
        if let tenant {
            let encodedTenant = tenant.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? tenant
            path = "/api/town/projection/v1?tenant_id=\(encodedTenant)"
        } else {
            path = "/api/town/projection/v1"
        }

        do {
            let data = try await send(path: path)
            return try decoder.decode(TownProjection.self, from: data)
        } catch APIClientError.requestFailed(let status, _) where status == 404 {
            return nil
        }
    }

    func fetchAlerts() async throws -> DashboardAlertsResponse? {
        do {
            let data = try await send(path: "/api/dashboard/alerts/v1")
            return try decoder.decode(DashboardAlertsResponse.self, from: data)
        } catch APIClientError.requestFailed(let status, _) where status == 404 {
            return nil
        }
    }

    func acknowledgeAlert(alertId: String) async throws -> DashboardAlertAcknowledgeResponse {
        let trimmedAlertId = alertId.trimmingCharacters(in: .whitespacesAndNewlines)
        let payload = DashboardAlertAcknowledgeRequest(
            alertId: trimmedAlertId,
            tenantId: normalized(settings.tenantId),
            actorId: normalized(settings.actorId),
            reasonCode: "acknowledged_from_ios",
            evidenceRefs: nil
        )

        let body = try JSONEncoder().encode(payload)
        let data = try await send(
            path: "/api/dashboard/alerts/v1/ack",
            method: "POST",
            body: body,
            includeIdempotencyKey: true
        )

        return try decoder.decode(DashboardAlertAcknowledgeResponse.self, from: data)
    }

    private func send(
        path: String,
        method: String = "GET",
        body: Data? = nil,
        includeIdempotencyKey: Bool = false
    ) async throws -> Data {
        var request = try buildRequest(path: path)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        if let body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = body
        }

        addAuthHeaders(to: &request)
        if includeIdempotencyKey {
            request.setValue(UUID().uuidString, forHTTPHeaderField: "Idempotency-Key")
        }

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse else {
            throw APIClientError.requestFailed(status: -1, body: "Non-HTTP response")
        }

        guard (200...299).contains(http.statusCode) else {
            let message = String(data: data, encoding: .utf8) ?? ""
            throw APIClientError.requestFailed(status: http.statusCode, body: message)
        }

        return data
    }

    private func buildRequest(path: String) throws -> URLRequest {
        let trimmedBase = settings.baseURL.trimmingCharacters(in: .whitespacesAndNewlines)
        guard let baseURL = URL(string: trimmedBase), var components = URLComponents(url: baseURL, resolvingAgainstBaseURL: false) else {
            throw APIClientError.invalidBaseURL(trimmedBase)
        }

        let existingPath = components.path.trimmingCharacters(in: .whitespacesAndNewlines)
        if existingPath.hasSuffix("/") {
            components.path = String(existingPath.dropLast()) + path
        } else if existingPath.isEmpty {
            components.path = path
        } else {
            components.path = existingPath + path
        }

        guard let url = components.url else {
            throw APIClientError.invalidBaseURL(trimmedBase)
        }

        return URLRequest(url: url)
    }

    private func addAuthHeaders(to request: inout URLRequest) {
        setIfPresent("X-GT-Tenant-ID", normalized(settings.tenantId), on: &request)
        setIfPresent("X-GT-Actor-ID", normalized(settings.actorId), on: &request)
        setIfPresent("X-GT-Role", normalized(settings.role), on: &request)
        setIfPresent("X-GT-Project-Scopes", normalized(settings.projectScopesCSV), on: &request)
        setIfPresent("X-GT-Agent-Scopes", normalized(settings.agentScopesCSV), on: &request)
        setIfPresent("X-GT-Command-Allowlist", normalized(settings.commandAllowlistCSV), on: &request)
    }

    private func setIfPresent(_ header: String, _ value: String?, on request: inout URLRequest) {
        guard let value else { return }
        request.setValue(value, forHTTPHeaderField: header)
    }

    private func normalized(_ value: String) -> String? {
        let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }

    private func mapLegacySnapshot(_ snapshot: LegacyTownSnapshot) -> DashboardSnapshot {
        let agents = snapshot.agents.map { legacy in
            TownAgent(
                name: legacy.name,
                role: legacy.role,
                status: legacy.status
            )
        }
        let activePolecats = agents.filter { $0.status.uppercased() != "IDLE" }.count

        return DashboardSnapshot(
            version: "legacy",
            generatedAt: nil,
            summary: SnapshotSummary(
                totalProjects: 0,
                blockedProjects: 0,
                pendingApprovals: 0,
                mergeQueueHealth: 1.0,
                activePolecats: activePolecats
            ),
            townState: TownState(agents: agents),
            projects: [],
            mergeLanes: []
        )
    }
}

private struct LegacyTownSnapshot: Decodable {
    let agents: [LegacyTownAgent]
}

private struct LegacyTownAgent: Decodable {
    let name: String
    let role: String
    let status: String
}
