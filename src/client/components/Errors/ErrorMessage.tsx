import React from 'react';
import { Alert } from 'tabler-react';

interface Props {
  error: string;
}
const ErrorMessage: React.FC<Props> = ({ error }) => (
  <React.Fragment>
    {error && (
      <Alert className="alert-align" type="danger">
        {error.replace('GraphQL error: ', '')}
      </Alert>
    )}
    <style jsx global>{``}</style>
  </React.Fragment>
);

export default ErrorMessage;
