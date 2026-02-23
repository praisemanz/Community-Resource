// OBSERVER PATTERN — Concrete Subject (also Singleton so there is one shared store)
// AlertStore holds the list of active observers and broadcasts every new alert to all of them.
import type { AlertObserver } from './AlertObserver.ts';
import type { AlertSubject } from './AlertSubject.ts';
import type { Alert } from '../../models/Alert.ts';
import type { ICEReport } from '../../models/ICEReport.ts';

export class AlertStore implements AlertSubject {
  private static instance: AlertStore;
  private observers: AlertObserver[] = [];

  // Singleton: only one AlertStore exists across the whole app
  static getInstance(): AlertStore {
    if (!AlertStore.instance) {
      AlertStore.instance = new AlertStore();
    }
    return AlertStore.instance;
  }

  attach(observer: AlertObserver): void {
    this.observers.push(observer);
  }

  detach(observer: AlertObserver): void {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  notifyObservers(alert: Alert): void {
    this.observers.forEach((observer) => observer.update(alert));
  }

  // Generic publish — used by API services to broadcast any pre-built Alert
  publishAlert(alert: Alert): void {
    this.notifyObservers(alert);
  }

  // Converts a raw ICEReport into a structured Alert and broadcasts it
  publishICEReport(report: ICEReport): void {
    const alert: Alert = {
      id: report.id,
      type: 'urgent',
      title: 'New ICE Activity Report',
      message: report.description,
      location: report.location,
      timestamp: report.timestamp,
      icon: 'safety',
      safetyTips: [
        'Avoid the reported area if possible',
        'Do not open your door without a valid warrant',
        'Exercise your right to remain silent',
        'Have emergency contact numbers ready',
        'Carry your know-your-rights card',
      ],
    };
    this.notifyObservers(alert);
  }
}
