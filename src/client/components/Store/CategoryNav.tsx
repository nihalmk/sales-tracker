import React from 'react';
import { Box, Button, HStack, Menu, Portal } from '@chakra-ui/react';
import { useOverflowNav } from '../hooks/useOverflowNav';

export const ALL_CATEGORIES = '__all__';

interface Props {
  categories: string[];
  value: string;
  onChange: (value: string) => void;
}

const label = (option: string): string =>
  option === ALL_CATEGORIES ? 'All' : option;

const HamburgerIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path
      d="M4 6h16M4 12h16M4 18h16"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const ChevronDownIcon: React.FC = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Category picker for the storefront. Two independent presentations of the
// same options, switched purely by CSS breakpoint (no JS media-query
// state, so there's no client/server render mismatch):
//  - Mobile: a single button that opens a full-list Menu (a hamburger,
//    functionally) - there's rarely room for even one inline pill.
//  - Desktop: as many pills as fit the available width, an overflow-aware
//    "More" menu for the rest. Width is measured via a hidden clone row
//    (see useOverflowNav) so it adapts to the real rendered width of each
//    category's label, not a guessed breakpoint-based count.
const CategoryNav: React.FC<Props> = ({ categories, value, onChange }) => {
  const options = [ALL_CATEGORIES, ...categories];
  const { containerRef, measureRef, visibleCount } = useOverflowNav({
    count: options.length,
  });
  const visible = options.slice(0, visibleCount);
  const overflow = options.slice(visibleCount);
  const selectedIsOverflowed = overflow.includes(value);

  return (
    <React.Fragment>
      <Box display={{ base: 'block', md: 'none' }}>
        <Menu.Root>
          {/* @ts-expect-error Chakra v3's Ark UI-derived MenuTriggerProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
          <Menu.Trigger asChild>
            <Button variant="outline" size="sm">
              <HamburgerIcon />
              {label(value)}
              <ChevronDownIcon />
            </Button>
          </Menu.Trigger>
          <Portal>
            {/* @ts-expect-error Chakra v3's Ark UI-derived MenuPositionerProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
            <Menu.Positioner>
              {/* @ts-expect-error Chakra v3's Ark UI-derived MenuContentProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
              <Menu.Content maxH="70vh" overflowY="auto">
                {options.map((option) => (
                  // @ts-expect-error Chakra v3's Ark UI-derived MenuItemProps doesn't model `children` in its polymorphic types, though it renders them fine.
                  <Menu.Item
                    key={option}
                    value={option}
                    onClick={() => onChange(option)}
                    fontWeight={value === option ? 'semibold' : 'normal'}
                    cursor="pointer"
                  >
                    {label(option)}
                  </Menu.Item>
                ))}
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Box>

      <Box
        display={{ base: 'none', md: 'block' }}
        position="relative"
        overflow="hidden"
      >
        <HStack ref={containerRef} gap={2} wrap="nowrap" overflow="hidden">
          {visible.map((option) => (
            <Button
              key={option}
              onClick={() => onChange(option)}
              variant={value === option ? 'solid' : 'ghost'}
              colorPalette="brand"
              size="sm"
              borderRadius="full"
              flexShrink={0}
            >
              {label(option)}
            </Button>
          ))}
          {overflow.length > 0 && (
            <Menu.Root>
              {/* @ts-expect-error Chakra v3's Ark UI-derived MenuTriggerProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
              <Menu.Trigger asChild>
                <Button
                  variant={selectedIsOverflowed ? 'solid' : 'ghost'}
                  colorPalette="brand"
                  size="sm"
                  borderRadius="full"
                  flexShrink={0}
                >
                  {selectedIsOverflowed ? label(value) : 'More'}
                  <ChevronDownIcon />
                </Button>
              </Menu.Trigger>
              <Portal>
                {/* @ts-expect-error Chakra v3's Ark UI-derived MenuPositionerProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
                <Menu.Positioner>
                  {/* @ts-expect-error Chakra v3's Ark UI-derived MenuContentProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
                  <Menu.Content maxH="60vh" overflowY="auto">
                    {overflow.map((option) => (
                      // @ts-expect-error Chakra v3's Ark UI-derived MenuItemProps doesn't model `children` in its polymorphic types, though it renders them fine.
                      <Menu.Item
                        key={option}
                        value={option}
                        onClick={() => onChange(option)}
                        fontWeight={value === option ? 'semibold' : 'normal'}
                        cursor="pointer"
                      >
                        {label(option)}
                      </Menu.Item>
                    ))}
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          )}
        </HStack>

        {/* Off-screen clones, one per option, purely so their real rendered
            width can be measured - see useOverflowNav. Never visible. */}
        <HStack
          position="absolute"
          top="-9999px"
          left="-9999px"
          gap={2}
          wrap="nowrap"
          aria-hidden
        >
          {options.map((option, i) => (
            <Button
              key={option}
              ref={measureRef(i)}
              size="sm"
              borderRadius="full"
              flexShrink={0}
              tabIndex={-1}
            >
              {label(option)}
            </Button>
          ))}
        </HStack>
      </Box>
    </React.Fragment>
  );
};

export default CategoryNav;
