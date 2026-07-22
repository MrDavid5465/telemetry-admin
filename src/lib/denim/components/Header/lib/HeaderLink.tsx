import React from 'react';
import { Link, Stack, getStyle } from '../../../lib';
interface Props {
  to: any;
  children: any;
  className?: string;
  active?: boolean;
}

export const HeaderLink: React.FC<Props> = ({
  to,
  children,
  className = '',
  active,
}) => {
  const style = getStyle();

  return (
    <Link to={to}>
      <Stack
        verticalAlign={'center'}
        className={`${style.headerLinkContainer} ${
          active ? style.headerLinkActive : ''
        }`}
      >
        <span className={`${style.headerLink} ${className}`}>{children}</span>
      </Stack>
    </Link>
  );
};
