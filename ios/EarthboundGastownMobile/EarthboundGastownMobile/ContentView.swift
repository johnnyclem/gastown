import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        TabView {
            DashboardTabView()
                .tabItem {
                    Label("Dashboard", systemImage: "chart.xyaxis.line")
                }

            AlertsTabView()
                .tabItem {
                    Label("Commands", systemImage: "bolt.horizontal.circle")
                }

            SettingsTabView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape")
                }
        }
        .task {
            appState.start()
        }
    }
}

private struct DashboardTabView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        NavigationStack {
            List {
                Section("Connection") {
                    LabeledContent("Base URL", value: appState.settings.baseURL)
                    if let lastRefreshDate = appState.lastRefreshDate {
                        LabeledContent("Last refresh", value: lastRefreshDate.formatted(.dateTime.hour().minute().second()))
                    }
                    if let error = appState.errorMessage, !error.isEmpty {
                        Text(error)
                            .font(.footnote)
                            .foregroundStyle(.red)
                    }
                }

                if let snapshot = appState.snapshot {
                    Section("Summary") {
                        MetricRow(label: "Total Projects", value: String(snapshot.summary.totalProjects))
                        MetricRow(label: "Blocked Projects", value: String(snapshot.summary.blockedProjects))
                        MetricRow(label: "Pending Approvals", value: String(snapshot.summary.pendingApprovals))
                        MetricRow(label: "Merge Health", value: String(format: "%.0f%%", snapshot.summary.mergeQueueHealth * 100))
                        MetricRow(label: "Active Polecats", value: String(snapshot.summary.activePolecats))
                    }

                    Section("Agents") {
                        ForEach(snapshot.townState.agents) { agent in
                            HStack {
                                VStack(alignment: .leading) {
                                    Text(agent.name)
                                        .font(.body)
                                    Text(agent.role)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                Spacer()
                                Text(agent.status)
                                    .font(.caption.weight(.semibold))
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(statusColor(agent.status).opacity(0.15))
                                    .foregroundStyle(statusColor(agent.status))
                                    .clipShape(Capsule())
                            }
                        }
                    }

                    Section("Projects") {
                        ForEach(snapshot.projects) { project in
                            VStack(alignment: .leading, spacing: 4) {
                                HStack {
                                    Text(project.name)
                                        .font(.body)
                                    Spacer()
                                    Text(project.status.uppercased())
                                        .font(.caption.weight(.semibold))
                                        .foregroundStyle(statusColor(project.status))
                                }

                                Text("\(project.completed)/\(max(project.total, 0)) complete")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)

                                if let reason = project.statusReason, !reason.isEmpty {
                                    Text(reason)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                            .padding(.vertical, 2)
                        }
                    }

                    Section("Merge Lanes") {
                        ForEach(snapshot.mergeLanes) { lane in
                            VStack(alignment: .leading, spacing: 4) {
                                HStack {
                                    Text(lane.repo)
                                        .font(.body)
                                    Spacer()
                                    Text(lane.status.uppercased())
                                        .font(.caption.weight(.semibold))
                                        .foregroundStyle(statusColor(lane.status))
                                }

                                Text("Ready \(lane.readyItems) • Pending \(lane.pendingItems) • Blocked \(lane.blockedItems)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            .padding(.vertical, 2)
                        }
                    }
                } else if appState.isRefreshing {
                    Section {
                        HStack {
                            Spacer()
                            ProgressView("Loading EarthboundGastown…")
                            Spacer()
                        }
                    }
                }

                if let projection = appState.projection {
                    Section("Top Blockers") {
                        if projection.topBlockers.isEmpty {
                            Text("No active blockers in projection feed.")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        } else {
                            ForEach(projection.topBlockers) { blocker in
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(blocker.projectId)
                                        .font(.body)
                                    Text(blocker.reasonCode)
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                .padding(.vertical, 2)
                            }
                        }
                    }
                }
            }
            .navigationTitle("EarthboundGastown")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task {
                            await appState.refresh()
                        }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                    .disabled(appState.isRefreshing)
                    .accessibilityLabel("Refresh")
                }
            }
            .refreshable {
                await appState.refresh()
            }
        }
    }

    private func statusColor(_ status: String) -> Color {
        switch status.lowercased() {
        case "blocked", "error", "critical", "red": return .red
        case "working", "merging", "pending", "yellow", "warn", "warning": return .orange
        case "ok", "green", "idle", "ready": return .green
        default: return .blue
        }
    }
}

