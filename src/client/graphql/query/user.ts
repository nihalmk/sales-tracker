import gql from 'graphql-tag';

export const GET_USER = gql`
  query Me {
    me {
      _id
      emails {
        address
      }
      fullName
      firstName
      lastName
      roles
      role
      paid
      registeredAt
      shop {
        _id
        name
        timezone
      }
    }
  }
`;
