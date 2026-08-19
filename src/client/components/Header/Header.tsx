import {
  Menu,
  Portal,
  Box,
  Flex,
  Heading,
  Text,
  Button,
} from '@chakra-ui/react';
import Link from 'next/link';
import UserContext from '../UserWrapper/UserContext';
import React, { useContext, useEffect, useState } from 'react';
import { Logo } from './Logo';
import { logout } from '../../accounts/login';
import { useRouter } from 'next/router';
import { Pages } from '../../utils/pages';
import moment from 'moment-timezone';
import PopUpMessage from '../common/PopUpMessage';

interface Props {
  hide?: boolean;
}
export const Header: React.FC<Props> = ({ hide }) => {
  const { user, clearContext } = useContext(UserContext);

  const [message, setMessage] = useState('');

  const router = useRouter();

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setMessage('');
      }, 3000);
    }
  }, [message]);

  const getItems = (): Record<string, string | boolean | Function>[] => {
    let itemsObject: Record<string, string | boolean | Function>[] = [
      {
        value: 'Online Store',
        onClick: () => {
          router.push(Pages.STORE_SETTINGS);
        },
        enabled: !!user?.shop,
      },
      {
        value: 'Sign out',
        onClick: async () => {
          await logout();
          await clearContext();
          router.push(Pages.LOGIN);
        },
        enabled: true,
      },
      {
        value: 'Generate DB Backup',
        onClick: async () => {
          const res = await fetch(`${process.env.SERVER_URL || ''}/dbbackup`);
          const message = await res.json();
          setMessage(
            message?.message || "DB Sync queued. Check 'dbbackup' folder",
          );
        },
        enabled: true,
      },
    ];
    return itemsObject.filter((item) => {
      return item.enabled;
    });
  };

  if (hide) {
    return null;
  }

  return (
    <Box position="sticky" top={0} zIndex="docked" className="hide-in-print">
      <Flex bg="brand.700" px={{ base: 3, xl: 6 }} py={2} align="center">
        <Link href="/">
          <Flex align="center">
            <Logo />
          </Flex>
        </Link>
        <Flex direction="column" justify="center" ml={3}>
          <Heading as="h3" size="md" color="white" m={0}>
            {user?.shop?.name || 'Sales Tracker'}
          </Heading>
        </Flex>
        <Flex ml="auto">
          <Menu.Root positioning={{ placement: 'bottom-start' }}>
            {/* @ts-expect-error Chakra v3's Ark UI-derived MenuTriggerProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
            <Menu.Trigger asChild>
              <Button
                variant="ghost"
                color="white"
                p={7}
                _hover={{ bg: 'brand.600' }}
              >
                {user && (
                  <Box
                    display={{ base: 'none', sm: 'block' }}
                    ml={2}
                    textAlign="left"
                  >
                    <Text fontWeight="bold" fontSize="sm">
                      {user?.fullName}
                    </Text>
                    <Text fontSize="xs">{user?.role}</Text>
                    <Text fontSize="xs" fontWeight="semibold">
                      {moment().format('DD/MM/YYYY')}
                    </Text>
                  </Box>
                )}
              </Button>
            </Menu.Trigger>
            <Portal>
              {/* @ts-expect-error Chakra v3's Ark UI-derived MenuPositionerProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
              <Menu.Positioner>
                {/* @ts-expect-error Chakra v3's Ark UI-derived MenuContentProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
                <Menu.Content>
                  <Menu.Arrow />
                  {getItems().map((item) => (
                    // @ts-expect-error Chakra v3's Ark UI-derived MenuItemProps doesn't model `children` in its polymorphic types, though it renders them fine.
                    <Menu.Item
                      key={item.value as string}
                      value={item.value as string}
                      onClick={item.onClick as () => void}
                      cursor="pointer"
                    >
                      {item.value as string}
                    </Menu.Item>
                  ))}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Flex>
      </Flex>
      <PopUpMessage description={message} show={!!message} />
    </Box>
  );
};
