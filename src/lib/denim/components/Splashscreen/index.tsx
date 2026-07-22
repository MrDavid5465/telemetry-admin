import React from 'react';
import { getStyle } from '../../lib';

interface Props {
  Icon: React.FC<any>;
}

const Index: React.FC<Props> = ({ Icon }) => {
  const style = getStyle();
  return (
    <div className={style.splashScreen}>
      <header className={style.appHeader}>
        <Icon className={style.appLogo} />
      </header>
    </div>
  );
};

export default Index;
