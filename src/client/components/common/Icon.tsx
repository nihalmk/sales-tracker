import React from 'react';
import { Image, ImageProps } from '@chakra-ui/react';

const ICONS = {
  sales: '/static/icons/sales.png',
  purchases: '/static/icons/purchases.png',
  stock: '/static/icons/stock.png',
  newSale: '/static/icons/new-sale.png',
  newPurchase: '/static/icons/new-purchase.png',
  closing: '/static/icons/closing.png',
  report: '/static/icons/report.png',
  shop: '/static/icons/shop.png',
  register: '/static/icons/register.png',
  login: '/static/icons/login.png',
  forgotPassword: '/static/icons/forgot-password.png',
  resetPassword: '/static/icons/reset-password.png',
  expenses: '/static/icons/expenses.png',
  received: '/static/icons/received.png',
  add: '/static/icons/add.png',
  edit: '/static/icons/edit.png',
  done: '/static/icons/done-icon.png',
  remove: '/static/icons/remove.png',
  cancel: '/static/icons/cancel.png',
  print: '/static/icons/print.png',
  search: '/static/icons/search.png',
} as const;

export type IconName = keyof typeof ICONS;

interface Props extends Omit<ImageProps, 'src'> {
  name: IconName;
  /** Use on solid/dark button backgrounds so the icon reads as white instead of black. */
  light?: boolean;
}

export const Icon: React.FC<Props> = ({
  name,
  light,
  boxSize = 4,
  ...rest
}) => (
  <Image
    src={ICONS[name]}
    alt=""
    boxSize={boxSize}
    filter={light ? 'brightness(0) invert(1)' : undefined}
    {...rest}
  />
);

export default Icon;
