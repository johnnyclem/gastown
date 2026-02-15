import Foundation

struct DashboardSnapshot: Decodable {
    let version: String
    let generatedAt: String?
    let summary: SnapshotSummary
    let townState: TownState
    let projects: [TownProject]
    let mergeLanes: [MergeLane]
}

struct SnapshotSummary: Decodable {
    let totalProjects: Int
    let blockedProjects: Int
    let pendingApprovals: Int
    let mergeQueueHealth: Double
    let activePolecats: Int
}

struct TownState: Decodable {
    let agents: [TownAgent]
}

struct TownAgent: Decodable, Identifiable {
    var id: String { name }
    let name: String
    let role: String
    let status: String
}

struct TownProject: Decodable, Identifiable {
    let id: String
    let name: String
    let status: String
    let statusReason: String?
    let completed: Int
    let total: Int
    let pendingApprovals: Int
    let blockedItems: Int
    let evidenceRefs: [String]
}

struct MergeLane: Decodable, Identifiable {
    let id: String
    let repo: String
    let status: String
    let totalItems: Int
    let readyItems: Int
    let pendingItems: Int
    let blockedItems: Int
    let reasonCodes: [String]
    let evidenceRefs: [String]
}

struct TownProjection: Decodable {
    let version: String
    let tenantId: String
    let generatedAt: String?
    let lastImportantEventAt: String
    let summary: ProjectionSummary
    let projects: [ProjectionProject]
    let topBlockers: [ProjectionBlocker]
}

struct ProjectionSummary: Decodable {
    let totalProjects: Int
    let idleProjects: Int
    let workingProjects: Int
    let blockedProjects: Int
    let errorProjects: Int
    let awaitingApprovalProjects: Int
}

struct ProjectionProject: Decodable, Identifiable {
    var id: String { projectId }
    let projectId: String
    let lanternState: String
    let reasonCodes: [String]
    let evidenceRefs: [String]
    let lastImportantEventAt: String
}

struct ProjectionBlocker: Decodable, Identifiable {
    var id: String { projectId + ":" + reasonCode }
    let projectId: String
    let lanternState: String
    let reasonCode: String
    let evidenceRefs: [String]
    let lastImportantEventAt: String
}

struct DashboardAlertsResponse: Decodable {
    let version: String
    let generatedAt: String
    let alerts: [TownAlert]
}

struct TownAlert: Decodable, Identifiable {
    let id: String
    let dedupeKey: String
    let severity: String
    let status: String
    let message: String
    let threshold: Double
    let current: Double
    let occurrences: Int
    let firstSeenAt: String
    let lastSeenAt: String
    let alertClass: String
    let neverDrop: Bool
    let acked: Bool
    let ackedAt: String?
    let ackedBy: String?
    let ackCommandEventId: String?
}

struct DashboardAlertAcknowledgeRequest: Encodable {
    let alertId: String
    let tenantId: String?
    let actorId: String?
    let reasonCode: String?
    let evidenceRefs: [String]?
}

struct DashboardAlertAcknowledgeResponse: Decodable {
    let version: String
    let alert: TownAlert
    let commandEventId: String
    let auditEventId: String
}
