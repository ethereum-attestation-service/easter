import React from 'react';
import {darkBlue} from './utils/colors';
import {useIsSmallScreen} from './hooks/useIsSmallScreen';

export function Modal({onClose, children, isVisible, style, positionTop, width='94%'}) {
  const isSmallScreen = useIsSmallScreen();

  const styles = {
    container: {
      position: isSmallScreen ? 'fixed' : 'absolute',
      backgroundColor: '#FFF',
      border: `1px solid ${darkBlue}`,
      top: positionTop ? positionTop : isSmallScreen ? 60 : 150,
      left: '50%',
      transform: 'translateX(-50%)',
      width: width,
      maxWidth: '94%',
      fontFamily: 'Open Sans',
      zIndex: 10000,
      boxShadow: '0 0px 14px hsla(0, 0%, 0%, 0.2)',
      borderRadius: 10
    },
    background: {
      position: 'fixed',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
      backgroundColor: '#00000033',
      zIndex: 5000,
    },
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div style={styles.outer}>
      <div style={styles.background} onClick={onClose} />
      <div style={{...styles.container, ...style}}>{children}</div>
    </div>
  );
}
