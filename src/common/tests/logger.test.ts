import {
  getSubscriptionMessageLogger as getSubscriptionMessageLoggerType,
  getDatafridgeMessageLogger as getDatafridgeMessageLoggerType,
  getGKSOrderMessageLogger as getGKSOrderMessageLoggerType,
} from '../logger';
import { Message } from '@honestfoodcompany/pubsub';
import { IOrder, IOrderStatus } from '../../server/interfaces/order';
import pino from 'pino';

jest
  .spyOn(global, 'Date')
  .mockImplementationOnce((): any => new Date('2020-06-16T08:32:16Z'))
  .mockImplementationOnce((): any => new Date('2020-06-16T08:32:16Z'))
  .mockImplementationOnce((): any => new Date('2020-06-16T08:32:16Z'));

const message = ({
  ack: jest.fn(),
  nack: jest.fn(),
  gCloudMessage: {
    id: '123',
    publishTime: new Date('2020-06-16T08:32:16Z'),
  },
} as unknown) as Message;

const orderPayload = ({
  content: {
    order_id: '456',
    global_entity_id: 'MJM_AT',
  },
} as unknown) as IOrder;

const statusPayload = ({
  content: {
    order_id: '456',
    global_entity_id: 'MJM_AT',
  },
} as unknown) as IOrderStatus;

const orderDocument = {
  orderId: 'abc',
};

jest.mock('pino');

const pinoChildMock = jest.fn(() => 'ok');
//@ts-ignore
pino.mockImplementation(() => ({
  child: pinoChildMock,
}));

let getSubscriptionMessageLogger: typeof getSubscriptionMessageLoggerType;
let getDatafridgeMessageLogger: typeof getDatafridgeMessageLoggerType;
let getGKSOrderMessageLogger: typeof getGKSOrderMessageLoggerType;

describe('logger', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubscriptionMessageLogger', () => {
    beforeAll(() => {
      getSubscriptionMessageLogger = require('../logger')
        .getSubscriptionMessageLogger;
    });

    it('returns a pino logger', () => {
      const subscriptionName = 'test';
      const result = getSubscriptionMessageLogger(subscriptionName, message);
      expect(pinoChildMock).toHaveBeenCalledWith({
        subscription: subscriptionName,
        messageId: message.gCloudMessage?.id,
        publishTime: new Date('2020-06-16T08:32:16Z'),
        receivedTime: new Date('2020-06-16T08:32:16Z'),
      });
      expect(result).toBe('ok');
    });
  });

  describe('getDatafridgeMessageLogger', () => {
    beforeAll(() => {
      getDatafridgeMessageLogger = require('../logger')
        .getDatafridgeMessageLogger;
    });

    it('returns a pino logger for an order payload', () => {
      // const subscriptionName = 'test';
      const result = getDatafridgeMessageLogger(pino(), orderPayload);
      expect(pinoChildMock).toHaveBeenCalledWith({
        orderId: orderPayload?.content?.order_id,
        globalEntityId: orderPayload?.global_entity_id,
      });
      expect(result).toBe('ok');
    });

    it('returns a pino logger for an order status payload', () => {
      // const subscriptionName = 'test';
      const result = getDatafridgeMessageLogger(pino(), statusPayload);
      expect(pinoChildMock).toHaveBeenCalledWith({
        orderId: statusPayload?.content?.order_id,
        globalEntityId: statusPayload?.global_entity_id,
      });
      expect(result).toBe('ok');
    });
  });

  describe('getGKSOrderMessageLogger', () => {
    beforeAll(() => {
      getGKSOrderMessageLogger = require('../logger').getGKSOrderMessageLogger;
    });

    it('returns a pino logger for an order document', () => {
      // const subscriptionName = 'test';
      const result = getGKSOrderMessageLogger(pino(), orderDocument);
      expect(pinoChildMock).toHaveBeenCalledWith({
        orderId: orderDocument.orderId,
      });
      expect(result).toBe('ok');
    });
  });
});
