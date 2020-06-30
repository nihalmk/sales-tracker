import { ObjectId } from 'mongodb';

export const subscriptionsTopics = {
  NEW_ORDER: 'NEW_ORDER',
  UPDATED_ORDER: 'UPDATED_ORDER',
};

export interface newOrderPayload {
  kitchen: ObjectId;
  orderId: ObjectId;
}

export interface updateOrderPayload {
  kitchen: ObjectId;
  orderId: ObjectId;
}
