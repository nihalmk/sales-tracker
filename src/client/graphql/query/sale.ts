import gql from 'graphql-tag';

export const sale = `{
      _id
      items {
        item {
          shortId
          name
          price {
            cost
            list
          }
        }
        quantity
        cost
        discount
        total
      }
      billNumber
      customer
      contact
      email
      total
      discount
      profit
      loss
      createdAt
    }`;

export const saleMinimal = `{
      _id
      createdAt
    }`;

export const GET_SALES = gql`
  query getSalesForUser($date: DateRange!) {
    getSalesForUser(date: $date) ${sale}
  }
`;

export const GET_SALE_BY_BILL_NUMBER = gql`
  query getSaleByBillNumber($billNumber: String!) {
    getSaleByBillNumber(billNumber: $billNumber) ${sale}
  }
`;

export const GET_SALE_BY_CUSTOMER = gql`
  query getSaleByCustomerName($customer: String!) {
    getSaleByCustomerName(customer: $customer) ${sale}
  }
`;

export const GET_SALE_BY_CONTACT = gql`
  query getSaleByCustomerPhone($contact: String!) {
    getSaleByCustomerPhone(contact: $contact) ${sale}
  }
`;

export const GET_LAST_SALE = gql`
  query getLastSale {
    getLastSale ${saleMinimal}
  }
`;

export const GET_SALE_WT_CLOSING = gql`
  query getSaleWithoutClosing {
    getSaleWithoutClosing ${saleMinimal}
  }
`;
