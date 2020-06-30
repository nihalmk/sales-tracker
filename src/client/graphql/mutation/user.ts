import gql from 'graphql-tag';

export const UPDATE_USER = {};

export const RESET_PASSWORD = gql`
  mutation sendResetPasswordEmail($email: String!) {
    sendResetPasswordEmail(email: $email)
  }
`;
