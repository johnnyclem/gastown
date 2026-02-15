# EarthboundGastown iOS App

Native iOS app for viewing and commanding EarthboundGastown.

## What it does

- Reads live data from:
  - `GET /api/dashboard/snapshot/v1`
  - `GET /api/town/projection/v1`
  - `GET /api/dashboard/alerts/v1`
- Sends command action:
  - `POST /api/dashboard/alerts/v1/ack` (acknowledge alert)
- Supports tenant/RBAC headers via in-app Settings.

## Run

1. Start backend dashboard from repo root:

```bash
gt dashboard --port 8080
```

2. Open the Xcode project:

```bash
open ios/EarthboundGastownMobile/EarthboundGastownMobile.xcodeproj
```

3. Choose an iOS Simulator target and run.

## Notes

- Default base URL is `http://localhost:8080`.
- For physical devices, use your host machine LAN IP instead of `localhost`.
- App Transport Security is relaxed for local HTTP development in this build.
