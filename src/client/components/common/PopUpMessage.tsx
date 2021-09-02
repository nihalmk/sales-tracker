import React from 'react';

interface Props {
  description?: string;
  show: boolean;
}

const PopUpMessage: React.FC<Props> = ({ description, show }) => {
  return (
    <div
      className={
        show ? 'card p-1 position-fixed stay-at-bottom bg-green' : 'hide'
      }
    >
      <small className="pl-2 white">{description}</small>
      <style jsx global>{`
        .hide {
          visibility: hidden;
        }
        .white {
          color: white;
        }
        .stay-at-bottom {
          transition: visibility 0s, opacity 0.5s ease;
          z-index: 999;
          position: fixed;
          width: 25%;
          bottom: 5%;
          top: auto;
          margin: auto;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 20px;
          cursor: pointer;
          left: auto;
          right: 3%;
        }
      `}</style>
    </div>
  );
};

export default PopUpMessage;
