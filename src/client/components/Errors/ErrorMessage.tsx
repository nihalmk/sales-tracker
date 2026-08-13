import React from 'react';
import { Alert } from '@chakra-ui/react';

interface Props {
  error: string;
}
const ErrorMessage: React.FC<Props> = ({ error }) => (
  <React.Fragment>
    {error && (
      <Alert.Root className="alert-align" status="error">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>
            {error.replace('GraphQL error: ', '')}
          </Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )}
    <style jsx global>{``}</style>
  </React.Fragment>
);

export default ErrorMessage;