private struct AlertsTabView: View {
    @EnvironmentObject private var appState: AppState

    var body: some View {
        NavigationStack {
            List {
                Section {
                    Text("Acknowledge Town Crier alerts via `/api/dashboard/alerts/v1/ack`.")
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                }

                if appState.alerts.isEmpty {
                    Section {
                        Text("No firing alerts.")
                            .foregroundStyle(.secondary)
                    }
                } else {
                    ForEach(appState.alerts) { alert in
                        Section {
                            VStack(alignment: .leading, spacing: 8) {
                                HStack {
                                    Text(alert.message)
                                        .font(.body)
                                    Spacer()
                                    Text(alert.severity.uppercased())
                                        .font(.caption.weight(.semibold))
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(severityColor(alert.severity).opacity(0.15))
                                        .foregroundStyle(severityColor(alert.severity))
                                        .clipShape(Capsule())
                                }

                                Text("Current \(alert.current, specifier: "%.2f") / Threshold \(alert.threshold, specifier: "%.2f")")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)

                                Text("Occurrences: \(alert.occurrences)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)

                                HStack {
                                    if alert.acked {
                                        Label("Acknowledged", systemImage: "checkmark.circle.fill")
                                            .foregroundStyle(.green)
                                            .font(.caption.weight(.semibold))
                                    }

                                    Spacer()

                                    Button {
                                        Task {
                                            await appState.acknowledge(alert: alert)
                                        }
                                    } label: {
                                        if appState.ackInFlight.contains(alert.id) {
                                            ProgressView()
                                        } else {
                                            Label("Acknowledge", systemImage: "checkmark.shield")
                                        }
                                    }
                                    .disabled(alert.acked || appState.ackInFlight.contains(alert.id))
                                    .buttonStyle(.borderedProminent)
                                    .controlSize(.small)
                                }
                            }
                            .padding(.vertical, 4)
                        } header: {
                            Text(alert.dedupeKey)
                        }
                    }
                }
            }
            .navigationTitle("Commands")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        Task {
                            await appState.refresh()
                        }
                    } label: {
                        Image(systemName: "arrow.clockwise")
                    }
                    .disabled(appState.isRefreshing)
                    .accessibilityLabel("Refresh")
                }
            }
            .refreshable {
                await appState.refresh()
            }
        }
    }

    private func severityColor(_ severity: String) -> Color {
        switch severity.lowercased() {
        case "critical": return .red
        case "high": return .orange
        case "medium": return .yellow
        case "low": return .blue
        default: return .secondary
        }
    }
}

private struct SettingsTabView: View {
    @EnvironmentObject private var appState: AppState

    @State private var draft = ConnectionSettings.defaults

    var body: some View {
        NavigationStack {
            Form {
                Section("Server") {
                    TextField("Base URL", text: $draft.baseURL)
                        .keyboardType(.URL)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()

                    Stepper(value: $draft.pollIntervalSeconds, in: 2...60) {
                        LabeledContent("Poll Interval", value: "\(draft.pollIntervalSeconds)s")
                    }
                }

                Section("RBAC Headers") {
                    TextField("Tenant ID", text: $draft.tenantId)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()

                    TextField("Actor ID", text: $draft.actorId)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()

                    TextField("Role (viewer/operator/mayor/service_account)", text: $draft.role)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()

                    TextField("Project scopes CSV", text: $draft.projectScopesCSV)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()

                    TextField("Agent scopes CSV", text: $draft.agentScopesCSV)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()

                    TextField("Command allowlist CSV", text: $draft.commandAllowlistCSV)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                }

                Section {
                    Button("Save and Reconnect") {
                        appState.updateSettings(draft)
                    }
                    .buttonStyle(.borderedProminent)

                    Button("Reset to Defaults") {
                        draft = .defaults
                    }
                    .buttonStyle(.bordered)
                }
            }
            .navigationTitle("Settings")
            .onAppear {
                draft = appState.settings
            }
        }
    }
}

private struct MetricRow: View {
    let label: String
    let value: String

    var body: some View {
        LabeledContent(label, value: value)
            .font(.subheadline)
    }
}

#Preview {
    ContentView()
        .environmentObject(AppState())
}
