import React from 'react';
import { Alert } from 'tabler-react';

interface Props {
  message: string;
  className?: string;
}
const SuccessMessage: React.FC<Props> = ({ message, className = '' }) => (
  <React.Fragment>
    {message && (
      <Alert className={`${className} alert-align`} type="success">
        {message}
      </Alert>
    )}
    <style jsx global>{``}</style>
  </React.Fragment>
);

export default SuccessMessage;
