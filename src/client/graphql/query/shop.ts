import { gql } from '@apollo/client';

export const GET_SHOP_TYPE = gql`
  query getShopTypes {
    getShopTypes {
      label
      value
    }
  }
`;

export const GET_SHOP_SETTINGS = gql`
  query getShopForUser {
    getShopForUser {
      _id
      name
      slug
      whatsappNumber
      contactEmail
      tagline
      isPublished
    }
  }
`;
