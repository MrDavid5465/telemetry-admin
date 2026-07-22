import React from 'react';
import { Link, useLocation } from './lib';
import { Name, IDispatcher } from './';
interface Props {
  name: Name;
  dispatcher: IDispatcher;
}
const Links: React.FC<Props> = ({  name, dispatcher }) => {
  const { pathname, state } = useLocation()
  console.log(state)
  const urls = {
    edit: new RegExp(`/edit$`),
    new: new RegExp(`/new$`),
    root: new RegExp(`/${name.plural.toLowerCase()}$`),
    show: new RegExp(`/show$`),
  };

  if (urls.show.test(pathname)) {
    return (
      <>
        {dispatcher.edit && (
          <>
            <Link to={`${pathname.replace('show', 'edit')}`}>Edit</Link> |{' '}
          </>
        )}
        <Link to={`${pathname.replace(`/${state.params.id}/show`, '')}`}>
          Back
        </Link>
      </>
    );
  } else if (urls.edit.test(pathname)) {
    return <Link to={`${pathname.replace('edit', 'show')}`}>Back</Link>;
  } else if (urls.new.test(pathname)) {
    return <Link to={`${pathname.replace(`/new`, '')}`}>Back</Link>;
  } else if (urls.root.test(pathname)) {
    return (
      <>
        {dispatcher.new && (
          <>
            <Link to={`${pathname}/new`}>New</Link> |{' '}
          </>
        )}
        <Link to={`${pathname.replace(pathname, '')}`}>Back</Link>
      </>
    );
  } else {
    return null;
  }
};
export default Links;
