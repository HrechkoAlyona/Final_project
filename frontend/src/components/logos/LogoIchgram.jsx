import React from 'react';
import svg from './LogoIchgram.svg';

const LogoIchgram = (props) => {
  return <img src={svg} alt="Ichgram Logo" {...props} />;
};

export default LogoIchgram;