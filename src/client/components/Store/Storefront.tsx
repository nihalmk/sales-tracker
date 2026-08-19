import React, { useState, useEffect, ChangeEvent } from 'react';
import { useQuery } from '@apollo/client';
import {
  GET_PUBLIC_SHOP_ITEMS,
  GET_PUBLIC_SHOP_CATEGORIES,
} from '../../graphql/query/store';
import { PublicItem, PublicShop } from '../../generated/graphql';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import ProductCard from './ProductCard';
import ProductModal from './ProductModal';
import ContactBubbles from './ContactBubbles';
import CategoryNav, { ALL_CATEGORIES } from './CategoryNav';
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  InputGroup,
  Input,
  Skeleton,
  VStack,
} from '@chakra-ui/react';

const PAGE_SIZE = 24;
const SEARCH_DEBOUNCE_MS = 600;

const SearchIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

interface Props {
  shop: PublicShop;
}

const Storefront: React.FC<Props> = ({ shop }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [category, setCategory] = useState(ALL_CATEGORIES);
  const [selectedItem, setSelectedItem] = useState<PublicItem>();

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedSearch(searchTerm.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: categoriesData } = useQuery(GET_PUBLIC_SHOP_CATEGORIES, {
    variables: { slug: shop.slug },
    fetchPolicy: 'cache-first',
  });
  const categories: string[] = categoriesData?.getPublicShopCategories || [];

  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    retry,
    sentinelRef,
  } = useInfiniteScroll({
    query: GET_PUBLIC_SHOP_ITEMS,
    variables: {
      slug: shop.slug,
      search: appliedSearch || undefined,
      category: category === ALL_CATEGORIES ? undefined : category,
    },
    pageSize: PAGE_SIZE,
    getItems: (data): PublicItem[] => data?.getPublicShopItems?.items || [],
    getTotalCount: (data) => data?.getPublicShopItems?.totalCount || 0,
  });

  return (
    <Box minH="100vh" bg="gray.50">
      <Box
        bgGradient="to-br"
        gradientFrom="brand.700"
        gradientTo="brand.500"
        color="white"
        px={{ base: 4, md: 10 }}
        pt={{ base: 8, md: 12 }}
        pb={{ base: 16, md: 20 }}
      >
        <Heading size={{ base: 'xl', md: '2xl' }} fontWeight="bold">
          {shop.name}
        </Heading>
        {shop.tagline && (
          <Text mt={2} fontSize={{ base: 'sm', md: 'md' }} opacity={0.9} maxW="2xl">
            {shop.tagline}
          </Text>
        )}
      </Box>

      <Box maxW="7xl" mx="auto" px={{ base: 4, md: 8 }} mt={{ base: -10, md: -12 }} pb={20}>
        <Box bg="white" borderRadius="l3" shadow="lg" p={{ base: 3, md: 4 }} mb={6}>
          <InputGroup startElement={<SearchIcon />}>
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              bg="white"
              size="lg"
            />
          </InputGroup>

          {categories.length > 0 && (
            <Box mt={4}>
              <CategoryNav categories={categories} value={category} onChange={setCategory} />
            </Box>
          )}
        </Box>

        {loading ? (
          <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={{ base: 3, md: 5 }}>
            {Array.from({ length: 10 }).map((_unused, i) => (
              <Skeleton key={i} h="260px" borderRadius="l3" />
            ))}
          </SimpleGrid>
        ) : error ? (
          <VStack py={16} gap={3}>
            <Text color="red.600">Failed to load products.</Text>
            <Text
              as="button"
              onClick={retry}
              color="brand.700"
              fontWeight="semibold"
              textDecoration="underline"
            >
              Try again
            </Text>
          </VStack>
        ) : items.length === 0 ? (
          <VStack py={16}>
            <Text color="fg.muted">No products found.</Text>
          </VStack>
        ) : (
          <React.Fragment>
            <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={{ base: 3, md: 5 }}>
              {items.map((item) => (
                <ProductCard
                  key={item._id}
                  item={item}
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </SimpleGrid>
            {hasMore && (
              <Box ref={sentinelRef} h="1px" />
            )}
            {loadingMore && (
              <SimpleGrid columns={{ base: 2, sm: 3, md: 4, lg: 5 }} gap={{ base: 3, md: 5 }} mt={5}>
                {Array.from({ length: 5 }).map((_unused, i) => (
                  <Skeleton key={i} h="260px" borderRadius="l3" />
                ))}
              </SimpleGrid>
            )}
          </React.Fragment>
        )}
      </Box>

      {selectedItem && (
        <ProductModal item={selectedItem} onClose={() => setSelectedItem(undefined)} />
      )}

      <ContactBubbles
        whatsappNumber={shop.whatsappNumber}
        contactEmail={shop.contactEmail}
        shopName={shop.name}
      />
    </Box>
  );
};

export default Storefront;
