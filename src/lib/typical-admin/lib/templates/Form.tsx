import React, { useEffect, forwardRef, ReactElement, Ref } from 'react';

import Raw from './Raw';
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
}

function SubForm<T>(
  { initialValues, form, name, onChange, converters = {} }: Props<T>,
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
    onChange && onChange(name, { raw: values, clean: submitForm(), isValid });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange, name, values, isValid]);

  React.useImperativeHandle(ref, () => ({
    isValid,
    reset: () => resetForm(),
    submit: () => submitForm(),
    values,
  }));

  return (
    <div
      style={{
        padding: '1em',
        margin: '0.6em 0 ',
        borderRadius: '0.5em',
        border: isValid ? '0.077em solid green' : '0.077em solid #CCC',
      }}
    >
      <FormWrapper
        dirty={dirty}
        errors={errors}
        name={name}
        onChange={change}
        onFocus={focus}
        schema={schema}
        Template={Raw}
        touched={touched}
        values={values}
      />
    </div>
  );
}

export default forwardRef(SubForm);
