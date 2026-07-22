import React from 'react';
import { Stack, Name, useQuery, useLocation, useNavigate } from './lib';
import DetailsList from './lib/List';

import Links from './Links';
import { IDispatcher, DisplaySchema, IComponents } from '../typical-admin';
import Subscriber from '../typical-admin/Subscriber';

interface Props {
  dispatcher: IDispatcher;
  name: Name;
  schemaDefinition: DisplaySchema<any>;
  pageSize?: number;
  components?: IComponents;
  // Overrides the query's result field — defaults to `get${name.plural}`.
  // Mirrors CardList's same-named prop, needed when the display-plural label
  // doesn't match the actual resolver name.
  queryResultKey?: string;
  // Suppresses the built-in "Listing X" heading + Links row, for callers
  // (e.g. SwitchableList) embedding this with their own shared header.
  hideHeader?: boolean;
  // Which item field goes into the show-route URL — defaults to 'id'.
  // Mirrors CardList's same-named prop, e.g. for records keyed by a
  // human-readable name elsewhere in the app.
  idField?: string;
}

const List: React.FC<Props> = ({
  dispatcher,
  name,
  schemaDefinition,
  pageSize,
  components,
  queryResultKey,
  hideHeader,
  idField,
}) => {
  const {pathname} =  useLocation();
  const navigate = useNavigate();
  const queryName = queryResultKey ?? `get${name.plural}`;
  const { data: items, error, loading, refetch } : { data?: any; error?: any; loading?: boolean; refetch?: () => void } = useQuery(dispatcher.list);
  if (error) {
    return <span>{`error: ${error}`}</span>;
  }

  if (loading) {
    return <span>{`loading...`}</span>;
  }
  return (
    <Stack>
      {dispatcher.subscribe && (
        <Subscriber
          document={dispatcher.subscribe}
          options={{ onSubscriptionData: () => refetch() }}
        />
      )}
      {!hideHeader && (
        <Stack
          horizontal
          horizontalAlign={'space-between'}
          verticalAlign={'center'}
        >
          <h3>Listing {name.plural}</h3>
          {components?.links ? (
            React.createElement(components.links, {
              name,
              dispatcher,
            })
          ) : (
            <Links name={name} dispatcher={dispatcher} />
          )}
        </Stack>
      )}
      <DetailsList
        pageSize={pageSize}
        name={name.plural}
        schema={schemaDefinition}
        onSelect={(item) => {
          navigate(`${pathname}/${item[idField ?? 'id']}/show`, item);
        }}
        items={items[queryName] || []}
      />
      <br />
    </Stack>
  );
};
export default List;
