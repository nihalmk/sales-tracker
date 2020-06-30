import React from 'react';
import { Card, Alert } from 'tabler-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle } from '@fortawesome/pro-light-svg-icons';

interface Props {
  message: string;
  className?: string;
  success: (success: boolean) => void;
}
const ConfirmationDialog: React.FC<Props> = ({
  message,
  className = '',
  success,
}) => {
  return (
    <React.Fragment>
      <Card className="mb-0">
        <Card.Header>
          <Card.Title>Are you Sure?</Card.Title>
        </Card.Header>
        <Card.Body>
          {message && (
            <Alert className={`${className} alert-align`} type="warning">
              <FontAwesomeIcon icon={faExclamationTriangle}></FontAwesomeIcon>
              {message}
            </Alert>
          )}
        </Card.Body>
        <Card.Footer>
          <button
            type="button"
            className={'btn btn-outline-danger'}
            onClick={() => success(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className={'btn btn-primary ml-auto float-right'}
            onClick={() => success(true)}
          >
            Continue
          </button>
        </Card.Footer>
      </Card>
      <style jsx global>{``}</style>
    </React.Fragment>
  );
};

export default ConfirmationDialog;
