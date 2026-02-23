// OBSERVER PATTERN — Subject interface
// The Subject maintains a list of observers and notifies them when a new alert is published.
import type { AlertObserver } from './AlertObserver.ts';
import type { Alert } from '../../models/Alert.ts';

export interface AlertSubject {
  attach(observer: AlertObserver): void;
  detach(observer: AlertObserver): void;
  notifyObservers(alert: Alert): void;
}
