import React, { useContext, useEffect, useRef } from 'react';
import { Box, Card, Button, HStack } from '@chakra-ui/react';
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
}[] = [
  { key: NavItems.SALES, label: 'Sales', icon: 'sales' },
  { key: NavItems.PURCHASES, label: 'Purchases', icon: 'purchases' },
  { key: NavItems.STOCK, label: 'Stock', icon: 'stock' },
  { key: NavItems.SALE, label: 'New Sale', icon: 'newSale' },
  { key: NavItems.PURCHASE, label: 'New Purchase', icon: 'newPurchase' },
  { key: NavItems.CLOSING, label: 'Closing', icon: 'closing' },
  { key: NavItems.REPORT, label: 'Report', icon: 'report' },
];

const Navigation: React.FC<{}> = ({}) => {
  const { setSelectedMenu, enabledNavItems, selectedMenu } =
    useContext(UserContext);

  const router = useRouter();
  // Tracks whether the next selectedMenu change came from reading the URL
  // (below), so the write-back effect doesn't immediately fight it with a
  // stale pre-sync value and overwrite the query param it just set.
  const syncingFromUrl = useRef(false);

  useEffect(() => {
    // router.query.selected holds a NavItems *value* (e.g. 'stock'), not a
    // key ('STOCK') — validate against the known values, not a key lookup.
    const requested = router.query.selected as string;
    if (
      requested &&
      requested !== selectedMenu &&
      Object.values(NavItems).includes(requested)
    ) {
      syncingFromUrl.current = true;
      setSelectedMenu(requested);
    }
  }, [router.query.selected]);

  useEffect(() => {
    if (syncingFromUrl.current) {
      syncingFromUrl.current = false;
      return;
    }
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
          {navButtons.map(({ key, label, icon }) => {
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
                aria-label={label}
                px={{ base: 2, md: 3 }}
              >
                <Icon name={icon} light={isActive} />
                <Box as="span" display={{ base: 'none', md: 'inline' }}>
                  {label}
                </Box>
              </Button>
            );
          })}
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};

export default Navigation;
