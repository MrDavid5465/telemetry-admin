import React from 'react';
import { PrimaryButton, DefaultButton, Modal, Stack, getStyle } from './lib';

interface Props {
  isOpen: boolean;
  message: any;
  toggle: (response: boolean) => void;
}

const Prompt: React.FC<Props> = ({ isOpen, message, toggle }) => {
  const style = getStyle();
  return (
    <Modal isOpen={isOpen}>
      <Stack className={style.modalHeader}>
        <span className="text-danger">Caution</span>
      </Stack>
      <Stack className={style.modalBody}>{message}</Stack>
      <Stack
        horizontal
        horizontalAlign={'end'}
        className={style.modalBody}
        tokens={{ childrenGap: '0.77em' }}
      >
        <PrimaryButton onClick={() => toggle(true)} text="Yes" />
        <DefaultButton onClick={() => toggle(false)} text="No" />
      </Stack>
    </Modal>
  );
};

export default Prompt;
