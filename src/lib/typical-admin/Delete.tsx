import React from 'react';
import { useMutation, useLocation, useNavigate } from './lib';
import { Name, IDispatcher, ITACallBacks } from './';
import { confirmAsync } from '../denim/components/ConfirmDialog';

interface Props {
  dispatcher: IDispatcher;
  id: any;
  name: Name;
  callBacks?: ITACallBacks;
}

const Delete: React.FC<Props> = ({
  dispatcher,
  id,
  name,
  callBacks,
}) => {
  const {pathname} =  useLocation();
  const navigate = useNavigate();
  const [removeItem] = useMutation(dispatcher.delete, {
    onCompleted: (data: any) => {
      navigate(pathname.replace(`/${id}/show`, ''));
      callBacks &&
        callBacks.delete &&
        callBacks.delete(data[`remove${name.singular}`]);
    },
    refetchQueries: [{ query: dispatcher.list }],
  });

  async function handleSubmit() {
    const response = await confirmAsync(
      `Are you sure you'd like to delete this ${name.singular}?`,
      { danger: true },
    );
    response && removeItem({ variables: { id } });
  }

  return (
    <div>
      <button onClick={handleSubmit}>Delete</button>
    </div>
  );
};
export default Delete;
