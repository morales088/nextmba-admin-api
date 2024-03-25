type ComparisonOperators = 'eq' | 'ne' | 'gt' | 'lt' | 'gte' | 'lte';

export interface FilterOptions {
  field: string;
  value: Date;
  comparisonOperator: ComparisonOperators;
}
