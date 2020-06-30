import gql from 'graphql-tag';

export const orderResponse = `{
  _id
  content {
    order_id
    brand_name
    vendor {
      id
      name
    }
    global_entity_id
    delivery {
      location {
        address_text
      }
      provider
    }
  }
  brand
  riderName
  deliveryId
  deliveryIdsGroup
  preparationTime
  receivedTime
  status
  history {
    status
    timestamp
  }
  pickupTime
}`;

export const GET_ORDERS = gql`
  query getOrdersForUser {
    getOrdersForUser ${orderResponse}
  }
`;
