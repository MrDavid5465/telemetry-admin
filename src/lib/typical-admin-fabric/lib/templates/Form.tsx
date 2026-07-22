import React, { useEffect, forwardRef, ReactElement, Ref } from 'react';

import Field from './Fabric';
import useForm, {
  FormWrapper,
  SchemaDefinition,
  IForm,
  IConverters,
} from '../../../per-form';

interface Props<T> {
  converters?: IConverters;
  form: SchemaDefinition<T>;
  initialValues?: IForm;
  name: string;
  onChange?: (name: string, values: any) => void;
  fieldProps?: { [key: string]: any };
}
export interface IFormRef {
  isValid: boolean;
  reset: () => void;
  submit: () => any;
  values: any;
}

function SubForm<T>(
  {
    initialValues,
    form,
    name,
    onChange,
    converters = {},
    fieldProps,
  }: Props<T>,
  ref: Ref<any>
): ReactElement {
  const {
    change,
    dirty,
    errors,
    focus,
    isValid,
    reset: resetForm,
    schema,
    submit: submitForm,
    touched,
    values,
  } = useForm({
    converters,
    name,
    passedValues: initialValues,
    schema: form,
  });

  useEffect(() => {
    onChange &&
      onChange(name, { raw: values, clean: submitForm(), isValid, errors });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, values, isValid]);

  React.useImperativeHandle(ref, () => ({
    isValid,
    errors,
    reset: () => resetForm(),
    submit: () => submitForm(),
    values,
  }));

  return (
    <FormWrapper
      dirty={dirty}
      errors={errors}
      name={name}
      onChange={change}
      onFocus={focus}
      schema={schema}
      Template={Field}
      touched={touched}
      values={values}
      fieldProps={fieldProps}
    />
  );
}

export default forwardRef(SubForm);
