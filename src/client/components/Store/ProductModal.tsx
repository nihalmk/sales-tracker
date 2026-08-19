import React, { useState } from 'react';
import {
  Dialog,
  Portal,
  Box,
  Text,
  Badge,
  IconButton,
  AspectRatio,
  Image,
  HStack,
  VStack,
} from '@chakra-ui/react';
import { PublicItem } from '../../generated/graphql';
import { getCategoryPlaceholderImage } from '../../utils/categoryPlaceholders';
import { discountPercent } from './ProductCard';

interface Props {
  item: PublicItem;
  onClose: () => void;
}

const ChevronIcon: React.FC<{ direction: 'left' | 'right' }> = ({
  direction,
}) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d={direction === 'left' ? 'M15 18l-6-6 6-6' : 'M9 18l6-6-6-6'}
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// A larger, read-only version of the item's images + full pricing detail,
// opened from a ProductCard click. Unlike the shop-owner-facing
// ItemImagesModal, nothing here is editable - this is what a customer sees.
const ProductModal: React.FC<Props> = ({ item, onClose }) => {
  const images =
    item.imageUrls && item.imageUrls.length > 0
      ? item.imageUrls
      : [getCategoryPlaceholderImage(item.category)];
  const [index, setIndex] = useState(0);
  const { list, sale } = item.price;
  const discount = discountPercent(list, sale);

  return (
    <Dialog.Root
      open
      onOpenChange={(details: { open: boolean }) => !details.open && onClose()}
      size="lg"
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        {/* @ts-expect-error Chakra v3's Ark UI-derived DialogPositionerProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
        <Dialog.Positioner>
          {/* @ts-expect-error Chakra v3's Ark UI-derived DialogContentProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
          <Dialog.Content borderRadius="l3" overflow="hidden">
            {/* @ts-expect-error Chakra v3's Ark UI-derived DialogCloseTriggerProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
            <Dialog.CloseTrigger asChild>
              <IconButton
                aria-label="Close"
                variant="ghost"
                position="absolute"
                top={2}
                right={2}
                zIndex={1}
                borderRadius="full"
                bg="bg.panel"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </IconButton>
            </Dialog.CloseTrigger>
            <Dialog.Body p={0}>
              <Box position="relative">
                <AspectRatio ratio={1}>
                  <Image
                    src={images[index]}
                    alt={item.name}
                    objectFit="cover"
                  />
                </AspectRatio>
                {images.length > 1 && (
                  <React.Fragment>
                    <IconButton
                      aria-label="Previous image"
                      position="absolute"
                      left={2}
                      top="50%"
                      transform="translateY(-50%)"
                      borderRadius="full"
                      size="sm"
                      onClick={() =>
                        setIndex((i) => (i - 1 + images.length) % images.length)
                      }
                    >
                      <ChevronIcon direction="left" />
                    </IconButton>
                    <IconButton
                      aria-label="Next image"
                      position="absolute"
                      right={2}
                      top="50%"
                      transform="translateY(-50%)"
                      borderRadius="full"
                      size="sm"
                      onClick={() => setIndex((i) => (i + 1) % images.length)}
                    >
                      <ChevronIcon direction="right" />
                    </IconButton>
                    <HStack
                      position="absolute"
                      bottom={2}
                      left="50%"
                      transform="translateX(-50%)"
                      gap={1}
                    >
                      {images.map((_url, i) => (
                        <Box
                          key={i}
                          boxSize="6px"
                          borderRadius="full"
                          bg={i === index ? 'white' : 'whiteAlpha.600'}
                          boxShadow="0 0 0 1px rgba(0,0,0,0.2)"
                        />
                      ))}
                    </HStack>
                  </React.Fragment>
                )}
                {discount > 0 && (
                  <Badge
                    position="absolute"
                    top={2}
                    left={2}
                    colorPalette="red"
                    variant="solid"
                    borderRadius="full"
                    px={2}
                  >
                    {discount}% OFF
                  </Badge>
                )}
              </Box>
              <VStack align="stretch" gap={2} p={5}>
                {item.category && (
                  <Text
                    fontSize="xs"
                    color="fg.muted"
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    {item.category}
                  </Text>
                )}
                {/* @ts-expect-error Chakra v3's Ark UI-derived DialogTitleProps doesn't model `children` in its polymorphic types, though it renders them fine. */}
                <Dialog.Title fontSize="lg" fontWeight="bold">
                  {item.name}
                </Dialog.Title>
                <HStack>
                  <Text fontWeight="bold" fontSize="2xl" color="brand.700">
                    ₹{sale}
                  </Text>
                  {discount > 0 && (
                    <Text
                      fontSize="md"
                      color="fg.muted"
                      textDecoration="line-through"
                    >
                      ₹{list}
                    </Text>
                  )}
                </HStack>
                {!item.inStock && (
                  <Badge colorPalette="gray" variant="subtle" w="fit-content">
                    Out of Stock
                  </Badge>
                )}
              </VStack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ProductModal;
