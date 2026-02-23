// OBSERVER PATTERN — Concrete Publisher: National Weather Service severe weather alerts
// Polls the NWS public API (no key required) and publishes new alerts through AlertStore.
// NWS API docs: https://www.weather.gov/documentation/services-web-api
import { AlertStore } from './AlertStore.ts';
import type { Alert } from '../../models/Alert.ts';

const NWS_API = 'https://api.weather.gov/alerts/active';
const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

// NWS event types treated as severe weather (maps to alert type 'urgent' or 'warning')
const SEVERE_EVENTS = new Set([
  'Tornado Warning',
  'Tornado Watch',
  'Flash Flood Warning',
  'Flash Flood Watch',
  'Severe Thunderstorm Warning',
  'Severe Thunderstorm Watch',
  'Hurricane Warning',
  'Hurricane Watch',
  'Blizzard Warning',
  'Winter Storm Warning',
  'Winter Storm Watch',
  'Ice Storm Warning',
  'Extreme Cold Warning',
  'Excessive Heat Warning',
  'High Wind Warning',
  'Flood Warning',
  'Flood Watch',
]);

function nwsSeverityToAlertType(severity: string, urgency: string): Alert['type'] {
  if (severity === 'Extreme' || urgency === 'Immediate') return 'urgent';
  if (severity === 'Severe') return 'warning';
  return 'info';
}

export class WeatherAlertService {
  private seenIds = new Set<string>();
  private timerId: ReturnType<typeof setInterval> | null = null;
  // Optional: filter by US state abbreviation, e.g. 'TX'. Leave empty for nationwide.
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
      const url = this.state
        ? `${NWS_API}?area=${this.state}&status=actual`
        : `${NWS_API}?status=actual&severity=Extreme,Severe&limit=10`;

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

        // Skip if we've already published this alert
        if (this.seenIds.has(id)) continue;

        // Only publish events in our severe set
        if (!SEVERE_EVENTS.has(p.event)) continue;

        this.seenIds.add(id);

        const alert: Alert = {
          id,
          type: nwsSeverityToAlertType(p.severity ?? '', p.urgency ?? ''),
          title: p.event ?? 'Weather Alert',
          message: p.headline ?? p.description ?? 'Severe weather in your area.',
          location: p.areaDesc ?? '',
          timestamp: new Date(p.sent ?? Date.now()),
          icon: 'weather',
          safetyTips: p.instruction
            ? p.instruction.split(/\.\s+/).filter(Boolean).slice(0, 5)
            : [
                'Monitor local news and weather updates',
                'Stay indoors if possible',
                'Have an emergency kit ready',
                'Know your nearest shelter',
              ],
        };

        store.publishAlert(alert);
      }
    } catch {
      // Silently fail — network errors should not crash the app
    }
  }
}
