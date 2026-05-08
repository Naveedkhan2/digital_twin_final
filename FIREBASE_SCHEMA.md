# Firebase Realtime Database Schema - Epsilon AI Motor Monitoring

## Current Structure (example log history)

Writers typically push to `motor01/logs` with many sequential entries (example: 360):

```json
{
  "motor01": {
    "logs": {
      "entry_001": {
        "I1": 75.2,
        "I2": 73.8,
        "I3": 74.5,
        "V1": 398.5,
        "V2": 401.2,
        "V3": 399.8,
        "frequency": 50.1,
        "pf": 0.89,
        "T1": 58.3,
        "T2": 54.2,
        "vibration": 2.85,
        "timestamp": "2025-01-31 12:00:00"
      },
      "entry_002": { ... },
      "entry_360": { ... }
    }
  }
}
```

**Field mapping to dashboard:**
- `I1`, `I2`, `I3` → Phase A, B, C Current (Amps)
- `V1`, `V2`, `V3` → Phase A, B, C Voltage (Volts)
- `frequency` → Frequency (Hz)
- `T1`, `T2` → Temperature sensors T1, T2 (°C)
- `vibration` → Real-Time Vibration chart data point

---

## Recommended Schema Extensions

For better real-time performance and predictive maintenance, add:

### 1. `live_reading` (optional – single live values)

```json
{
  "motor01": {
    "live_reading": {
      "current": { "I1": 24.3, "I2": 24.5, "I3": 24.1 },
      "voltage": { "V1": 381.2, "V2": 380.8, "V3": 382.1 },
      "temperature": { "T1": 72.4, "T2": 68.7 },
      "frequency": 50.2,
      "vibration": 2.45,
      "timestamp": "2025-01-31T12:00:00Z"
    }
  }
}
```

When present, the dashboard uses `live_reading` for parameters; otherwise it derives from the latest log entry.

### 2. `predictive_maintenance` (for component status from Firebase)

```json
{
  "motor01": {
    "predictive_maintenance": {
      "components": [
        {
          "id": "bearing_assembly",
          "component": "Bearing Assembly",
          "status": "healthy",
          "remainingLifeHours": 1500,
          "recommendation": "No action needed"
        },
        {
          "id": "winding_insulation",
          "component": "Winding Insulation",
          "status": "warning",
          "remainingLifeHours": 340,
          "recommendation": "Monitor temperature trends; consider inspection"
        },
        {
          "id": "phase_balancing",
          "component": "Phase Balancing",
          "status": "critical",
          "remainingLifeHours": 48,
          "recommendation": "Immediate inspection required"
        }
      ],
      "lastAnalysis": "2025-01-31T12:00:00Z"
    }
  }
}
```

**Status values:** `"healthy"` | `"warning"` | `"critical"`

---

## Suggestion for data publishers

When you append log entries, also set `motor01/live_reading` to the latest snapshot so the dashboard can show current values without scanning all logs. Include `predictive_maintenance` if you want server-driven component status (see schema above).
