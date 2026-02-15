import Foundation

@MainActor
final class AppState: ObservableObject {
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

        do {
            async let snapshot = client.fetchSnapshot()
            async let projection = client.fetchProjection()
            async let alerts = client.fetchAlerts()

            let (snapshotValue, projectionValue, alertsValue) = try await (snapshot, projection, alerts)

            self.snapshot = snapshotValue
            self.projection = projectionValue
            self.alerts = alertsValue.alerts
            self.lastRefreshDate = Date()
            self.errorMessage = nil
        } catch {
            self.errorMessage = error.localizedDescription
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
}
