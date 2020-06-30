import pino from 'pino';
import { Message } from '@honestfoodcompany/pubsub';
import { IOrder, IOrderStatus } from '../server/interfaces/order';

const dev = process.env.NODE_ENV !== 'production';

export const logger = pino({
  name: 'gks-server',
  level: dev ? 'debug' : 'info',
  enabled: !(process.env.NO_LOG == 'true'),
});

export const pubsubLogger = pino({
  name: 'gks-pubsub',
  level: dev ? 'debug' : 'info',
  enabled: !(process.env.NO_LOG == 'true'),
});

export const getSubscriptionMessageLogger = (
  subscription: string,
  message: Message,
): pino.Logger =>
  pubsubLogger.child({
    subscription,
    messageId: message?.gCloudMessage?.id,
    publishTime: message?.gCloudMessage?.publishTime,
    receivedTime: new Date(),
  });

export const getDatafridgeMessageLogger = (
  subscriptionMessageLogger: pino.Logger,
  payload: IOrder | IOrderStatus,
): pino.Logger =>
  subscriptionMessageLogger.child({
    orderId: payload?.content?.order_id,
    globalEntityId: payload?.global_entity_id,
  });

export const getGKSOrderMessageLogger = (
  subscriptionMessageLogger: pino.Logger,
  payload: { orderId: string },
): pino.Logger =>
  subscriptionMessageLogger.child({
    orderId: payload?.orderId,
  });

export const getVendorsCacheMessageLogger = (
  subscriptionMessageLogger: pino.Logger,
  payload: { vendors: string[] },
): pino.Logger =>
  subscriptionMessageLogger.child({
    vendors: payload?.vendors,
  });
