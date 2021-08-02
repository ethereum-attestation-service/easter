import React from 'react';
import {darkBlue} from './utils/colors';
import {FaTimes} from 'react-icons/fa';
import {Modal} from './Modal';

export function Dialog({
  isVisible,
  body,
  onClose,
  title,
  noPadding,
  backgroundColor,
  positionTop,
  style,
  width,
}) {
  if (!isVisible) {
    return null;
  }

  const styles = {

    header: {
      backgroundColor: darkBlue,
      color: '#FFF',
      padding: 8,
      fontSize: 14,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderRadius: '10px 10px 0 0'
    },
    body: {
      padding: noPadding ? 0 : 14,
      backgroundColor: backgroundColor ? backgroundColor : '#FFF',
      borderRadius: '0 0 10px 10px'

    },
    xIcon: {
      cursor: 'pointer',
    },
  };

  return (
    <Modal onClose={onClose} isVisible={isVisible} positionTop={positionTop} style={style} width={width}>
      <div style={styles.container}>
        <div style={styles.header}>
          <div>{title}</div>
          <FaTimes
            color={'#FFF'}
            size={16}
            style={styles.xIcon}
            className={'dialogClose'}
            onClick={onClose}
          />
        </div>
        <div style={styles.body}>{body}</div>
      </div>
    </Modal>
  );
}
