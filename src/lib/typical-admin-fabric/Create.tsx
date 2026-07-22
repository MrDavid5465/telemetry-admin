import React, { createRef, useState } from 'react';
import { Name, DefaultButton, PrimaryButton, Form } from './lib';
import { useMutation, Stack, Separator, useLocation, useNavigate } from './lib';

import Links from './Links';
import { SchemaDefinition } from '../per-form';
import { IDispatcher, ITACallBacks, IComponents } from '../typical-admin';
import { getStyle } from './lib';

interface Props {
  dispatcher: IDispatcher;
  name: Name;
  schemaDefinition: SchemaDefinition<any>;
  callBacks?: ITACallBacks;
  components?: IComponents;
}

const New: React.FC<Props> = ({
  dispatcher,
  name,
  schemaDefinition,
  callBacks,
  components,
}) => {
  const {pathname} =  useLocation();
  const navigate = useNavigate();
  const newRef: React.RefObject<any> = createRef();
  const [isValid, setIsValid] = useState(false);
  const [createItem] = useMutation(dispatcher.new, {
    onCompleted: (data: any) => {
      navigate(
        pathname.replace('new', `${data[`add${name.singular}`].id}/show`)
      );
      callBacks && callBacks.new && callBacks.new(data[`add${name.singular}`]);
    },
    refetchQueries: [{ query: dispatcher.list }],
  });

  function handleCreate() {
    newRef.current.isValid &&
      createItem({
        variables: {
          values: newRef.current.submit(),
        },
      });
  }
  function handleReset() {
    newRef.current && newRef.current.reset();
  }
  function handleChange() {
    setIsValid(newRef.current.isValid);
  }
  const style = getStyle();
  return (
    <Stack>
      <Stack
        horizontal
        horizontalAlign={'space-between'}
        verticalAlign={'center'}
      >
        <h5>New {name.singular}</h5>
        {components?.links ? (
          React.createElement(components.links, {
            name,
            dispatcher,
          })
        ) : (
          <Links name={name} dispatcher={dispatcher} />
        )}
      </Stack>
      <Stack className={style.md}>
        <Form
          ref={newRef}
          name={'create'}
          form={schemaDefinition}
          onChange={handleChange}
          fieldProps={schemaDefinition}
        />
        <Stack horizontal tokens={{ childrenGap: '0.77em' }}>
          <PrimaryButton onClick={handleCreate} disabled={!isValid}>
            Submit
          </PrimaryButton>
          <DefaultButton onClick={handleReset}>Reset</DefaultButton>
        </Stack>
      </Stack>
      <Separator />
    </Stack>
  );
};

export default New;
