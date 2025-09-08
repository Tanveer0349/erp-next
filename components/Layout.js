import React from 'react';
import BackButton from './BackButton';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <BackButton variant='primary'/>
      {children}
    </div>
  );
};

export default Layout;