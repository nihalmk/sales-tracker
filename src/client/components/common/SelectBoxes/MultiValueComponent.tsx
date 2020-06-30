import React from 'react';
const MultiValueComponent: React.FC<any> = (props: any) => {
  const { data } = props;
  return (
    <>
      <span className="selected-item">{`${data.label}`}</span>
      <style jsx>
        {`
          .selected-item {
            margin-top: 3px;
          }
          .selected-item::before {
            content: ', ';
          }
          .selected-item:first-child::before {
            content: '';
          }
        `}
      </style>
    </>
  );
};
export default MultiValueComponent;
