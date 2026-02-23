// OBSERVER PATTERN — Observer interface
// Any object that wants to receive alert notifications must implement this interface.
import type { Alert } from '../../models/Alert.ts';

export interface AlertObserver {
  update(alert: Alert): void;
}
