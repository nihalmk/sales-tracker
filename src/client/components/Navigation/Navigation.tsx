import React, { useContext, useEffect } from 'react';
import { Card, Button, HStack } from '@chakra-ui/react';
import UserContext from '../UserWrapper/UserContext';
import { useRouter } from 'next/router';
import { Pages } from '../../utils/pages';
import Icon, { IconName } from '../common/Icon';

export const NavItems: { [key: string]: string } = {
  SALES: 'sales',
  PURCHASES: 'purchases',
  STOCK: 'stock',
  SALE: 'sale',
  PURCHASE: 'purchase',
  CLOSING: 'closing',
  REPORT: 'report',
};

const navButtons: {
  key: string;
  label: string;
  icon: IconName;
  hideOnSmall?: boolean;
}[] = [
  { key: NavItems.SALES, label: 'Sales', icon: 'sales' },
  { key: NavItems.PURCHASES, label: 'Purchases', icon: 'purchases' },
  { key: NavItems.STOCK, label: 'Stock', icon: 'stock', hideOnSmall: true },
  { key: NavItems.SALE, label: 'New Sale', icon: 'newSale', hideOnSmall: true },
  {
    key: NavItems.PURCHASE,
    label: 'New Purchase',
    icon: 'newPurchase',
    hideOnSmall: true,
  },
  {
    key: NavItems.CLOSING,
    label: 'Closing',
    icon: 'closing',
    hideOnSmall: true,
  },
  { key: NavItems.REPORT, label: 'Report', icon: 'report', hideOnSmall: true },
];

const Navigation: React.FC<{}> = ({}) => {
  const { setSelectedMenu, enabledNavItems, selectedMenu } =
    useContext(UserContext);

  const router = useRouter();

  useEffect(() => {
    const path = NavItems[router.query.selected as string];
    if (path) {
      setSelectedMenu(path);
    }
  }, [router.query.selected]);

  useEffect(() => {
    if (router.query.selected !== selectedMenu) {
      router.push({
        pathname: Pages.DASHBOARD,
        query: {
          selected: selectedMenu || NavItems.SALES,
        },
      });
    }
  }, [selectedMenu]);
  return (
    <Card.Root
      className="hide-in-print"
      mb={0}
      mt={0}
      variant="subtle"
      borderRadius="l2"
    >
      <Card.Body p={3}>
        <HStack gap={2} wrap="wrap">
          {navButtons.map(({ key, label, icon, hideOnSmall }) => {
            const isActive = selectedMenu === key;
            return (
              <Button
                key={key}
                type="button"
                size="sm"
                colorPalette="brand"
                variant={isActive ? 'solid' : 'outline'}
                disabled={!enabledNavItems[key]}
                onClick={() => setSelectedMenu(key)}
                display={
                  hideOnSmall ? { base: 'none', md: 'inline-flex' } : undefined
                }
              >
                <Icon name={icon} light={isActive} />
                {label}
              </Button>
            );
          })}
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};

export default Navigation;
