// OBSERVER PATTERN — Concrete Publisher: NWS civil & public safety emergency alerts
// Uses the same NWS public API but filters for non-weather emergency event types:
// evacuations, 911 outages, civil emergencies, AMBER alerts, and shelter-in-place orders.
import { AlertStore } from './AlertStore.ts';
import type { Alert } from '../../models/Alert.ts';

const NWS_API = 'https://api.weather.gov/alerts/active';
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// NWS civil/public safety event types to watch for
const EMERGENCY_EVENTS = new Set([
  '911 Telephone Outage Emergency',
  'Administrative Message',
  'AMBER Alert',
  'Child Abduction Emergency',
  'Civil Danger Warning',
  'Civil Emergency Message',
  'Evacuation - Immediate',
  'Immediate Evacuate',
  'Law Enforcement Warning',
  'Local Area Emergency',
  'Nuclear Power Plant Warning',
  'Radiological Hazard Warning',
  'Shelter In Place Warning',
  'Hazardous Materials Warning',
  'Blue Alert',
]);

export class EmergencyAlertService {
  private seenIds = new Set<string>();
  private timerId: ReturnType<typeof setInterval> | null = null;
  private state: string;

  constructor(state = '') {
    this.state = state;
  }

  start(): void {
    this.fetchAndPublish();
    this.timerId = setInterval(() => this.fetchAndPublish(), POLL_INTERVAL_MS);
  }

  stop(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private async fetchAndPublish(): Promise<void> {
    try {
      // Query all actual active alerts; we filter client-side by event type
      const url = this.state
        ? `${NWS_API}?area=${this.state}&status=actual`
        : `${NWS_API}?status=actual&limit=50`;

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'CommunityResourceApp/1.0 (community-app@example.com)',
          Accept: 'application/geo+json',
        },
      });

      if (!res.ok) return;

      const data = await res.json();
      const store = AlertStore.getInstance();

      for (const feature of data.features ?? []) {
        const p = feature.properties;
        const id: string = p.id ?? feature.id;

        if (this.seenIds.has(id)) continue;
        if (!EMERGENCY_EVENTS.has(p.event)) continue;

        this.seenIds.add(id);

        // AMBER alerts and evacuations are always urgent; others depend on severity
        const isAlwaysUrgent =
          p.event === 'AMBER Alert' ||
          p.event === 'Child Abduction Emergency' ||
          p.event === 'Evacuation - Immediate' ||
          p.event === 'Civil Danger Warning' ||
          p.event === 'Shelter In Place Warning';

        const alert: Alert = {
          id,
          type: isAlwaysUrgent ? 'urgent' : 'warning',
          title: p.event ?? 'Emergency Alert',
          message: p.headline ?? p.description ?? 'Emergency situation in your area.',
          location: p.areaDesc ?? '',
          timestamp: new Date(p.sent ?? Date.now()),
          icon: 'safety',
          safetyTips: p.instruction
            ? p.instruction.split(/\.\s+/).filter(Boolean).slice(0, 5)
            : [
                'Follow instructions from local authorities',
                'Stay informed via official channels',
                'Keep emergency contacts ready',
                'Know your nearest safe location',
              ],
        };

        store.publishAlert(alert);
      }
    } catch {
      // Silently fail — network errors should not crash the app
    }
  }
}
