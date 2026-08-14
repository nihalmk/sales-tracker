import React from 'react';
import { Card, Alert, Button, HStack } from '@chakra-ui/react';
import Icon from '../common/Icon';

interface Props {
  message: string;
  headerMessage?: string;
  className?: string;
  success: (success: boolean) => void;
}
const ConfirmationDialog: React.FC<Props> = ({
  message,
  headerMessage,
  className = '',
  success,
}) => {
  return (
    <Card.Root mb={0} variant="elevated">
      <Card.Header>
        <Card.Title>{headerMessage || 'Are you Sure?'}</Card.Title>
      </Card.Header>
      <Card.Body>
        {message && (
          <Alert.Root className={className} status="warning" borderRadius="l2">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>{message}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        )}
      </Card.Body>
      <Card.Footer>
        <HStack ml="auto" gap={3}>
          <Button
            type="button"
            variant="outline"
            colorPalette="red"
            onClick={() => success(false)}
          >
            <Icon name="cancel" />
            Cancel
          </Button>
          <Button
            type="button"
            colorPalette="brand"
            onClick={() => success(true)}
          >
            <Icon name="done" light />
            Continue
          </Button>
        </HStack>
      </Card.Footer>
    </Card.Root>
  );
};

export default ConfirmationDialog;
