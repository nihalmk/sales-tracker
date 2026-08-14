import React from 'react';
import { Box, Card, HStack, Heading } from '@chakra-ui/react';
import Icon, { IconName } from './Icon';

const ChevronDownIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M6 9l6 6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface Props {
  icon: IconName;
  label: string;
  isOpen: boolean;
  onToggle: () => void;
  badge?: React.ReactNode;
  id?: string;
  children?: React.ReactNode;
}

// A single clickable disclosure header (icon + label + optional total
// badge + chevron) — replaces the old "heading, then a separate full-width
//'View X' button" pair with one row that reads as expand/collapse rather
// than a generic action button.
const ExpandableSection: React.FC<Props> = ({
  icon,
  label,
  isOpen,
  onToggle,
  badge,
  id,
  children,
}) => (
  <Card.Root variant="outline" mb={4} overflow="hidden" id={id}>
    <HStack
      as="button"
      onClick={onToggle}
      w="full"
      justify="space-between"
      px={4}
      py={3}
      gap={3}
      cursor="pointer"
      textAlign="left"
      bg={isOpen ? 'brand.subtle' : 'bg.panel'}
      _hover={{ bg: 'brand.subtle' }}
      transition="background-color 0.15s"
    >
      <HStack gap={2} color={isOpen ? 'brand.fg' : undefined}>
        <Icon name={icon} boxSize={5} />
        <Heading size="sm">{label}</Heading>
      </HStack>
      <HStack gap={3}>
        {badge}
        <Box
          color="fg.muted"
          lineHeight={0}
          transform={isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}
          transition="transform 0.2s"
        >
          <ChevronDownIcon />
        </Box>
      </HStack>
    </HStack>
    {isOpen && <Card.Body pt={4}>{children}</Card.Body>}
  </Card.Root>
);

export default ExpandableSection;
