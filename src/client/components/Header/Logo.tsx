import React from 'react';

interface Props {
  setColor?: boolean;
}
export const Logo: React.FC<Props> = ({}) => {
  return (
    <React.Fragment>
      <img src="/static/favicon.ico" className={'h-7 w-7 '} alt="" />
      <style jsx>{``}</style>
    </React.Fragment>
  );
};
