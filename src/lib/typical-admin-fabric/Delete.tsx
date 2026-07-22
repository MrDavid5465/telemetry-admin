import React from 'react';
import { useMutation, Name, PrimaryButton, Stack, useLocation, useNavigate } from './lib';

import Prompt from './Prompt';
import { IDispatcher, ITACallBacks } from '../typical-admin';

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
  const [open, setOpen] = React.useState(false);

  const [removeItem] = useMutation(dispatcher.delete, {
    onCompleted: (data: any) => {
      navigate(pathname.replace(`/${id}/show`, ''));
      callBacks &&
        callBacks.delete &&
        callBacks.delete(data[`remove${name.singular}`]);
    },
    refetchQueries: [{ query: dispatcher.list }],
  });

  function handleSubmit(response = false) {
    setOpen(!open);
    response && removeItem({ variables: { id } });
  }

  return (
    <Stack>
      <PrimaryButton text="Delete" onClick={() => setOpen(true)} />
      <Prompt
        message={`Are you sure you'd like to delete this ${name.singular}?`}
        isOpen={open}
        toggle={handleSubmit}
      />
    </Stack>
  );
};
export default Delete;
