import { gql } from '@apollo/client';

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
  query getPurchasesForUser(
    $date: DateRange!
    $vendor: String
    $page: Float
    $limit: Float
  ) {
    getPurchasesForUser(
      date: $date
      vendor: $vendor
      page: $page
      limit: $limit
    ) {
      items ${purchase}
      totalCount
      totalAmount
    }
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

export const GET_VENDORS = gql`
  query getVendors($includeUnnamed: Boolean) {
    getVendors(includeUnnamed: $includeUnnamed) {
      vendor
      contact
      email
    }
  }
`;

export const GET_LAST_PURCHASE = gql`
  query getLastPurchase {
    getLastPurchase ${purchaseMinimal}
  }
`;

export const GET_PURCHASE_WT_CLOSING = gql`
  query getPurchaseWithoutClosing {
    getPurchaseWithoutClosing ${purchaseMinimal}
  }
`;
