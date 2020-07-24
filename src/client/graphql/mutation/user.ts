import gql from 'graphql-tag';

export const UPDATE_USER = {};

export const RESET_PASSWORD = gql`
  mutation sendResetPasswordEmail($email: String!) {
    sendResetPasswordEmail(email: $email)
  }
`;

export const CREATE_NEW_USER = gql`
  mutation createNewUser($user: CreateUserInput!) {
    createNewUser(user: $user)
  }
`;
