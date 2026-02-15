import Foundation

enum APIClientError: LocalizedError {
    case invalidBaseURL(String)
    case requestFailed(status: Int, body: String)

    var errorDescription: String? {
        switch self {
        case .invalidBaseURL(let baseURL):
            return "Invalid base URL: \(baseURL)"
        case .requestFailed(let status, let body):
            if body.isEmpty {
                return "Request failed with status \(status)."
            }
            return "Request failed with status \(status): \(body)"
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
        let data = try await send(path: "/api/dashboard/snapshot/v1")
        return try decoder.decode(DashboardSnapshot.self, from: data)
    }

    func fetchProjection() async throws -> TownProjection {
        let data = try await send(path: "/api/town/projection/v1")
        return try decoder.decode(TownProjection.self, from: data)
    }

    func fetchAlerts() async throws -> DashboardAlertsResponse {
        let data = try await send(path: "/api/dashboard/alerts/v1")
        return try decoder.decode(DashboardAlertsResponse.self, from: data)
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
}
