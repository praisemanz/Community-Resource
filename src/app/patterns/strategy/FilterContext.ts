// STRATEGY PATTERN — Context
// FilterContext chains multiple FilterStrategy instances together.
// Each strategy is applied in sequence; the output of one becomes the input of the next.
import type { FilterStrategy } from './FilterStrategy.ts';

export class FilterContext<T> {
  private strategies: FilterStrategy<T>[] = [];

  addStrategy(strategy: FilterStrategy<T>): FilterContext<T> {
    this.strategies.push(strategy);
    return this; // fluent API for readability
  }

  executeAll(items: T[]): T[] {
    return this.strategies.reduce(
      (filtered, strategy) => strategy.filter(filtered),
      items
    );
  }
}
