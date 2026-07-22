import React, { createRef, useState } from 'react';
import { useMutation, useNavigate, useLocation } from './lib';
import { Name, IDispatcher, ITACallBacks, IComponents } from './';

import Links from './Links';
import { SchemaDefinition } from './lib';
import Form from './lib/templates/Form';

interface Props {
  dispatcher: IDispatcher;
  name: Name;
  schemaDefinition?: SchemaDefinition<any>;
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
      callBacks && callBacks.new && callBacks.new([`add${name.singular}`]);
    },
    refetchQueries: [{ query: dispatcher.list }],
  });

  function handleCreate() {
    newRef.current.isValid &&
      createItem({ variables: { values: newRef.current.submit() } });
  }
  function handleReset() {
    newRef.current && newRef.current.reset();
  }
  function handleChange() {
    setIsValid(newRef.current.isValid);
  }

  return (
    <div>
      <h5>New {name.singular}</h5>
      <Form
        ref={newRef}
        name={'create'}
        form={schemaDefinition || {}}
        onChange={handleChange}
      />
      <button onClick={handleReset}>Reset</button>
      <button onClick={handleCreate} disabled={!isValid}>
        Submit
      </button>
      <hr />
      {components?.links ? (
        React.createElement(components.links, {
          name,
          dispatcher,
        })
      ) : (
        <Links name={name} dispatcher={dispatcher} />
      )}
    </div>
  );
};
export default New;
