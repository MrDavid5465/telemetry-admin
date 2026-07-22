import type { Field, Schema, SchemaDefinition } from './types';

const FIELD_DEFAULTS: Partial<Field> = {
  defaultValue: '',
  display: true,
  required: false,
  validations: [],
};

export function useSchema<T>(schema: SchemaDefinition<T>): Schema<SchemaDefinition<T>> {
  return Object.entries(schema).reduce((acc, [key, field]) => {
    const withDefaults = Object.entries(FIELD_DEFAULTS).reduce(
      (f, [k, v]) => (f[k] === undefined ? { ...f, [k]: v } : f),
      field as Record<string, any>,
    );
    return { ...acc, [key]: withDefaults };
  }, {} as Schema<SchemaDefinition<T>>);
}
