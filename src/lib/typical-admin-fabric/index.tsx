import React from 'react';
import ReactiveAdmin, {
  IDispatcher,
  ITACallBacks,
  ITASchema,
  IComponents,
} from '../typical-admin';

import Update from './Update';
import List from './List';
import Create from './Create';
import Show from './Show';

interface Props {
  dispatcher: IDispatcher;
  name: any;
  components?: IComponents;
  schemaDefinition: ITASchema;
  callBacks?: ITACallBacks;
  pageSize?: number;
}

const Index: React.FC<Props> = ({
  dispatcher,
  name,
  schemaDefinition,
  components,
  callBacks,
  pageSize = 20,
}) => {
  return (
    <ReactiveAdmin
      dispatcher={dispatcher}
      name={name}
      callBacks={callBacks}
      components={{
        list: (props: any) => <List {...props} pageSize={pageSize} />,
        new: (props: any) => <Create {...props} />,
        show: (props: any) => <Show {...props} />,
        edit: (props: any) => <Update {...props} />,
        ...components,
      }}
      schemaDefinition={schemaDefinition}
    />
  );
};

export default Index;
