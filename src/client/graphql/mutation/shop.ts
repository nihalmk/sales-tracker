import { gql } from '@apollo/client';

export const CREATE_SHOP = gql`
  mutation createShop($name: String!, $type: String!, $address: AddressInput!) {
    createShop(shop: { name: $name, type: $type, address: $address }) {
      _id
    }
  }
`;

export const UPDATE_SHOP_SETTINGS = gql`
  mutation updateShopSettings(
    $whatsappNumber: String
    $contactEmail: String
    $tagline: String
    $isPublished: Boolean
  ) {
    updateShopSettings(
      settings: {
        whatsappNumber: $whatsappNumber
        contactEmail: $contactEmail
        tagline: $tagline
        isPublished: $isPublished
      }
    ) {
      _id
      slug
      whatsappNumber
      contactEmail
      tagline
      isPublished
    }
  }
`;
