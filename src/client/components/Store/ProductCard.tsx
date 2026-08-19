import React from 'react';
import { Card, Box, Text, Badge, AspectRatio, Image } from '@chakra-ui/react';
import { PublicItem } from '../../generated/graphql';
import { getCategoryPlaceholderImage } from '../../utils/categoryPlaceholders';

interface Props {
  item: PublicItem;
  onClick: () => void;
}

// Shared by the card and the detail modal so a discount always reads
// identically in both places.
export const discountPercent = (list: number, sale: number): number =>
  list > 0 && sale > 0 && sale < list
    ? Math.round(((list - sale) / list) * 100)
    : 0;

const ProductCard: React.FC<Props> = ({ item, onClick }) => {
  const { list, sale } = item.price;
  const discount = discountPercent(list, sale);
  const mainImage = item.imageUrls?.[0] || getCategoryPlaceholderImage(item.category);

  return (
    <Card.Root
      overflow="hidden"
      cursor="pointer"
      transition="transform 0.15s, box-shadow 0.15s"
      _hover={{ transform: 'translateY(-3px)', shadow: 'lg' }}
      onClick={onClick}
      borderRadius="l3"
    >
      <Box position="relative">
        <AspectRatio ratio={1}>
          <Image src={mainImage} alt={item.name} objectFit="cover" />
        </AspectRatio>
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
        {!item.inStock && (
          <Badge
            position="absolute"
            top={2}
            right={2}
            colorPalette="gray"
            variant="solid"
            borderRadius="full"
            px={2}
          >
            Out of Stock
          </Badge>
        )}
      </Box>
      <Card.Body p={3}>
        {item.category && (
          <Text fontSize="xs" color="fg.muted" mb={1} truncate>
            {item.category}
          </Text>
        )}
        <Text fontWeight="semibold" fontSize="sm" lineClamp={2} minH="2.5em">
          {item.name}
        </Text>
        <Box mt={2}>
          <Text as="span" fontWeight="bold" fontSize="md" color="brand.700">
            ₹{sale}
          </Text>
          {discount > 0 && (
            <Text
              as="span"
              ml={2}
              fontSize="xs"
              color="fg.muted"
              textDecoration="line-through"
            >
              ₹{list}
            </Text>
          )}
        </Box>
      </Card.Body>
    </Card.Root>
  );
};

export default ProductCard;
