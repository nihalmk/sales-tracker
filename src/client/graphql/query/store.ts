import { gql } from '@apollo/client';

export const GET_PUBLIC_SHOP = gql`
  query getPublicShop($slug: String!) {
    getPublicShop(slug: $slug) {
      _id
      name
      slug
      tagline
      whatsappNumber
      contactEmail
    }
  }
`;

export const GET_PUBLIC_SHOP_ITEMS = gql`
  query getPublicShopItems(
    $slug: String!
    $search: String
    $category: String
    $page: Float
    $limit: Float
  ) {
    getPublicShopItems(
      slug: $slug
      search: $search
      category: $category
      page: $page
      limit: $limit
    ) {
      items {
        _id
        shortId
        name
        category
        price {
          list
          sale
        }
        imageUrls
        inStock
      }
      totalCount
    }
  }
`;

export const GET_PUBLIC_SHOP_CATEGORIES = gql`
  query getPublicShopCategories($slug: String!) {
    getPublicShopCategories(slug: $slug)
  }
`;
