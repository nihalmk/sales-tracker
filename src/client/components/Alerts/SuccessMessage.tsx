import React from 'react';
import { Alert } from '@chakra-ui/react';

interface Props {
  message: string;
  className?: string;
}
const SuccessMessage: React.FC<Props> = ({ message, className = '' }) => (
  <React.Fragment>
    {message && (
      <Alert.Root className={`${className} alert-align`} status="success">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>{message}</Alert.Description>
        </Alert.Content>
      </Alert.Root>
    )}
    <style jsx global>{``}</style>
  </React.Fragment>
);

export default SuccessMessage;
