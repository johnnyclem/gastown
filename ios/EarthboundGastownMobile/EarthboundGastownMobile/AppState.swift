import Foundation

@MainActor
final class AppState: ObservableObject {
    private enum FetchResult<T> {
        case success(T)
        case failure(String)
    }

    @Published var settings: ConnectionSettings
    @Published var snapshot: DashboardSnapshot?
    @Published var projection: TownProjection?
    @Published var alerts: [TownAlert] = []
    @Published var isRefreshing = false
    @Published var lastRefreshDate: Date?
    @Published var errorMessage: String?
    @Published var ackInFlight: Set<String> = []

    private var refreshLoopTask: Task<Void, Never>?

    init(settings: ConnectionSettings = SettingsStore.load()) {
        self.settings = settings
    }

    deinit {
        refreshLoopTask?.cancel()
    }

    func start() {
        if refreshLoopTask == nil {
            refreshLoopTask = Task { [weak self] in
                guard let self else { return }
                await self.refresh()
                await self.runRefreshLoop()
            }
        }
    }

    func stop() {
        refreshLoopTask?.cancel()
        refreshLoopTask = nil
    }

    func refresh() async {
        isRefreshing = true
        defer { isRefreshing = false }

        let client = APIClient(settings: settings)

        async let snapshotAttempt = attempt(label: "snapshot") {
            try await client.fetchSnapshot()
        }
        async let projectionAttempt = attempt(label: "projection") {
            try await client.fetchProjection()
        }
        async let alertsAttempt = attempt(label: "alerts") {
            try await client.fetchAlerts()
        }

        let snapshotResult = await snapshotAttempt
        let projectionResult = await projectionAttempt
        let alertsResult = await alertsAttempt

        var successes = 0
        var failures: [String] = []

        switch snapshotResult {
        case .success(let value):
            snapshot = value
            successes += 1
        case .failure(let message):
            failures.append(message)
        }

        switch projectionResult {
        case .success(let value):
            projection = value
            successes += 1
        case .failure(let message):
            failures.append(message)
        }

        switch alertsResult {
        case .success(let value):
            alerts = value.alerts
            successes += 1
        case .failure(let message):
            failures.append(message)
        }

        if successes > 0 {
            lastRefreshDate = Date()
            if failures.isEmpty {
                errorMessage = nil
            } else {
                errorMessage = "Partial refresh: " + failures.joined(separator: " | ")
            }
        } else {
            errorMessage = failures.joined(separator: " | ")
        }
    }

    func acknowledge(alert: TownAlert) async {
        guard !ackInFlight.contains(alert.id) else { return }

        ackInFlight.insert(alert.id)
        defer { ackInFlight.remove(alert.id) }

        do {
            let response = try await APIClient(settings: settings).acknowledgeAlert(alertId: alert.id)
            if let index = alerts.firstIndex(where: { $0.id == response.alert.id }) {
                alerts[index] = response.alert
            }
            errorMessage = nil
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func updateSettings(_ settings: ConnectionSettings) {
        self.settings = settings
        SettingsStore.save(settings)

        stop()
        start()
    }

    private func runRefreshLoop() async {
        while !Task.isCancelled {
            let seconds = max(2, settings.pollIntervalSeconds)
            let delay = UInt64(seconds) * 1_000_000_000
            try? await Task.sleep(nanoseconds: delay)
            if Task.isCancelled { break }
            await refresh()
        }
    }

    private func attempt<T>(
        label: String,
        operation: @escaping () async throws -> T
    ) async -> FetchResult<T> {
        do {
            return .success(try await operation())
        } catch {
            return .failure("\(label): \(error.localizedDescription)")
        }
    }
}
