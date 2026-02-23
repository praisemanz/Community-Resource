// STRATEGY PATTERN — Strategy interface
// Each concrete filter strategy receives an array of items and returns a filtered subset.
export interface FilterStrategy<T> {
  filter(items: T[]): T[];
}
