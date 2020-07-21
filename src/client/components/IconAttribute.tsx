import React from "react";

export const IconAttribute = () => {
  return (
    <React.Fragment>
      <small className="right-bottom mr-2">
        Icons made by{' '}
        <a
          href="https://www.flaticon.com/authors/smashicons"
          title="Smashicons"
        >
          Smashicons
        </a>{' '}
        from{' '}
        <a href="https://www.flaticon.com/" title="Flaticon">
          {' '}
          www.flaticon.com
        </a>
      </small>
      <style jsx>{`
        .right-bottom {
          right: 0;
          bottom: 0;
          position: relative;
          float: right;
        }
      `}</style>
    </React.Fragment>
  );
};
