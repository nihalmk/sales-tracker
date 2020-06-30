import React from 'react';
interface Props {
  children?: object;
  className?: string;
}
const OverLay: React.FC<Props> = ({ children, className }) => {
  return (
    <>
      <div id="layout" key="layout" className={'container-overlay'}>
        <div className={`overlay-content${className ? ` ${className}` : ''}`}>
          {children}
        </div>
      </div>
      <style jsx global>
        {`
          .container-overlay {
            display: block;
            position: fixed; /* Stay in place */
            z-index: 2010; /* Sit on top */
            padding-top: 100px;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            overflow: auto;
            background-color: rgb(0, 0, 0);
            background-color: rgba(0, 0, 0, 0.4);
          }
          .overlay-content {
            background-color: #fefefe;
            border-radius: 3px;
            margin: auto;
            margin-bottom: 20px;
            border: 1px solid #888;
            width: 65%;
          }
        `}
      </style>
    </>
  );
};

export default OverLay;
