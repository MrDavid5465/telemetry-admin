import { useState, useCallback } from 'react';
import type { IForm, IConverters, SchemaDefinition } from './types';
import { useSchema } from './useSchema';
import { useValidator } from './useValidator';
import { convert } from './converter';

interface UseFormOptions<T> {
  converters?: IConverters;
  passedValues?: IForm;
  schema: SchemaDefinition<T>;
  name?: string;
}

export default function useForm<T>({ converters = {}, passedValues = {}, schema }: UseFormOptions<T>) {
  const fullSchema = useSchema(schema);
  const validate = useValidator(fullSchema);

  function initWith(value: boolean) {
    return Object.keys(fullSchema).reduce(
      (acc, k) => ({ ...acc, [k]: value }),
      {} as Record<string, boolean>,
    );
  }

  function defaultValues(): IForm {
    return Object.entries(fullSchema).reduce((acc, [k, v]) => {
      const field = v as any;
      return { ...acc, [k]: passedValues[k] ?? field.defaultValue ?? '' };
    }, {} as IForm);
  }

  const [values, setValues] = useState<IForm>(defaultValues);
  const [dirty, setDirty]   = useState(() => initWith(false));
  const [touched, setTouched] = useState(() => initWith(false));

  function isValid() {
    return Object.values(validate(values)).every(errors => errors.length === 0);
  }

  function onChange(name: string, value: any) {
    const fieldName = name.split('.').slice(-1)[0];
    setValues(v => ({ ...v, [fieldName]: value }));
    setDirty(d => ({ ...d, [fieldName]: true }));
  }

  function onFocus(name: string) {
    const fieldName = name.split('.').slice(-1)[0];
    setTouched(t => ({ ...t, [fieldName]: true }));
  }

  function onReset() {
    setDirty(initWith(false));
    setTouched(initWith(false));
    setValues(defaultValues());
  }

  const onSubmit = useCallback(
    () =>
      Object.keys(fullSchema).reduce(
        (acc, key) => ({
          ...acc,
          [key]: convert({ key, values, schema: fullSchema, converters, dirtyFields: dirty }),
        }),
        { ...values },
      ),
    [converters, dirty, fullSchema, values],
  );

  return {
    change:  onChange,
    errors:  validate(values),
    dirty,
    isValid: isValid(),
    focus:   onFocus,
    reset:   onReset,
    schema:  fullSchema,
    submit:  onSubmit,
    touched,
    values,
  };
}
