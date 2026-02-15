import Foundation

struct ConnectionSettings: Codable, Equatable {
    var baseURL: String
    var tenantId: String
    var actorId: String
    var role: String
    var projectScopesCSV: String
    var agentScopesCSV: String
    var commandAllowlistCSV: String
    var pollIntervalSeconds: Int

    static let defaults = ConnectionSettings(
        baseURL: "http://localhost:8080",
        tenantId: "tenant-earthbound",
        actorId: "ios.operator",
        role: "mayor",
        projectScopesCSV: "",
        agentScopesCSV: "",
        commandAllowlistCSV: "",
        pollIntervalSeconds: 5
    )
}

enum SettingsStore {
    private static let key = "earthboundGastown.connectionSettings"

    static func load() -> ConnectionSettings {
        let defaults = UserDefaults.standard
        guard let data = defaults.data(forKey: key) else {
            return .defaults
        }

        do {
            return try JSONDecoder().decode(ConnectionSettings.self, from: data)
        } catch {
            return .defaults
        }
    }

    static func save(_ settings: ConnectionSettings) {
        do {
            let data = try JSONEncoder().encode(settings)
            UserDefaults.standard.set(data, forKey: key)
        } catch {
            // Non-fatal persistence failure.
        }
    }
}
