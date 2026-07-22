import type { IForm, IConverters, Schema, SchemaDefinition } from './types';

function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

const builtInConverters: IConverters = {
  date: (key, values, defaultNull) => {
    const raw = values[key];
    if (raw === '') return defaultNull !== undefined ? defaultNull : raw;
    const date = new Date(raw);
    return isValidDate(date) ? date : raw;
  },
  number: (key, values, defaultNull) => {
    const raw = values[key];
    if (raw === '' && defaultNull !== undefined) return defaultNull;
    if (/^[0-9.]+$/.test(raw)) return parseFloat(raw);
    if (/^[0-9]+$/.test(raw)) return parseInt(raw, 10);
    return raw;
  },
  text: (key, values, defaultNull) => {
    const trimmed = String(values[key]).trim();
    return trimmed === '' && defaultNull !== undefined ? defaultNull : trimmed;
  },
};

export function convert<T>({
  key,
  values,
  schema,
  converters = {},
  dirtyFields = {},
}: {
  key: string;
  values: IForm;
  schema: Schema<SchemaDefinition<T>>;
  converters?: IConverters;
  dirtyFields?: IIs;
}): any {
  const schemaMap = schema as Record<string, any>;
  const definition = schemaMap[key];
  const { converter, type, defaultNull } = definition;
  const converterWithType = converter !== undefined ? { [type]: converter } : {};
  const merged: IConverters = { ...builtInConverters, ...converters, ...converterWithType };

  if (merged[type] !== undefined) {
    return merged[type](key, values, defaultNull, dirtyFields[key] ?? false);
  }
  return values[key] === '' && defaultNull !== undefined ? defaultNull : values[key];
}

// re-export the IIs type used above
import type { IIs } from './types';
