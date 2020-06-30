import React from 'react';
import { Logo } from '../Header/Logo';

const Loader = () => (
  <React.Fragment>
    <div className={'dimmer active p-5'}>
      <div className="loader">
        <Logo setColor />
      </div>
      <div className="dimmer-content">Loading...</div>
    </div>
    <style jsx global>{``}</style>
  </React.Fragment>
);

export default Loader;
