import gql from 'graphql-tag';

export const purchase = `{
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
        total
      }
      billNumber
      vendor
      contact
      email
      total
      createdAt
    }`;

  export const purchaseMinimal = `{
      _id
      createdAt
    }`;

export const GET_PURCHASES = gql`
  query getPurchasesForUser($date: DateRange!) {
    getPurchasesForUser(date: $date) ${purchase}
  }
`;

export const GET_PURCHASE_BY_BILL_NUMBER = gql`
  query getPurchaseByBillNumber($billNumber: String!) {
    getPurchaseByBillNumber(billNumber: $billNumber) ${purchase}
  }
`;

export const GET_PURCHASE_BY_VENDOR = gql`
  query getPurchaseByVendorName($vendor: String!) {
    getPurchaseByVendorName(vendor: $vendor) ${purchase}
  }
`;

export const GET_PURCHASE_BY_CONTACT = gql`
  query getPurchaseByVendorPhone($contact: String!) {
    getPurchaseByVendorPhone(contact: $contact) ${purchase}
  }
`;

export const GET_LAST_PURCHASE = gql`
  query getLastPurchase {
    getLastPurchase ${purchaseMinimal}
  }
`;
