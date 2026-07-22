import type { IForm, IValidationErrors, Schema, SchemaDefinition, Validation } from './types';

export function useValidator<T>(schema: Schema<SchemaDefinition<T>>) {
  return function validate(values: IForm): IValidationErrors {
    const schemaMap = schema as Record<string, any>;
    const keys = Object.keys(values).filter(k => !!schemaMap[k]);
    return keys.reduce((acc, k) => {
      const { required, validations = [] } = schemaMap[k];

      const baseValidations: Validation[] = [
        {
          test: (form) => !/^\s+/.test(form[k]),
          message: 'This field can not start with blank spaces',
        },
      ];

      if (required) {
        baseValidations.push({
          test: (form) => !!form[k],
          message: 'This field is required',
        });
      }

      const allValidations: Validation[] = [...baseValidations, ...validations];
      const errors = allValidations
        .filter(v => !v.test(values))
        .map(v => v.message);

      return { ...acc, [k]: errors };
    }, {} as IValidationErrors);
  };
}
